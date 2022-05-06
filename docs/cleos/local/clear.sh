# Commands to deploy the smart contracts into the TLOS mainnet
echo "Clear budget contract"
cleos set contract --clear proxyv2bdgts -p proxyv2bdgts@active

echo "Clear accounts contract"
cleos set contract --clear proxyv2accnt -p proxyv2accnt@active

echo "Clear permissions contract"
cleos set contract --clear proxyv2prmss -p proxyv2prmss@active

echo "Clear transactions contract"
cleos set contract --clear proxyv3trnsc -p proxyv3trnsc@active

echo "Clear projects contract"
cleos set contract --clear proxyv3prjct -p proxyv3prjct@active