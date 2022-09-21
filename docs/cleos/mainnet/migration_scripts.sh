echo "# Running migrations"

echo 'Init projects and accounts'

echo 'Initaccounts'
cleos -u https://api.telos.kitchen/ push action pxact.sh init '{}' -p pxact.sh@active

echo 'Init projects'
cleos -u https://api.telos.kitchen/ push action pxprj.sh init '{}' -p pxprj.sh@active


echo 'Adding proxy project'

cleos -u https://api.telos.kitchen/ push action pxprj.sh migration '{}' -p pxprj.sh@active

echo 'Updating accounts'


cleos -u https://api.telos.kitchen/ push action pxact.sh editaccount '{
  "actor" : "proxy.gm",
  "project_id" : "0",
  "account_id" : "4",
  "account_name" : "Furniture, Fixtures & Equipment Purchases",
  "description" : "Children account",
  "account_category" : "2",
  "budget_amount" : "16002474.00 USD",
  "naics_code" : "4232",
  "jobs_multiplier" : "59169"
}' -p pxact.sh@active

cleos -u https://api.telos.kitchen/ push action pxact.sh editaccount '{
  "actor" : "proxy.gm",
  "project_id" : "0",
  "account_id" : "3",
  "account_name" : "Construction",
  "description" : "Children account",
  "account_category" : "2",
  "budget_amount" : "136210049.00 USD",
  "naics_code" : "2362",
  "jobs_multiplier" : "138432"
}' -p pxact.sh@active

cleos -u https://api.telos.kitchen/ push action pxact.sh editaccount '{
  "actor" : "proxy.gm",
  "project_id" : "0",
  "account_id" : "6",
  "account_name" : "Architectural, Engineering and Related Services"",
  "description" : "Children account",
  "account_category" : "3",
  "budget_amount" : "16002474.00 USD",
  "naics_code" : "5413",
  "jobs_multiplier" : "133179"
}' -p pxact.sh@active

cleos -u https://api.telos.kitchen/ push action pxact.sh deleteaccnt '{
  "actor" : "proxy.gm",
  "project_id" : "0",
  "account_id" : "6"
}' -p pxact.sh@active

cleos -u https://api.telos.kitchen/ push action pxact.sh deleteaccnt '{
  "actor" : "proxy.gm",
  "project_id" : "0",
  "account_id" : "21"
}' -p pxact.sh@active

cleos -u https://api.telos.kitchen/ push action pxact.sh deleteaccnt '{
  "actor" : "proxy.gm",
  "project_id" : "0",
  "account_id" : "9"
}' -p pxact.sh@active

cleos -u https://api.telos.kitchen/ push action pxact.sh deleteaccnt '{
  "actor" : "proxy.gm",
  "project_id" : "0",
  "account_id" : "17"
}' -p pxact.sh@active