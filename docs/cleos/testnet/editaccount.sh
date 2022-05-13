echo 'Hard cost accounts'

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "3",
  "account_name" : "Construction",
  "description" : "template descripion",
  "account_category" : "2",
  "budget_amount" : "2560.00 USD",
  "naics_code" : "511",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "4",
  "account_name" : "Furniture, Fixtures & Allowance",
  "description" : "template descripion",
  "account_category" : "2",
  "budget_amount" : "12384.00 USD",
  "naics_code" : "982",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "5",
  "account_name" : "Hard Cost contingency & Allowance",
  "description" : "template descripion",
  "account_category" : "2",
  "budget_amount" : "1000.00 USD",
  "naics_code" : "265",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

echo 'Soft cost accounts'

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "6",
  "account_name" : "Architect & Design",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "8950.00 USD",
  "naics_code" : "974",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "7",
  "account_name" : "Building Permits & Impact Fees",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "5680.00 USD",
  "naics_code" : "581",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "8",
  "account_name" : "Developer Reimbursable",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "9813.00 USD",
  "naics_code" : "985",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "9",
  "account_name" : "Builder Risk Insurance",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "9850.00 USD",
  "naics_code" : "014",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "10",
  "account_name" : "Environment / Soils / Survey",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "99800.00 USD",
  "naics_code" : "254",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "11",
  "account_name" :  "Testing & Inspections",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "1200.00 USD",
  "naics_code" : "985",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "12",
  "account_name" :  "Legal & Professional",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "6500.00 USD",
  "naics_code" : "360",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "13",
  "account_name" :  "Real Estate Taxes & Owners Liability Insurance",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "9800.00 USD",
  "naics_code" : "980",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "14",
  "account_name" : "Pre - Development Fee",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "7800.00 USD",
  "naics_code" : "314",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "15",
  "account_name" : "Equity Management Fee",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "95800.00 USD",
  "naics_code" : "215",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "16",
  "account_name" : "Bank Origination Fee",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "1250.00 USD",
  "naics_code" : "985",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "17",
  "account_name" :  "Lender Debt Placement Fee",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "3650.00 USD",
  "naics_code" : "630",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "18",
  "account_name" :  "Title, Appraisal, Feasibility, Plan Review & Closing",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "6590.00 USD",
  "naics_code" : "111",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "19",
  "account_name" :  "Interest Carry during Construction",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "7890.00 USD",
  "naics_code" : "589",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "20",
  "account_name" :  "Ops Stabilization & Interest Carry Reserve",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "12385.00 USD",
  "naics_code" : "997",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "21",
  "account_name" :  "Sales & Marketing",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "585.00 USD",
  "naics_code" : "911",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "22",
  "account_name" :  "Pre - Opening Expenses",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "100.00 USD",
  "naics_code" : "253",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active

cleos -u https://testnet.telos.caleos.io push action proxyv2accnt editaccount '{
  "actor" : "proxyadmin11",
  "project_id" : "0",
  "account_id" : "23",
  "account_name" :  "Contingency",
  "description" : "template descripion",
  "account_category" : "3",
  "budget_amount" : "90.00 USD",
  "naics_code" : "411",
  "jobs_multiplier" : "52448"
}' -p proxyadmin11@active