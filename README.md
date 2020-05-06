# WALLET-CORE

Uses the minimal javascript-libraries

```
{
  "dependencies": {
    "@binance-chain/javascript-sdk": "2.16.4",s
    "bip39": "^3.0.2",
    "bitcoinjs-lib": "5.1.7",
    "cosmos-lib": "^1.1.0",
    "dotenv": "^8.2.0",
    "ethereumjs-util": "^6.2.0",
    "ethereumjs-wallet": "^0.6.3",
    "ethers": "^4.0.47",
    "web3": "^1.2.7",
    "wif": "^2.0.6"
  }
}
```

## To Set Up

```
yarn
```

## To Generate Local Keys

```
node generate.js
```

This will generate a unique (random) mnemonic, and output the following addresses for both TESTNET and MAINET:

* ETH
* BTC
* BNB
* THOR

Save these addresses as `USER_` in the dotenv file. 

Run it again and save these addresses as `VAULT_` in the dotenv file. 

## To test transactions

### Ethereum
Faucet: https://faucet.rinkeby.io/
Place some Eth on the `USER` address. Then run:

```
node eth.js
```

Repeat for mainnet (it will use the same address)

###  Bitcoin
Faucet: https://testnet-faucet.mempool.co/
Find the `TXID` and the `SCRIPTPUBKEY (HEX)` on https://blockstream.info/testnet and add to the dotenv file.

```
node btc.js
```

### BinanceChain
Faucet: https://www.binance.vision/tutorials/binance-dex-funding-your-testnet-account
Fund your Binance Chain account. Then run:

```
node bnb.js
```

## Mainnet

The following can be repeated for MAINNET, setting the `MAINNET` flag in the `main()` function.

