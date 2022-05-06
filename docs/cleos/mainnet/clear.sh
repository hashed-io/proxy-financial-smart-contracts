# Commands to deploy the smart contracts into the TLOS mainnet
echo "Clear budget contract"
cleos -u https://api.telos.kitchen set contract --clear pxbud.sh -p pxbud.sh@active

echo "Clear accounts contract"
cleos -u https://api.telos.kitchen set contract --clear pxact.sh -p pxact.sh@active

echo "Clear permissions contract"
cleos -u https://api.telos.kitchen set contract --clear pxperm.sh -p pxperm.sh@active

echo "Clear transactions contract"
cleos -u https://api.telos.kitchen set contract --clear pxtrx.sh -p pxtrx.sh@active

echo "Clear projects contract"
cleos -u https://api.telos.kitchen set contract --clear pxprj.sh -p pxprj.sh@active