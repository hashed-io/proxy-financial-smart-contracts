require('dotenv').config()

const { names, accounts } = require('../helper')
const fs = require('fs')

const TOKEN_WASM_PATH = './artifacts/transactions.wasm';
const TOKEN_ABI_PATH = './artifacts/transactions.abi';

let existing_accounts = require('../accounts.json')

let deploy = async function (eoslime, deployer) {

    let owner = eoslime.Account.load('owner', process.env.LOCAL_PRIVATE_KEY)
    const accounts_names = Object.keys(names)

    for (let i = 0; i < accounts_names.length; i++) {
        if (accounts_names[i] !== 'owner') {
            try {
                deployer = await eoslime.Account.createFromName(accounts_names[i], owner)
                existing_accounts[accounts_names[i]] = {
                    privateKey: deployer.privateKey,
                    publicKey: deployer.publicKey
                }
                console.log(existing_accounts[accounts_names[i]])
            } catch (err) {
                console.log(accounts_names[i], 'already exists.')
                console.log(existing_accounts[accounts_names[i]])
            }

            try {
                if (accounts[accounts_names[i]].type === 'contract') {
                    deployer = eoslime.Account.load(accounts_names[i], existing_accounts[accounts_names[i]].privateKey)
                    await eoslime.Contract.deployOnAccount('./artifacts/'+accounts_names[i]+'.wasm', './artifacts/'+accounts_names[i]+'.abi', deployer)
                }
            }
            catch (err) {
                console.log('could not deploy contract: ', err)
            }
        }
    }

    fs.writeFile('./scripts/account.json', JSON.stringify(existing_accounts), (err) => {
        if(err) throw err
    })

}

module.exports = deploy;