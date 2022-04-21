cleos -u https://telos.greymass.com push transaction '{
  "delay_sec":0,
  "actions":[
    {
      "account":"eosio",
      "name":"newaccount",
      "data":{
        "creator":"pxact.sh",
        "name":"proxyinvestr",
        "owner":{
          "accounts":[],
          "keys":[{"key":"EOS5W3MQZigLJCad2FaXLktYuaHEXZRceXoEJuVDK98WkWDHvL1D2","weight":1}],
          "waits":[],
          "threshold":1
          },
        "active":{
          "accounts":[],
          "keys":[{"key":"EOS5W3MQZigLJCad2FaXLktYuaHEXZRceXoEJuVDK98WkWDHvL1D2","weight":1}],
          "waits":[],
          "threshold":1
          }
      },
      "authorization":[{"actor":"pxact.sh","permission":"active"}]},
    {"account":"eosio","name":"buyrambytes","data":{"payer":"pxact.sh","receiver":"proxyinvestr","bytes":4000},"authorization":[{"actor":"pxact.sh","permission":"active"}]},
    {"account":"eosio","name":"delegatebw","data":{"from":"pxact.sh","receiver":"proxyinvestr","stake_net_quantity":"0.0500 TLOS","stake_cpu_quantity":"1.0000 TLOS","transfer":true},"authorization":[{"actor":"pxact.sh","permission":"active"}]}]}'