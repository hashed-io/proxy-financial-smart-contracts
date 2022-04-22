
# Commands to deploy the smart contracts into the TLOS mainnet
## budget contract

echo 'budget contract'
cleos -u https://api.telosfoundation.io get abi pxbud.sh


## accounts contract

echo 'accounts contract'
cleos -u https://api.telosfoundation.io get abi pxact.sh


## permissions contract

echo 'permissions contract'
cleos -u https://api.telosfoundation.io get abi pxperm.sh


## transactions contract

echo 'transactions contract'
cleos -u https://api.telosfoundation.io get abi pxtrx.sh

## projects contract

echo 'projects contract'
cleos -u https://api.telosfoundation.io get abi pxprj.sh