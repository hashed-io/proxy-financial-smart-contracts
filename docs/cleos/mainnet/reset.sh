
echo 'Reset of: proxyv2accnt'
cleos -u https://api.telos.kitchen/ push action pxact.sh reset '{}' -p pxact.sh@active

echo 'Reset of: proxyv2bdgts'
cleos -u https://api.telos.kitchen/ push action pxbud.sh reset '{}' -p pxbud.sh@active


echo 'Reset of: proxyv2prmss'
cleos -u https://api.telos.kitchen/ push action pxperm.sh reset '{}' -p pxperm.sh@active


echo 'Reset of: proxyv3prjct'
cleos -u https://api.telos.kitchen/ push action pxprj.sh reset '{}' -p pxprj.sh@active


echo 'Reset of: proxyv3trnsc'
cleos -u https://api.telos.kitchen/ push action pxtrx.sh reset '{}' -p pxtrx.sh@active