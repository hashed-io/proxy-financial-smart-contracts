require('dotenv').config()

const { names, accounts, permissions, networksNames } = require('../helper')
const fs = require('fs')

let existing_accounts


function ownerNotExistError (err) {
    return (JSON.parse(err).error.code === 3040000)
}

function getError (err) {
return JSON.parse(err).error.details[0].message.replace('assertion failure with message: ', '')
}

async function resetAllContracts (eoslime) {
    if (!process.argv.includes('--reset')) {
        return
    }

    console.log('\n\nResetting all the contracts...')

    const accounts_names = Object.keys(names)

    for (let i = 0; i < accounts_names.length; i++) {
        try {
            if (accounts[accounts_names[i]].type === 'contract') {
                try {
                    let account = await eoslime.Account.load(accounts[accounts_names[i]].account, existing_accounts[accounts[accounts_names[i]].account].privateKey, 'active')
                    let contract = await eoslime.Contract.at(accounts[accounts_names[i]].account, account)
            
                    console.log('reset', accounts[accounts_names[i]].account)
                    await contract.reset()
                } catch (err) {
                    if (err.message == "Cannot read property 'privateKey' of undefined") {
                        console.log('The account', accounts[accounts_names[i]].account,'is not in accounts.json')
                    } else {
                        console.log(err.message)
                    }
                }            
            }
        } catch (err) {
            console.log(err)
        }
    }

    console.log('\n\n')
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
                const account = await eoslime.Account.load(account_target, existing_accounts[account_target].privateKey)

                await account.addOnBehalfAccount(account_name, account_permission)
                console.log('authority', permission.actor, 'added to', account_target)
            }
        } catch (err) {
            console.log('there was an error while giving permission:', permission, err)
        }   
    }
}


async function createAccounts (eoslime, owner, accounts_names) {
    
    console.log('Creating accounts in local node')
    
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
                    console.log('the owner account should exist to deploy the rest of accounts')
                    throw err
                }
                console.log(accounts[accounts_names[i]].account, 'already exists')
            }
        }
    }

    fs.writeFileSync('./scripts/accounts.json', JSON.stringify(existing_accounts))

}

async function deployLocal (eoslime) {
    
    let owner = await eoslime.Account.load(accounts.owner.account, process.env.LOCAL_PRIVATE_KEY)
    const accounts_names = Object.keys(names)
    
    await createAccounts(eoslime, owner, accounts_names)

    console.log('Deploying on local node')

    for (let i = 0; i < accounts_names.length; i++) {
        if (accounts_names[i] !== owner.name) {
            try {
                if (accounts[accounts_names[i]].type === 'contract') {
                    console.log(`deploying: account: ${accounts[accounts_names[i]].account}, privateKey: ${existing_accounts[accounts[accounts_names[i]].account].privateKey}`)
                    deployer = eoslime.Account.load(accounts[accounts_names[i]].account, existing_accounts[accounts[accounts_names[i]].account].privateKey)
            
                    await eoslime.Contract.deployOnAccount('./artifacts/'+accounts_names[i]+'.wasm', './artifacts/'+accounts_names[i]+'.abi', deployer)
                    console.log(accounts[accounts_names[i]].account, 'successfully deployed')
                }
            } catch (err) {
                console.log('could not deploy ' + accounts[accounts_names[i]].account + ': ', err)
            }
        }
    }

}

async function deployTestnet (eoslime) {

    console.log('Deploying on Testnet')
    
    let owner = await eoslime.Account.load(accounts.owner.account, existing_accounts[accounts.owner.account].privateKey)

    const accounts_names = Object.keys(names)

    for (let i = 0; i < accounts_names.length; i++) {
        console.log(accounts[accounts_names[i]].account)

        try {
            if (accounts[accounts_names[i]].type === 'contract') {
                let deployer = await eoslime.Account.load(accounts[accounts_names[i]].account, existing_accounts[accounts[accounts_names[i]].account].privateKey)
                
                // console.log('transfer some tokens')
                // await owner.send(deployer, '10.0000', 'TLOS')

                // console.log('buying cpu and net')
                // await deployer.buyBandwidth('5.0000 TLOS', '5.0000 TLOS')

                // console.log('buying ram for:', accounts[accounts_names[i]].account)
                // await deployer.buyRam(1000000);

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
        console.log('Checking if accounts.json exists...')
        if(fs.existsSync('./scripts/accounts.json')){
            console.log('accounts.json exists. Loading...')
            existing_accounts = require('../accounts.json')
        } else {
            console.log('accounts.json does not exist.')
            existing_accounts = {}   
        }
        await resetAllContracts(eoslime)
        await deployLocal(eoslime)
    } else if (process.env.EOSIO_NETWORK === networksNames.telosTestnet) {
        existing_accounts = require('../testnet_accounts.json')
        await resetAllContracts(eoslime)
        await deployTestnet(eoslime)
    }

    console.log('\n\nAdding permissions...')
    createPermissions(eoslime)

}

module.exports = deploy;