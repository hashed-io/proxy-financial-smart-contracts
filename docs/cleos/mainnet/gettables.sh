echo "Projects smart contract"

echo "Projects projects table"
cleos -u https://api.telos.kitchen/ get table pxprj.sh pxprj.sh projects

echo "Projects user table"
cleos -u https://api.telos.kitchen/ get table pxprj.sh pxprj.sh users

echo "Projects entities table"
cleos -u https://api.telos.kitchen/ get table pxprj.sh pxprj.sh entities

echo "Projects transfers table"
cleos -u https://api.telos.kitchen/ get table pxprj.sh pxprj.sh transfers

echo "Projects investments table"
cleos -u https://api.telos.kitchen/ get table pxprj.sh pxprj.sh investments


echo "Transfers smart contract"

echo "Transfers accnttrx table"
cleos -u https://api.telos.kitchen/ get table pxtrx.sh pxtrx.sh accnttrx

echo "Transfers accnttypes table"
cleos -u https://api.telos.kitchen/ get table pxtrx.sh pxtrx.sh accnttypes

echo "Transfers accounts table"
cleos -u https://api.telos.kitchen/ get table pxtrx.sh pxtrx.sh accounts

echo "Transfers drawdowns table"
cleos -u https://api.telos.kitchen/ get table pxtrx.sh 0 drawdowns

