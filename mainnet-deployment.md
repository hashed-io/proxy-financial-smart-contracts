
# Commands to deploy the smart contracts into the TLOS mainnet
## budget contract

cleos -u https://api.telosfoundation.io set contract pxbud.sh ./artifacts budgets.wasm budgets.abi -p pxbud.sh@active

cleos -u https://api.telosfoundation.io push action eosio buyrambytes '{"payer":"pxbud.sh", "receiver":"pxbud.sh", "bytes":952000 }' -p pxbud.sh@active

cleos -u https://api.telosfoundation.io get abi pxbud.sh

## accounts contract

cleos -u https://api.telosfoundation.io set contract pxact.sh ./artifacts accounts.wasm accounts.abi -p pxact.sh@active

cleos -u https://api.telosfoundation.io push action eosio buyrambytes '{"payer":"pxbud.sh", "receiver":"pxact.sh", "bytes":1143000 }' -p pxbud.sh@active

cleos -u https://api.telosfoundation.io get abi pxact.sh

## permissions contract

cleos -u https://api.telosfoundation.io set contract pxperm.sh ./artifacts permissions.wasm permissions.abi -p pxperm.sh@active

cleos -u https://api.telosfoundation.io push action eosio buyrambytes '{"payer":"pxbud.sh", "receiver":"pxperm.sh", "bytes":822521 }' -p pxbud.sh@active

cleos -u https://api.telosfoundation.io get abi pxperm.sh

## transactions contract

cleos -u https://api.telosfoundation.io set contract pxtrx.sh ./artifacts transactions.wasm transactions.abi -p pxtrx.sh@active

cleos -u https://api.telosfoundation.io push action eosio buyrambytes '{"payer":"pxbud.sh", "receiver":"pxtrx.sh", "bytes":1025768 }' -p pxbud.sh@active

cleos -u https://api.telosfoundation.io get abi pxtrx.sh

## projects contract

cleos -u https://api.telosfoundation.io set contract pxprj.sh ./artifacts projects.wasm projects.abi -p pxprj.sh@active

cleos -u https://api.telosfoundation.io push action eosio buyrambytes '{"payer":"pxbud.sh", "receiver":"pxprj.sh", "bytes":1620893 }' -p pxbud.sh@active

cleos -u https://api.telosfoundation.io get abi pxprj.sh

1642769 - 21876