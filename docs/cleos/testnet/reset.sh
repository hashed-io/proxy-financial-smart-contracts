echo "Reseting: proxyv2accnt"
cleos -u https://test.telos.kitchen push action proxyv2accnt reset '{}' -p proxyv2accnt@active

echo "Reseting: proxyv2bdgts"
cleos -u https://test.telos.kitchen push action proxyv2bdgts reset '{}' -p proxyv2bdgts@active

echo "Reseting: proxyv2prmss"
cleos -u https://test.telos.kitchen push action proxyv2prmss reset '{}' -p proxyv2prmss@active

echo "Reseting: proxyv3prjct"
cleos -u https://test.telos.kitchen push action proxyv3prjct reset '{}' -p proxyv3prjct@active

echo "Reseting: proxyv3trnsc"
cleos -u https://test.telos.kitchen push action proxyv3trnsc reset '{}' -p proxyv3trnsc@active