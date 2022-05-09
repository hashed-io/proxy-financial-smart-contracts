# Commands to deploy the smart contracts into the TLOS mainnet
## budget contract
cleos -u https://testnet.telos.caleos.io set contract --clear proxyv2bdgts -p proxyv2bdgts@active

## accounts contract
cleos -u https://testnet.telos.caleos.io set contract --clear proxyv2accnt -p proxyv2accnt@active

## permissions contract
cleos -u https://testnet.telos.caleos.io set contract --clear proxyv2prmss  -p proxyv2prmss@active

## transactions contract
cleos -u https://testnet.telos.caleos.io set contract --clear proxyv3trnsc  -p proxyv2trnsc@active

## projects contract
cleos -u https://testnet.telos.caleos.io set contract --clear proxyv3prjct -p proxyv2prjct@active


# cleos -u https://testnet.telos.caleos.io set contract --clear proxyv2bdgts ./artifacts budgets.wasm budgets.abi -p proxyv2bdgts@active

## accounts contract
# cleos -u https://testnet.telos.caleos.io set contract --clear proxyv2accnt ./artifacts accounts.wasm accounts.abi -p proxyv2accnt@active

## permissions contract
# cleos -u https://testnet.telos.caleos.io set contract --clear proxyv2prmss ./artifacts permissions.wasm permissions.abi -p proxyv2prmss@active

## transactions contract
# cleos -u https://testnet.telos.caleos.io set contract --clear proxyv2trnsc ./artifacts transactions.wasm transactions.abi -p proxyv2trnsc@active

## projects contract
# cleos -u https://testnet.telos.caleos.io set contract --clear proxyv2prjct ./artifacts projects.wasm projects.abi -p proxyv2prjct@active
