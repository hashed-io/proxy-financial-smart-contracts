### Compiler Setup in .env file

The COMPILER variable can either be docker or local - if you have eos-cpp installed on your local machine you can use local, if you want to use a docker container make sure docker is running and it'll do everything for you.

### Tools Setup

```
npm install
npm install -g eoslime
```

# Deploy Tools

Use npm run to compile, deploy, test:

 * Compile all the contracts. They will be stored in the artifacts directory

```
npm run compile
```

 * Deploy all the contracts and create the permissions.
 * To chose a block chain (local or testnet) set the variable EOSIO_NETWORK to "local" or "telosTestnet" in the .env file.
 * The permissions and other configurations are in the helper.js file.

```
npm run deploy
```

* Test all the contracts. It will just work on the local node.
```
npm run test
```
