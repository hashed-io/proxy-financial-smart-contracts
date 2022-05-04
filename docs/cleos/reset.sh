cleos -u https://testnet.telos.caleos.io push action proxyv2accnt reset '{}' -p proxyv2accnt@active

cleos -u https://testnet.telos.caleos.io push action proxyv2bdgts reset '{}' -p proxyv2bdgts@active


cleos -u https://testnet.telos.caleos.io push action proxyv2prmss reset '{}' -p proxyv2prmss@active


cleos -u https://testnet.telos.caleos.io push action proxyv2prjct reset '{}' -p proxyv2prjct@active


cleos -u https://testnet.telos.caleos.io push action proxyv2trnsc reset '{}' -p proxyv2trnsc@active


echo 'Init projects and accounts'

cleos -u https://testnet.telos.caleos.io push action proxyv2prjct init '{}' -p proxyv2prjct@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt init '{}' -p proxyv2accnt@active