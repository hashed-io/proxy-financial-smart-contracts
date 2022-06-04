echo "Projects smart contract"

echo "Projects projects table"
cleos -u https://test.telos.kitchen get table proxyv3prjct proxyv3prjct projects

echo "Projects user table"
cleos -u https://test.telos.kitchen get table proxyv3prjct proxyv3prjct users

echo "Projects entities table"
cleos -u https://test.telos.kitchen get table proxyv3prjct proxyv3prjct entities

echo "Projects transfers table"
cleos -u https://test.telos.kitchen get table proxyv3prjct proxyv3prjct transfers

echo "Projects investments table"
cleos -u https://test.telos.kitchen get table proxyv3prjct proxyv3prjct investments


echo "Transfers smart contract"

echo "Transfers accnttrx table"
cleos -u https://test.telos.kitchen get table proxyv3trnsc proxyv3trnsc accnttrx

echo "Transfers accnttypes table"
cleos -u https://test.telos.kitchen get table proxyv3trnsc proxyv3trnsc accnttypes

echo "Transfers accounts table"
cleos -u https://test.telos.kitchen get table proxyv3trnsc proxyv3trnsc accounts

echo "Transfers drawdowns table"
cleos -u https://test.telos.kitchen get table proxyv3trnsc 0 drawdowns

