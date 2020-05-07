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
const getAddress = () => {
    buffer = BIP39.mnemonicToSeedSync(phrase)
    const wif = WIF.encode(netConfig.bitcoin.network.wif, buffer, true);
    btcKeys = Bitcoin.ECPair.fromWIF(wif, netConfig.bitcoin.network);
    const { address } = Bitcoin.payments.p2wpkh({pubkey: btcKeys.publicKey, network: netConfig.bitcoin.network});
    console.log("btc:", address)
    return address
}

const validateAddress = (address) => {
    try {
        Bitcoin.address.toOutputScript(address, netConfig.bitcoin.network)
        console.log("%s is a valid address", address)
        return true
    }
    catch(error) {
        console.log("%s is not valid", address)
        return false
    }
}

// Generates a valid transaction hex to broadcast
const vaultTx = async (addressTo, valueOut, memo) => {
    const data = Buffer.from(memo, 'utf8');                                     // converts MEMO to buffer
    let OP_RETURN = Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, data])   // Compile OP_RETURN script
    let witness = {script: Buffer.from(script, 'hex'), value: valueIn};         // Creates witness {script, valueIn}

    const psbt = new Bitcoin.Psbt({ network: netConfig.bitcoin.network })       // Network-specific
      .addInput({ hash: utxo, index:0, witnessUtxo:witness})                    // Add input {hash, index, witness}
      //.addOutput({ address: address, value: change})                        // Add output {address, value}
      .addOutput({ address: addressTo, value: valueOut})                        // Add output {address, value}
      .addOutput({script: OP_RETURN, value:0})                                  // Add OP_RETURN {script, value}
      .signInput(0, btcKeys);                                                   // Sign input0 with key-pair

    //console.log('valid psbt', psbt.validateSignaturesOfInput(0));               // Should be true
    psbt.finalizeAllInputs();                                                   // Finalise inputs
    const tx = psbt.extractTransaction();                                       // TX can be extracted in JSON
    //console.log(tx)
    console.log(tx.toHex())                                                     // TX can be converted to HEX
    return tx.toHex()
}

// Generates a valid transaction hex to broadcast
const normalTx = async (addressTo, valueOut) => {
    let witness = {script: Buffer.from(script, 'hex'), value: valueIn};         // Creates witness {script, valueIn}

    const psbt = new Bitcoin.Psbt({ network: netConfig.bitcoin.network })       // Network-specific
      .addInput({ hash: utxo, index:0, witnessUtxo:witness})                    // Add input {hash, index, witness}
      //.addOutput({ address: address, value: change})                        // Add output {address, value}
      .addOutput({ address: addressTo, value: valueOut})                        // Add output {address, value}
      .signInput(0, btcKeys);                                                   // Sign input0 with key-pair

    //console.log('valid psbt', psbt.validateSignaturesOfInput(0));               // Should be true
    psbt.finalizeAllInputs();                                                   // Finalise inputs
    const tx = psbt.extractTransaction();                                       // TX can be extracted in JSON
    //console.log(tx)
    console.log(tx.toHex())                                                     // TX can be converted to HEX
    return tx.toHex()
}

const main = async () => {
    console.log("Setting Net")
    await setNet('TESTNET')             // TESTNET or MAINNET

    console.log('\n', "Getting address from USER_PHRASE")
    getAddress()

    console.log('\n', "Valdating address from USER_PHRASE")
    validateAddress(process.env.VAULT_BTC)

    console.log('\n', "Getting signed vault transaction.")
    console.log("AddressTo: %s, Value: %s, Memo: %s", process.env.VAULT_BTC, valueOut, MEMO)
    vaultTx(process.env.VAULT_BTC, valueOut, MEMO)

    console.log('\n', "Getting signed normal transaction.")
    console.log("AddressTo: %s, Value: %s", process.env.VAULT_BTC, valueOut)
    normalTx(process.env.VAULT_BTC, valueOut)
}

main()