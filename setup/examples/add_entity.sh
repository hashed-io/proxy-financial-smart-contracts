cleos -u https://api.telos.kitchen/ push action pxprj.sh addentity '{ 
  "actor" : "pxprj.sh",
  "entity_name" : "Hashed Fund Entity",
  "description" : "A test entity for Fund",
  "type" : "Fund" ,
 }' -p pxprj.sh

cleos -u https://api.telos.kitchen/ push action pxprj.sh addentity '{ 
  "actor" : "pxprj.sh",
  "entity_name" : "Hashed Investor Entity",
  "description" : "A test entity for Investor",
  "type" : "Investor" ,
 }' -p pxprj.sh

cleos -u https://api.telos.kitchen/ push action pxprj.sh addentity '{ 
  "actor" : "pxprj.sh",
  "entity_name" : "Hashed Developer Entity",
  "description" : "A test entity for Developer",
  "type" : "Developer" ,
 }' -p pxprj.sh


cleos -u https://api.telos.kitchen/ push action pxprj.sh addtestuser '{ 
  "user" : "proxyadmin11",
  "user_name" : "Hashed Fund",
  "entity_id" : "4",
 }' -p pxprj.sh

cleos -u https://api.telos.kitchen/ push action pxprj.sh addtestuser '{ 
  "user" : "proxyinvestr",
  "user_name" : "Hashed Investor",
  "entity_id" : "5",
 }' -p pxprj.sh

cleos -u https://api.telos.kitchen/ push action pxprj.sh addtestuser '{ 
  "user" : "proxybuilder",
  "user_name" : "Hashed Developer",
  "entity_id" : "6",
 }' -p pxprj.sh