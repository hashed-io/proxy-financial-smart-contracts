# Commands to deploy the smart contracts into the TLOS mainnet
## budget contract

cleos -u https://testnet.telos.caleos.io set contract proxyv1bdgts ./compiled budgets.wasm budgets.abi -p proxyv1bdgts@active

## accounts contract

cleos -u https://testnet.telos.caleos.io set contract proxyv1accnt ./compiled accounts.wasm accounts.abi -p proxyv1accnt@active

## permissions contract

cleos -u https://testnet.telos.caleos.io set contract proxyv1prmss ./compiled permissions.wasm permissions.abi -p proxyv1prmss@active

## transactions contract

cleos -u https://testnet.telos.caleos.io set contract proxyv1trnsc ./compiled transactions.wasm transactions.abi -p proxyv1trnsc@active

## projects contract

cleos -u https://testnet.telos.caleos.io set contract proxyv1prjct ./compiled projects.wasm projects.abi -p proxyv1prjct@active