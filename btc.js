require('dotenv').config()
const BIP39 = require('bip39')            // https://github.com/bitcoinjs/bip39
const Bitcoin = require('bitcoinjs-lib')  // https://github.com/bitcoinjs/bitcoinjs-lib
const WIF = require('wif')                // https://github.com/bitcoinjs/wif

// Customise the following as well as the .env file to make it work
// Use this to help: https://blockstream.info/testnet, https://testnet-faucet.mempool.co/
const phrase = process.env.USER_PHRASE;
const script = process.env.UTXO_SCRIPT;
const utxo = process.env.UTXO_TXID;
const valueIn = 10000; const valueOut = 9500;
const addressTo = process.env.VAULT_BTC
const MEMO = 'SWAP:THOR.RUNE'

// Variables
var buffer; var btcKeys; 
var netConfig = {
    'bitcoin':{
        'network': ""
    }
}

// Sets the network for reference later
const setNet = async (_net)  =>{
    if(_net=='TESTNET'){
        netConfig = {
            'bitcoin':{
                'network': Bitcoin.networks.testnet
            }
        }
    } else {
        netConfig = {
            'bitcoin':{
                'network': Bitcoin.networks.bitcoin
            }
        }
    }
}

// Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
// The address is then decoded into type P2PWPK
const getBtc = () => {
    buffer = BIP39.mnemonicToSeedSync(phrase)
    const wif = WIF.encode(netConfig.bitcoin.network.wif, buffer, true);
    btcKeys = Bitcoin.ECPair.fromWIF(wif, netConfig.bitcoin.network);
    const { address } = Bitcoin.payments.p2wpkh({pubkey: btcKeys.publicKey, network: netConfig.bitcoin.network});
    console.log("btc:", address)
}

// Generates a valid transaction hex to broadcast
const signPsbt = async () => {
    const data = Buffer.from(MEMO, 'utf8');                                     // converts MEMO to buffer
    let OP_RETURN = Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, data])   // Compile OP_RETURN script
    let witness = {script: Buffer.from(script, 'hex'), value: valueIn};         // Creates witness {script, valueIn}

    const psbt = new Bitcoin.Psbt({ network: netConfig.bitcoin.network })       // Network-specific
      .addInput({ hash: utxo, index:0, witnessUtxo:witness})                    // Add input {hash, index, witness}
      //.addOutput({ address: address, value: change})                        // Add output {address, value}
      .addOutput({ address: addressTo, value: valueOut})                        // Add output {address, value}
      .addOutput({script: OP_RETURN, value:0})                                  // Add OP_RETURN {script, value}
      .signInput(0, btcKeys);                                                   // Sign input0 with key-pair

    console.log('valid psbt', psbt.validateSignaturesOfInput(0));               // Should be true
    psbt.finalizeAllInputs();                                                   // Finalise inputs
    const tx = psbt.extractTransaction();                                       // TX can be extracted in JSON
    console.log(tx)
    console.log(tx.toHex())                                                     // TX can be converted to HEX
}

const main = async () => {
    generateKey()
    await setNet('TESTNET')             // TESTNET or MAINNET
    getBtc()
    signPsbt()
}

main()