echo "Reseting: pxbud.sh"
cleos -u https://api.telos.kitchen push action pxbud.sh clear '{}' -p pxbud.sh@active

echo "Reseting: pxact.sh"
cleos -u https://api.telos.kitchen push action pxact.sh clear '{}' -p pxact.sh@active

echo "Reseting: pxperm.sh"
cleos -u https://api.telos.kitchen push action pxperm.sh clear '{}' -p pxperm.sh@active

echo "Reseting: pxtrx.sh"
cleos -u https://api.telos.kitchen push action pxtrx.sh clear '{}' -p pxtrx.sh@active

echo "Reseting: pxprj.sh"
cleos -u https://api.telos.kitchen push action pxprj.sh clear '{}' -p pxprj.sh@active