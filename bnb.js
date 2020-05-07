require('dotenv').config()
const BNBClient = require('@binance-chain/javascript-sdk')   //https://github.com/binance-chain/javascript-sdk

// Customise this to build the transaction you want. Must have funds on it. 
const phrase = process.env.USER_PHRASE
const amount = 1000/100000000; const asset = 'BNB'
const addressTo = process.env.VAULT_MAIN_BNB
const MEMO = 'SWAP:THOR.RUNE'

// Variables
var address; var privateKey;
var netConfig = {'binanceChain':{'api':"",'prefix':""}}

// Sets the network for reference later
const setNet = (_net) => {
    if(_net=='TESTNET'){
        netConfig = {
            'binanceChain':{
                'api': 'https://testnet-dex.binance.org/',
                'prefix':'tbnb',
                'chain':'testnet'
            }
        }
    } else {
        netConfig = {
            'binanceChain':{
                'api': 'https://dex.binance.org/',
                'prefix':'bnb',
                'chain':'mainnet'
            }
        }
    }
}

// Gets the address
const getBnb = async () => {
    console.log(phrase)
    console.log('valid binance chain mnemonic?', BNBClient.crypto.validateMnemonic(phrase))         // Check
    privateKey = BNBClient.crypto.getPrivateKeyFromMnemonic(phrase)                                 // Extract private key
    address = BNBClient.crypto.getAddressFromPrivateKey(privateKey, netConfig.binanceChain.prefix)  // Extract address with prefix
    console.log("bnb:", address)
}

// Signs and sends a transaction
const signBnb = async() => {
    client = new BNBClient(netConfig.binanceChain.api)                                              // 
    client.chooseNetwork(netConfig.binanceChain.chain);
    client.initChain()
    client.setPrivateKey(privateKey)
    const account = await client.getAccount(address)
    const tx = await client.transfer(address, addressTo, amount, asset, MEMO, account.sequence)
    console.log(tx)
}

const main = async () => {
    setNet('MAINNET')             // TESTNET or MAINNET
    getAddress()
    validateAddress()
    vaultTx("MEMO")
    normalTx("address", "value", "MEMO")
}

main()