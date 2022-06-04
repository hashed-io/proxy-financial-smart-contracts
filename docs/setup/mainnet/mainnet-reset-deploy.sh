
# Commands to deploy the smart contracts into the TLOS mainnet
## budget contract

echo 'budget contract'
cleos -u https://api.telosfoundation.io set contract --clear pxbud.sh ./artifacts budgets.wasm budgets.abi -p pxbud.sh@active
cleos -u https://api.telosfoundation.io set contract pxbud.sh ./artifacts budgets.wasm budgets.abi -p pxbud.sh@active


## accounts contract

echo 'accounts contract'
cleos -u https://api.telosfoundation.io set contract --clear pxact.sh ./artifacts accounts.wasm accounts.abi -p pxact.sh@active
cleos -u https://api.telosfoundation.io set contract pxact.sh ./artifacts accounts.wasm accounts.abi -p pxact.sh@active


## permissions contract

echo 'permissions contract'
cleos -u https://api.telosfoundation.io set contract --clear pxperm.sh ./artifacts permissions.wasm permissions.abi -p pxperm.sh@active
cleos -u https://api.telosfoundation.io set contract pxperm.sh ./artifacts permissions.wasm permissions.abi -p pxperm.sh@active


## transactions contract

echo 'transactions contract'
cleos -u https://api.telosfoundation.io set contract --clear pxtrx.sh ./artifacts transactions.wasm transactions.abi -p pxtrx.sh@active
cleos -u https://api.telosfoundation.io set contract pxtrx.sh ./artifacts transactions.wasm transactions.abi -p pxtrx.sh@active

## projects contract

echo 'projects contract'
cleos -u https://api.telosfoundation.io set contract --clear pxprj.sh ./artifacts projects.wasm projects.abi -p pxprj.sh@active
cleos -u https://api.telosfoundation.io set contract pxprj.sh ./artifacts projects.wasm projects.abi -p pxprj.sh@active

## reset contracts

echo 'setup projects contract'
cleos -u https://api.telosfoundation.io push action pxprj.sh reset '[]' pxprj.sh@active
cleos -u https://api.telosfoundation.io push action pxprj.sh testsetup '[]' pxprj.sh@active

