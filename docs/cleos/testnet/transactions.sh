cleos -u https://testnet.telos.caleos.io push action proxyv2trnsc transacts '{
  "actor": "builderuser1",
  "project_id": 0,
  "drawdown_id": 2,
  "transactions": [
    {
      "id": 0,
      "date": 1636610400,
      "amounts": [
        {
          "account_id": 6,
          "amount": 10
        },
        {
          "account_id": 6,
          "amount": -10
        }
      ],
      "description": "lorem",
      "supporting_files": [
        {
          "filename": "holi",
          "address": "here"
        }
      ],
      "flag": 1
    },
    {
      "id": 0,
      "date": 1636610400,
      "amounts": [
        {
          "account_id": 7,
          "amount": 10
        },
        {
          "account_id": 7,
          "amount": -10
        }
      ],
      "description": "lorem",
      "supporting_files": [
        {
          "filename": "holi",
          "address": "here"
        }
      ],
      "flag": 1
    }
  ]
}' -p builderuser1@active