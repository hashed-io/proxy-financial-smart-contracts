const assert = require('assert');
const accounts = require('../scripts/accounts.json')
const { names, currency } = require('../scripts/helper')

function getError (err) {
    return JSON.parse(err).error.details[0].message.replace('assertion failure with message: ', '')
}

// const name ACCOUNTS_ADD = "addaccount"_n;
// const name ACCOUNTS_REMOVE = "deleteaccnt"_n;
// const name ACCOUNTS_EDIT = "editaccount"_n;
// const name TRANSACTIONS_ADD = "transact"_n;
// const name TRANSACTIONS_REMOVE = "deletetrxn"_n;
// const name TRANSACTIONS_EDIT = "edittrxn"_n;
// const name PROJECTS_REMOVE = "nothing"_n;
// const name PROJECTS_EDIT = "nothing2"_n;
// const name PERMISSIONS_ADD_PERMISSION = "givepermissn"_n;
// const name PERMISSIONS_REMOVE_PERMISSION = "removeprmssn"_n;
// const name PERMISSIONS_ADD_ROLE = "addrole"_n;
// const name PERMISSIONS_REMOVE_ROLE = "removerole"_n;
// const name PERMISSIONS_ASSIGN = "assignrole"_n;

// actor = {
//     user:
//     accounts:
//     projects:
//     transactions:
//     permissions:
//     accountsContract:
//     projectsContract:
//     transactionsContract:
//     permissionsContract:
// }


// function checkActions (eoslime, actor) {
//     let check = {}

//     actor.permissionsContract.reset()
//     actor.accountsContract.reset()
//     actor.projectsContract.reset()
//     actor.transactionsContract.reset()

//     try {
//         await actor.accounts.addaccount(actor.user.name, 0, 'test account', 3, 'Expenses', currency)
//         check.addaccount = true
//     } catch (err) {
//         check.addaccount = false
//     }

//     try {
//         await actor.accounts.deleteaccnt(actor.name, 0, 6)
//         check.deleteaccnt = true
//     } catch (err) {
//         check.deleteaccnt = false
//     }

//     try {
//         await actor.transactions.transact(actor.name, 0, 10, 6, 1023020302, "Invest into project", "100000.0000 USD", 1, 
//                                         ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#','https://docs.telos.kitchen/jJq8d7dwSlCSvj42yZyBGg#'])
//         check.transact = true
//     } catch (err) {
//         check.transact = false
//     }

// }

describe("Proxy Capital Permissions Contract", function (eoslime) {

    let firstuser = eoslime.Account.load(names.firstuser, accounts[names.firstuser].privateKey, 'active')
    let seconduser = eoslime.Account.load(names.seconduser, accounts[names.seconduser].privateKey, 'active')
    let transactions = eoslime.Account.load(names.transactions, accounts[names.transactions].privateKey, 'active')
    let accountss = eoslime.Account.load(names.accounts, accounts[names.accounts].privateKey, 'active')
    let projects = eoslime.Account.load(names.projects, accounts[names.projects].privateKey, 'active')
    let permissions = eoslime.Account.load(names.permissions, accounts[names.permissions].privateKey, 'active')

    let firstuserContract
    let firstuserContractProjects
    let firstuserContractAccounts
    let firstuserContractTransactions

    let seconduserContract
    let seconduserContractProjects
    let seconduserContractAccounts
    let seconduserContractTransactions
    
    let transactionsContract
    let accountssContract
    let projectsContract
    let permissionsContract
    
    let provider

    before(async () => {

        firstuserContract = await eoslime.Contract.at(names.permissions, firstuser)
        firstuserContractProjects = await eoslime.Contract.at(names.projects, firstuser)
        firstuserContractAccounts = await eoslime.Contract.at(names.accounts, firstuser)
        firstuserContractTransactions = await eoslime.Contract.at(names.transactions, firstuser)

        seconduserContract = await eoslime.Contract.at(names.permissions, seconduser)
        seconduserContractProjects = await eoslime.Contract.at(names.projects, seconduser)
        seconduserContractAccounts = await eoslime.Contract.at(names.accounts, seconduser)
        seconduserContractTransactions = await eoslime.Contract.at(names.transactions, seconduser)

        transactionsContract = await eoslime.Contract.at(names.transactions, transactions)
        accountssContract = await eoslime.Contract.at(names.accounts, accountss)
        projectsContract = await eoslime.Contract.at(names.projects, projects)
        permissionsContract = await eoslime.Contract.at(names.permissions, permissions)

        provider = eoslime.Provider

        console.log('reset permissions contract')
        await permissionsContract.reset()

        console.log('reset accounts contract')
        await accountssContract.reset()

        console.log('reset projects contract')
        await projectsContract.reset()

        console.log('reset transactions contract')
        await transactionsContract.reset()

    })

    // it('Should validate permissions properly', async () => {

    //     await firstuserContractProjects.addproject(firstuser.name, "Test project", "This is a test description", "100000.0000 USD")

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

    //     await firstuserContractTransactions.transact(firstuser.name, 0, 10, 6, 1023020302, "Invest into project", "100000.0000 USD", 1, 
    //                                     ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#','https://docs.telos.kitchen/jJq8d7dwSlCSvj42yZyBGg#'])

    //     await firstuserContractTransactions.transact(firstuser.name, 0, 13, 6, 1023020302, "AWS Server Expenses", "100.0000 USD", 1, 
    //                                     ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'])

    //     await firstuserContractTransactions.transact(firstuser.name, 0, 13, 6, 1023020302, "AWS Server Expenses", "200.0000 USD", 1, 
    //                                     ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'])

        
    //     await seconduserContractProjects.addproject(seconduser.name, 'test project 2', 'this is a test 2', '10.0000 USD')

    //     try {
    //         // this should fail
    //         await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Some account', 3, 'Expenses', currency) // id = 15
    //     }
    //     catch (err) {
    //         console.log(getError(err))
    //     }

    //     // add a new role and assign it to seconduser
    //     await firstuserContract.addrole(firstuser.name, 0, 'Test Role', 0)
    //     await firstuserContract.assignrole(firstuser.name, seconduser.name, 0, 3)

        
    //     const rolesTable = await provider.select('roles').from(names.permissions).scope('0').limit(20).find()
    //     const userRoles = await provider.select('userroles').from(names.permissions).scope('0').limit(20).find()

    //     console.log(rolesTable)
    //     console.log(userRoles)

    //     try {
    //         // this should fail
    //         await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Some account', 3, 'Expenses', currency) // id = 15
    //     }
    //     catch (err) {
    //         console.log(getError(err))
    //     }

    //     try {
    //         // this should fail
    //         await seconduserContract.givepermissn(seconduser.name, 0, 'addaccount', 3)
    //     }
    //     catch (err) {
    //         console.log(getError(err))
    //     }

    //     await firstuserContract.givepermissn(firstuser.name, 0, 'addaccount', 3)

    //     await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Some account', 3, 'Expenses', currency) // id = 15

    //     const accountsTableBefore = await provider.select('accounts').from(names.accounts).scope('0').limit(20).find()
    //     console.log(accountsTableBefore)


    //     try {
    //         // this should fail
    //         await seconduserContractTransactions.transact(seconduser.name, 0, 13, 6, 1023020302, "AWS Server Expenses", "220.0000 USD", 1, 
    //                                     ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'])
    //     }
    //     catch (err) {
    //         console.log(getError(err))
    //     }

    //     await firstuserContract.givepermissn(firstuser.name, 0, 'transact', 3)

    //     await seconduserContractTransactions.transact(seconduser.name, 0, 13, 6, 1023020302, "AWS Server Expenses", "200.0000 USD", 1, 
    //                                     ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'])

    //     const transactionsTableBefore = await provider.select('transactions').from(names.transactions).scope('0').limit(20).find()
    //     console.log(transactionsTableBefore)

    //     await firstuserContract.assignrole(firstuser.name, seconduser.name, 0, 1)

    //     await seconduserContract.addrole(seconduser.name, 0, 'Test Role 2', 0)
    //     await seconduserContract.addrole(seconduser.name, 0, 'Test Role 3', 7999)

    //     await firstuserContract.removeprmssn(firstuser.name, 0, 'addrole', 1)

    //     try {
    //         await seconduserContract.addrole(seconduser.name, 0, 'Test Role 4', 0)
    //     }
    //     catch (err) {
    //         console.log(getError(err))
    //     }

    //     const rolesTable2 = await provider.select('roles').from(names.permissions).scope('0').limit(20).find()
    //     console.log(rolesTable2)

    //     await seconduserContract.removerole(seconduser.name, 0, 4)

    //     const rolesTable3 = await provider.select('roles').from(names.permissions).scope('0').limit(20).find()
    //     console.log(rolesTable3)

    // })


})