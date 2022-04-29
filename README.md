# Proxy financial smart contracts

This repository contains the smart contracts for the proxy financial project

Specific documentation can be found at src/ sub folders or in docs/

## Setup

Install the node libraries by running

```bash
npm install
```

To setup the project, clone the .env.example as .env on the same directory

```bash
cp .env.example .env
```

On the .env file you can see several variables, you can customize them as follows

| variable                |              function               |                   possible values |
| ----------------------- | :---------------------------------: | --------------------------------: |
| COMPILER                |  It defines which compiler to use   |                     local, docker |
| CHAIN_NAME              | It defines which endpoint to choose | local, telosTestnet, telosMainnet |
| LOCAL_PRIVATE_KEY       |       EOSIO local private key       |                         eosio key |
| LOCAL_PUBLIC_KEY        |       EOSIO local public key        |                         eosio key |
| TLOSTESTNET_PRIVATE_KEY |   TLOS TESTNET local private key    |                 proxy's admin key |
| TLOSTESTNET_PUBLIC_KEY  |    TLOS TESTNET local public key    |                 proxy's admin key |
| TLOSMAINNET_PUBLIC_KEY  |   TLOS MAINNET local private key    |                 proxy's admin key |
| TLOSMAINNET_PRIVATE_KEY |    TLOS MAINNET local public key    |                 proxy's admin key |

Then you can run the following command to compile the smart contracts

```bash
npm run build
```

this commands just compiles the smart contracts, the wasm and abi files can be found at compiled/

## Test

We used mocha to test the smart contracts, make sure you have compiled them previously, then you can run all the test by running

```bash
npm run test
```

## Deploy

If you want to initialize all the contracts in a given chain (local, testnet...) you can run

```bash
npm run initAll
```

This commands compiles all the smart contracts, then deploys them with the accounts names written on scripts/config.js file, then generates all the permissions needed for the interaction.