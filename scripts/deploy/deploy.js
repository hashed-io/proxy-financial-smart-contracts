require('dotenv').config()

const { names, accounts, keyProvider } = require('../helper')
const fs = require('fs')

let existing_accounts = require('../accounts.json')

function ownerNotExistError (err) {
    return (JSON.parse(err).error.code === 3040000)
}

let deploy = async function (eoslime, deployer) {

    let owner = eoslime.Account.load('owner', process.env.LOCAL_PRIVATE_KEY)
    const accounts_names = Object.keys(names)

    for (let i = 0; i < accounts_names.length; i++) {
        if (accounts_names[i] !== 'owner') {
            try {
                console.log('creating:', accounts[accounts_names[i]].account)
                deployer = await eoslime.Account.createFromName(accounts[accounts_names[i]].account, owner)
                existing_accounts[accounts[accounts_names[i]].account] = {
                    privateKey: deployer.privateKey,
                    publicKey: deployer.publicKey
                }
                console.log('successfully created', existing_accounts[accounts[accounts_names[i]].account])
            } catch (err) {
                if (ownerNotExistError(err)) {
                    console.log('the owner account shold exist to deploy the rest of accounts')
                    return process.exit(-1)
                }
                console.log(accounts[accounts_names[i]].account, 'already exists')
            }

            try {
                if (accounts[accounts_names[i]].type === 'contract') {
                    console.log('deploying:', accounts[accounts_names[i]].account)
                    deployer = eoslime.Account.load(accounts[accounts_names[i]].account, existing_accounts[accounts[accounts_names[i]].account].privateKey)
                    await eoslime.Contract.deployOnAccount('./artifacts/'+accounts_names[i]+'.wasm', './artifacts/'+accounts_names[i]+'.abi', deployer)
                    console.log(accounts[accounts_names[i]].account, 'successfully deployed')
                }
            } catch (err) {
                console.log('could not deploy ' + accounts[accounts_names[i]].account + ': ', err)
            }
        }
    }

    fs.writeFile('./scripts/accounts.json', JSON.stringify(existing_accounts), (err) => {
        if(err) throw err
    })

}

module.exports = deploy;