require('dotenv').config()
const BIP39 = require('bip39')
const EthUtil = require('ethereumjs-util')
const HDKey = require('ethereumjs-wallet/hdkey')
const Bitcoin = require('bitcoinjs-lib')
const WIF = require('wif')
const BNBClient = require('@binance-chain/javascript-sdk')
const Cosmos = require('cosmos-lib');

const phrase = process.env.USER_PHRASE; 

// Variables
var BIP32RootKey; var buffer; 
var walletKeys = {"eth":"", "btc":"", "bnb":"", "thor":""}
var netConfig = {
    'type':"",
    'bitcoin':{
        'network': ""
    },
    'ethereum':{
        'chain': '',
        'hardfork':''
    },
    'binanceChain':{
        'api': '',
        'prefix':'',
        'chain':''
    },
    'thorchain':{
        'prefix':''
    }
}

// Set chain-specific network config
const setNet = async (net)  =>{
    if(net=='TESTNET'){
        netConfig = {
            'type':"TESTNET",
            'bitcoin':{
                'network': Bitcoin.networks.testnet
            },
            'ethereum':{
                'chain': 'rinkeby',
                'hardfork':'petersburg'
            },
            'binanceChain':{
                'api': 'https://testnet-dex.binance.org/',
                'prefix':'tbnb',
                'chain':'testnet'
            },
            'thorchain':{
                'prefix':'tthor'
            }
        }
    } else {
        netConfig = {
            'type':"MAINNET",
            'bitcoin':{
                'network': Bitcoin.networks.bitcoin
            },
            'ethereum':{
                'chain': 'homestead',
                'hardfork':'petersburg'
            },
            'binanceChain':{
                'api': 'https://dex.binance.org/',
                'prefix':'bnb',
                'chain':'mainnet'
            },
            'thorchain':{
                'prefix':'thor'
            }
        }
    }
}

// Get Buffer and Rootkey
const getKey = () => {
    const phrase = BIP39.generateMnemonic()
    console.log("The phrase is:", phrase)
    buffer = BIP39.mnemonicToSeedSync(phrase)
    BIP32RootKey = buffer.toString('hex')
    console.log("BIP32RootKey:", BIP32RootKey)
}

// Get Ethereum keys
const getEth = () => {
    const wallet = (HDKey.fromMasterSeed(buffer)).deriveChild(0).getWallet()
    const address = wallet.getAddressString()
    console.log("eth:", address)
    console.log('valid ethereum address?', EthUtil.isValidAddress(address))
    console.log('eth privkey:', wallet.getPrivateKeyString(), '\n')
    walletKeys = {
        "eth":wallet.getPrivateKey(), 
        "btc":walletKeys.btc, 
        "bnb":walletKeys.bnb, 
        "thor":walletKeys.thor
    }
}

// Get Bitcoin keys
const getBtc = () => {
    const wif = WIF.encode(netConfig.bitcoin.network.wif, buffer, true);
    const keyPair = Bitcoin.ECPair.fromWIF(wif, netConfig.bitcoin.network);
    const { address } = Bitcoin.payments.p2wpkh({pubkey: keyPair.publicKey, network: netConfig.bitcoin.network});
    console.log("btc:", address)
    console.log('valid BIP39 mnemonic?', BIP39.validateMnemonic(phrase))
    console.log('btc privkey:', keyPair.privateKey.toString('hex'), '\n')
    walletKeys = {
        "eth":walletKeys.eth, 
        "btc":keyPair, 
        "bnb":walletKeys.bnb, 
        "thor":walletKeys.thor
    }
}

// Get BinanceChain keys
const getBnb = async () => {
    const privateKey = BNBClient.crypto.getPrivateKeyFromMnemonic(phrase)
    const address = BNBClient.crypto.getAddressFromPrivateKey(privateKey, netConfig.binanceChain.prefix)
    console.log("bnb:", address)
    console.log('valid binance chain mnemonic?', BNBClient.crypto.validateMnemonic(phrase))
    console.log('bnb privkey:', privateKey, '\n')
    walletKeys = {
        "eth":walletKeys.eth, 
        "btc":walletKeys.btc, 
        "bnb":privateKey, 
        "thor":walletKeys.thor
    }
}

// Get THORChain keys
const getThor = async () => {
    const keys = Cosmos.crypto.getKeysFromMnemonic(phrase);
    const address = Cosmos.address.getAddress(keys.privateKey, netConfig.thorchain.prefix);
    console.log('thor:', address);
    console.log('thor privkey:', keys.privateKey.toString('hex'), '\n')
    walletKeys = {
        "eth":walletKeys.eth, 
        "btc":walletKeys.btc, 
        "bnb":walletKeys.bnb, 
        "thor":keys
    }
}

const main = async () => {
    getKey()
    console.log('\n', "Generating TESTNET")
    await setNet('TESTNET')
    getEth()
    getBtc() 
    getBnb() 
    getThor()
    console.log('\n', "Generating MAINNET") 
    await setNet('MAINNET')
    getEth()
    getBtc()
    getBnb() 
    getThor()
}

main()