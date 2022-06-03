echo 'Init projects and accounts'

echo 'Initaccounts'
cleos -u https://api.telos.kitchen/ push action pxact.sh init '{}' -p pxact.sh@active

echo 'Init projects'
cleos -u https://api.telos.kitchen/ push action pxprj.sh init '{}' -p pxprj.sh@active