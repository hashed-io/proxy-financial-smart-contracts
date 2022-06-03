echo "Reseting: pxbud.sh"
cleos -u https://api.telos.kitchen push action pxbud.sh reset '{}' -p pxbud.sh@active

echo "Reseting: pxact.sh"
cleos -u https://api.telos.kitchen push action pxact.sh reset '{}' -p pxact.sh@active

echo "Reseting: pxperm.sh"
cleos -u https://api.telos.kitchen push action pxperm.sh reset '{}' -p pxperm.sh@active

echo "Reseting: pxtrx.sh"
cleos -u https://api.telos.kitchen push action pxtrx.sh reset '{}' -p pxtrx.sh@active

echo "Reseting: pxprj.sh"
cleos -u https://api.telos.kitchen push action pxprj.sh reset '{}' -p pxprj.sh@active