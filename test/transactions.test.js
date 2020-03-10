const assert = require('assert');
const accounts = require('../scripts/accounts.json')
const { names, currency } = require('../scripts/helper')

function getError (err) {
    return JSON.parse(err).error.details[0].message.replace('assertion failure with message: ', '')
}

describe("EOSIO Token", function (eoslime) {

    // Increase mocha(testing framework) time, otherwise tests fails
    this.timeout(15000);

    let firstuser = eoslime.Account.load(names.firstuser, accounts[names.firstuser].privateKey, 'active')
    let seconduser = eoslime.Account.load(names.seconduser, accounts[names.seconduser].privateKey, 'active')
    let transactions = eoslime.Account.load(names.transactions, accounts[names.transactions].privateKey, 'active')
    let accountss = eoslime.Account.load(names.accounts, accounts[names.accounts].privateKey, 'active')
    let projects = eoslime.Account.load(names.projects, accounts[names.projects].privateKey, 'active')
    let permissions = eoslime.Account.load(names.permissions, accounts[names.permissions].privateKey, 'active')

    let firstuserContract
    let seconduserContract
    let transactionsContract
    let accountssContract
    let projectsContract
    let permissionsContract

    before(async () => {

        firstuserContract = await eoslime.Contract.at(names.transactions, firstuser)
        seconduserContract = await eoslime.Contract.at(names.transactions, seconduser)
        transactionsContract = await eoslime.Contract.at(names.transactions, transactions)
        accountssContract = await eoslime.Contract.at(names.accounts, accountss)
        projectsContract = await eoslime.Contract.at(names.projects, projects)
        permissionsContract = await eoslime.Contract.at(names.permissions, permissions)

        console.log('reset permissions contract')
        await permissionsContract.reset()

        console.log('reset transactions contract')
        await transactionsContract.reset();

        console.log('reset accounts contract')
        await accountssContract.reset()

        console.log('reset projects contract')
        await projectsContract.reset()

    })

    // it('Should create transactions properly', async () => {

    //     let firstuserContractProjects = await eoslime.Contract.at(names.projects, firstuser)
    //     await firstuserContractProjects.addproject(firstuser.name, 'test project', 'this is a test', '10.0000 USD')

    //     let firstuserContractAccounts = await eoslime.Contract.at(names.accounts, firstuser)

    //     // Assets children
    //     await firstuserContractAccounts.addaccount(firstuser.name, 0, 'Liquid Primary', 1, 'Assets', currency) // id = 6
    //     await firstuserContractAccounts.addaccount(firstuser.name, 0, 'Reserve Account', 1, 'Assets', currency) // id = 7

    //     // Equity children
    //     await firstuserContractAccounts.addaccount(firstuser.name, 0, 'Investments', 2, 'Equity', currency) // id = 8
    //     await firstuserContractAccounts.addaccount(firstuser.name, 0, 'Franklin Johnson', 8, 'Equity', currency) // id = 9
    //     await firstuserContractAccounts.addaccount(firstuser.name, 0, 'Michelle Wu', 8, 'Equity', currency) // id = 10

    //     // Expenses children
    //     await firstuserContractAccounts.addaccount(firstuser.name, 0, 'Development', 3, 'Expenses', currency) // id = 11
    //     await firstuserContractAccounts.addaccount(firstuser.name, 0, 'Marketing', 3, 'Expenses', currency) // id = 12
    //     await firstuserContractAccounts.addaccount(firstuser.name, 0, 'Tech Infrastructure', 3, 'Expenses', currency) // id = 13
    //     await firstuserContractAccounts.addaccount(firstuser.name, 0, 'Travel', 3, 'Expenses', currency) // id = 14

    //     await firstuserContract.transact(firstuser.name, 0, 10, 6, 1023020302, "Invest into project", "100000.0000 USD", 1, 
    //                                     ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#','https://docs.telos.kitchen/jJq8d7dwSlCSvj42yZyBGg#'])

    //     await firstuserContract.transact(firstuser.name, 0, 13, 6, 1023020302, "AWS Server Expenses", "100.0000 USD", 1, 
    //                                     ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'])

    //     await firstuserContract.transact(firstuser.name, 0, 13, 6, 1023020302, "AWS Server Expenses", "200.0000 USD", 1, 
    //                                     ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'])



    //     let seconduserContractProjects = await eoslime.Contract.at(names.projects, seconduser)
    //     await seconduserContractProjects.addproject(seconduser.name, 'test project 2', 'this is a test 2', '10.0000 USD')

    //     let seconduserContractAccounts = await eoslime.Contract.at(names.accounts, seconduser)

    //      // Assets children
    //     await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Liquid Primary', 1, 'Assets', currency) // id = 6
    //     await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Reserve Account', 1, 'Assets', currency) // id = 7

    //     // Equity children
    //     await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Investments', 2, 'Equity', currency) // id = 8
    //     await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Franklin Johnson', 8, 'Equity', currency) // id = 9
    //     await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Michelle Wu', 8, 'Equity', currency) // id = 10

    //     // Expenses children
    //     await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Development', 3, 'Expenses', currency) // id = 11
    //     await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Marketing', 3, 'Expenses', currency) // id = 12
    //     await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Tech Infrastructure', 3, 'Expenses', currency) // id = 13
    //     await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Travel', 3, 'Expenses', currency) // id = 14

    //     await seconduserContract.transact(seconduser.name, 1, 6, 13, 1023020302, "Test 2", "100.0000 USD", 0, 
    //                                 ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'])

    //     await seconduserContract.transact(seconduser.name, 1, 9, 5, 1023020302, "Test 3", "200.0000 USD", 0, 
    //                                     ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'])


    //     const provider = eoslime.Provider
    //     const secondProjectTableBefore = await provider.select('transactions').from(names.transactions).scope('1').limit(20).find()
    //     const accountsTable = await provider.select('accounts').from(names.accounts).scope('1').limit(20).find()
        
    //     // console.log(accountsTable)
    //     // console.log(secondProjectTableBefore)

    //     await seconduserContract.deletetrxn(seconduser.name, 1, 1)

    //     await seconduserContract.edittrxn(seconduser.name, 1, 0, 22222222, "Changed transaction", "500.0000 USD", 1, 
    //                                     ['https://docs.telos.kitchen#', 'https://docs.telos.kitchen/sajiojoas#'])

    // })
   
});

