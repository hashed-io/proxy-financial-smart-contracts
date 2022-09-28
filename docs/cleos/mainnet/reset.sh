
echo 'Reset of: pxact.sh'
cleos -u https://api.telos.kitchen/ push action pxact.sh reset '{}' -p pxact.sh@active

echo 'Reset of: pxbud.sh'
cleos -u https://api.telos.kitchen/ push action pxbud.sh reset '{}' -p pxbud.sh@active


echo 'Reset of: pxperm.sh'
cleos -u https://api.telos.kitchen/ push action pxperm.sh reset '{}' -p pxperm.sh@active


echo 'Reset of: pxprj.sh'
cleos -u https://api.telos.kitchen/ push action pxprj.sh reset '{}' -p pxprj.sh@active


echo 'Reset of: pxtrx.sh'
cleos -u https://api.telos.kitchen/ push action pxtrx.sh reset '{}' -p pxtrx.sh@active