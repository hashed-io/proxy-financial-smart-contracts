echo 'Init projects and accounts'

echo 'Init projects'
cleos -u https://test.telos.kitchen push action proxyv3prjct init '{}' -p proxyv3prjct@active

echo 'Initaccounts'
cleos -u https://test.telos.kitchen push action proxyv2accnt init '{}' -p proxyv2accnt@active