require('dotenv').config()
const BIP39 = require('bip39')            // https://github.com/bitcoinjs/bip39
const Ethers = require('ethers');
const HDKey = require('ethereumjs-wallet/hdkey')

// Customise this to build the transaction you want. Must have funds on it. 
const phrase = process.env.USER_PHRASE
const amount = 100000000;
const addressTo = process.env.VAULT_MAIN_ETH
const MEMO = 'SWAP:THOR.RUNE'

// Variables
var address; var privateKey;
var netConfig = {'ethereum':{'chain':"",'hardfork':""}}

// Sets the network for reference later
const setNet = (_net) => {
    if(_net=='TESTNET'){
        netConfig = {
            'ethereum':{
                'chain': 'rinkeby',
                'hardfork':'petersburg'
            }
        }
    } else {
        netConfig = {
            'ethereum':{
                'chain': 'homestead',
                'hardfork':'petersburg'
            }
        }
    }
}

// Gets the address, saves privateKey 
const getEth = () => {
    buffer = BIP39.mnemonicToSeedSync(phrase)
    const wallet = (HDKey.fromMasterSeed(buffer)).deriveChild(0).getWallet()        // Uses HDKey to interpret phrase
    privateKey = wallet.getPrivateKey()
    address = wallet.getAddressString()
    console.log("eth:", address)
}

// Signs and sends a transaction
const signEth = async () => {
    const txParams = {to: addressTo, value: amount, data: Buffer.from(MEMO,'utf8')} // Builds a transaction
    let provider = Ethers.getDefaultProvider(netConfig.ethereum.chain);             // Sets provider
    let walletWithProvider = new Ethers.Wallet(privateKey, provider);               // Set Wallet
    const txHash = await walletWithProvider.sendTransaction(txParams);              // Sends from wallet
    console.log(txHash.hash)
}

const main = async () => {
    setNet('MAINNET')             // TESTNET or MAINNET
    getEth()
    signEth()
}

main()