
echo 'Reset of: proxyv2accnt'
cleos -u https://test.telos.kitchen push action proxyv2accnt reset '{}' -p proxyv2accnt@active

echo 'Reset of: proxyv2bdgts'
cleos -u https://test.telos.kitchen push action proxyv2bdgts reset '{}' -p proxyv2bdgts@active


echo 'Reset of: proxyv2prmss'
cleos -u https://test.telos.kitchen push action proxyv2prmss reset '{}' -p proxyv2prmss@active


echo 'Reset of: proxyv2prjct'
cleos -u https://test.telos.kitchen push action proxyv3prjct reset '{}' -p proxyv3prjct@active


echo 'Reset of: proxyv2trnsc'
cleos -u https://test.telos.kitchen push action proxyv3trnsc reset '{}' -p proxyv3trnsc@active


# echo 'Init projects and accounts'

cleos -u https://test.telos.kitchen push action proxyv3prjct init '{}' -p proxyv3prjct@active

cleos -u https://test.telos.kitchen push action proxyv2accnt init '{}' -p proxyv2accnt@active