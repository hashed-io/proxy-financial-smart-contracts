echo "Projects smart contract\n\n"

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


echo "\nTransfers smart contract\n\n"

echo "Transfers accnttrx table"
cleos -u https://api.telos.kitchen/ get table pxtrx.sh pxtrx.sh accnttrx

echo "Transfers accnttypes table"
cleos -u https://api.telos.kitchen/ get table pxtrx.sh pxtrx.sh accnttypes

echo "Transfers accounts table"
cleos -u https://api.telos.kitchen/ get table pxtrx.sh pxtrx.sh accounts

echo "Transfers drawdowns table"
cleos -u https://api.telos.kitchen/ get table pxtrx.sh 6 drawdowns

echo "Transfers transactions table"
cleos -u https://api.telos.kitchen/ get table pxtrx.sh 6 transactions

echo "\nBudgets smart contract\n\n"

echo "Budget budgettypes table"
cleos -u https://api.telos.kitchen/ get table pxbud.sh pxbud.sh budgettypes

echo "Budget budgets table"
cleos -u https://api.telos.kitchen/ get table pxbud.sh 6 budgets

echo "Budget budgetpriods table"
cleos -u https://api.telos.kitchen/ get table pxbud.sh 6 budgetpriods


echo "\nAccouts smart contract\n\n"

echo "Accouts accounts table"
cleos -u https://api.telos.kitchen/ get table pxact.sh pxact.sh accnttypes

echo "Accouts ledgers table"
cleos -u https://api.telos.kitchen/ get table pxact.sh 6 ledgers

echo "Accouts accounts table"
cleos -u https://api.telos.kitchen/ get table pxact.sh 6 accounts

echo "\nPermissions smart contract\n\n"

echo "Permissions permissions table"
cleos -u https://api.telos.kitchen/ get table pxperm.sh pxperm.sh permissions

echo "Permissions roles table"
cleos -u https://api.telos.kitchen/ get table pxperm.sh 6 roles

echo "Permissions entities table"
cleos -u https://api.telos.kitchen/ get table pxperm.sh 6 userroles