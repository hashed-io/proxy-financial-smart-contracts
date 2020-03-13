require('dotenv').config()

const { names, accounts, permissions, networksNames } = require('../helper')
const fs = require('fs')

let existing_accounts


function ownerNotExistError (err) {
    return (JSON.parse(err).error.code === 3040000)
}

async function createPermissions (eoslime) {
    
    for (const permission of permissions) {
        try {
            if (permission.actor) {
                const at_pos = permission.actor.indexOf('@')
                const account_name = permission.actor.substring(0, at_pos)
                const account_permission = permission.actor.substring(at_pos + 1, permission.actor.length)

                const at_pos_target = permission.target.indexOf('@')
                const account_target = permission.target.substring(0, at_pos_target)
                const account = eoslime.Account.load(account_target, existing_accounts[account_target].privateKey)

                await account.addOnBehalfAccount(account_name, account_permission)
                console.log('authority', permission.actor, 'added to', account_target)
            }
        } catch (err) {
            console.log('there was an error while giving permission:', permission, err)
        }   
    }
}


async function deployLocal (eoslime) {
    
    console.log('Deploying on local node')
    console.log(accounts)

    console.log(existing_accounts)

    let owner = eoslime.Account.load(accounts.owner.account, process.env.LOCAL_PRIVATE_KEY)
    const accounts_names = Object.keys(names)
    
    for (let i = 0; i < accounts_names.length; i++) {
        if (accounts_names[i] !== owner.name) {
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

async function deployTestnet (eoslime) {

    console.log('Deploying on Testnet')
    
    let owner = eoslime.Account.load(accounts.owner.account, existing_accounts[accounts.owner.account].privateKey)

    const accounts_names = Object.keys(names)

    for (let i = 0; i < accounts_names.length; i++) {
        console.log(accounts[accounts_names[i]].account)

        try {
            if (accounts[accounts_names[i]].type === 'contract') {
                let deployer = eoslime.Account.load(accounts[accounts_names[i]].account, existing_accounts[accounts[accounts_names[i]].account].privateKey)
                
                console.log('transfer some tokens')
                await owner.send(deployer, '10.0000', 'TLOS')

                console.log('buying cpu and net')
                await deployer.buyBandwidth('5.0000 TLOS', '5.0000 TLOS')

                console.log('buying ram for:', accounts[accounts_names[i]].account)
                await deployer.buyRam(1000000);

                await eoslime.Contract.deployOnAccount('./artifacts/'+accounts_names[i]+'.wasm', './artifacts/'+accounts_names[i]+'.abi', deployer)
                console.log(accounts[accounts_names[i]].account, 'successfully deployed')
            }
        } catch (err) {
            console.log(err)
        }
    }
}



let deploy = async function (eoslime, deployer) {

    if (process.env.EOSIO_NETWORK === networksNames.local) {
        existing_accounts = require('../accounts.json')
        await deployLocal(eoslime)
    } else if (process.env.EOSIO_NETWORK === networksNames.telosTestnet) {
        existing_accounts = require('../testnet_accounts.json')
        await deployTestnet(eoslime)
    }

    console.log('\n\nAdding permissions...')
    createPermissions(eoslime)

}

module.exports = deploy;