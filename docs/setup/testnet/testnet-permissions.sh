cleos -u https://testnet.telos.net/ set account permission proxyv1prmss active '{
    "threshold": 1,
    "keys": [{"key": "EOS5b6LikMdy377TFbfGxJHU7BW23JjEYnZDX1GvYXhMMWWAaDKvo","weight": 1}],
    "accounts": [
        {"permission":{"actor":"proxyv1prjct","permission":"active"},"weight":1},
        {"permission":{"actor":"proxyv1trnsc", "permission":"active"},"weight":1},
        {"permission":{"actor":"tlaclocmant1", "permission":"active"},"weight":1},
        {"permission":{"actor":"tlaclocmant2", "permission":"active"},"weight":1}]
    }' owner -p proxyv1prmss@active