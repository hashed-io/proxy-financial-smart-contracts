const assert = require('assert');
const accounts = require('../scripts/accounts.json')
const { names, currency } = require('../scripts/helper')
const projectConfig = require('./config/new_project.json')


function getError (err) {
    return JSON.parse(err).error.details[0].message.replace('assertion failure with message: ', '')
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe("Proxy Capital Permissions Contract", function (eoslime) {

    this.timeout(15000)

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

    //     await seconduserContractProjects.addproject(
    //         seconduser.name,
    //         projectConfig.project_class,
    //         projectConfig.project_name, 
    //         projectConfig.description, 
    //         projectConfig.total_project_cost,
    //         projectConfig.debt_financing,
    //         projectConfig.term,
    //         projectConfig.interest_rate,
    //         projectConfig.loan_agreement,
    //         projectConfig.total_equity_financing,
    //         projectConfig.total_gp_equity,
    //         projectConfig.private_equity,
    //         projectConfig.annual_return,
    //         projectConfig.project_co_lp,
    //         projectConfig.project_co_lp_date,
    //         projectConfig.projected_completion_date,
    //         projectConfig.projected_stabilization_date,
    //         projectConfig.anticipated_year_sale_refinance
    //     )

    //     await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Liquid Primary', 1, currency) // id = 6
    //     await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Reserve Account', 1, currency) // id = 7

    //     // Equity children
    //     await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Investments', 2, currency) // id = 8
    //     await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Franklin Johnson', 8, currency) // id = 9
    //     await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Michelle Wu', 8, currency) // id = 10

    //     // Expenses children
    //     await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Development', 3, currency) // id = 11
    //     await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Marketing', 3, currency) // id = 12
    //     await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Tech Infrastructure', 3, currency) // id = 13
    //     await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Travel', 3, currency) // id = 14

    //     const amounts = [
    //         {
    //             'account_id': 11,
    //             'amount': 200
    //         }, {
    //             'account_id': 6,
    //             'amount': -300
    //         }, {
    //             'account_id': 12,
    //             'amount': 100
    //         }
    //     ]

    //     await seconduserContractTransactions.transact(seconduser.name, 0, amounts, 1023020302, "Monthly expenses",
    //                                     ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#','https://docs.telos.kitchen/jJq8d7dwSlCSvj42yZyBGg#'])

    //     await sleep(1500)
    //     await seconduserContractTransactions.transact(seconduser.name, 0, amounts, 1023020302, "Monthly expenses",
    //                                     ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#','https://docs.telos.kitchen/jJq8d7dwSlCSvj42yZyBGg#'])

        
    //     await seconduserContractProjects.addproject(
    //         seconduser.name,
    //         projectConfig.project_class,
    //         projectConfig.project_name + ' 2', 
    //         projectConfig.description, 
    //         projectConfig.total_project_cost,
    //         projectConfig.debt_financing,
    //         projectConfig.term,
    //         projectConfig.interest_rate,
    //         projectConfig.loan_agreement,
    //         projectConfig.total_equity_financing,
    //         projectConfig.total_gp_equity,
    //         projectConfig.private_equity,
    //         projectConfig.annual_return,
    //         projectConfig.project_co_lp,
    //         projectConfig.project_co_lp_date,
    //         projectConfig.projected_completion_date,
    //         projectConfig.projected_stabilization_date,
    //         projectConfig.anticipated_year_sale_refinance
    //     )

    //     try {
    //         // this should fail
    //         await firstuserContractAccounts.addaccount(firstuser.name, 0, 'Some account', 3, currency) // id = 15
    //     }
    //     catch (err) {
    //         assert.deepEqual(getError(err), names.permissions + ": the user does not have an entry in the roles table.", 'Something else went wrong.')
    //     }

    //     // add a new role and assign it to seconduser
    //     await seconduserContract.addrole(seconduser.name, 0, 'Test Role', 0)
    //     await seconduserContract.assignrole(seconduser.name, firstuser.name, 0, 3)

        
    //     const rolesTable = await provider.select('roles').from(names.permissions).scope('0').limit(20).find()
    //     const userRoles = await provider.select('userroles').from(names.permissions).scope('0').limit(20).find()

    //     try {
    //         // this should fail
    //         await firstuserContractAccounts.addaccount(firstuser.name, 0, 'Some account', 3, currency) // id = 15
    //     }
    //     catch (err) {
    //         assert.deepEqual(getError(err), names.permissions + ": the user investoruser does not have permissions to do this.", 'Something else went wrong.')
    //     }

    //     try {
    //         // this should fail
    //         await firstuserContract.givepermissn(firstuser.name, 0, 'addaccount', 3)
    //     }
    //     catch (err) {
    //         assert.deepEqual(getError(err), names.permissions + ": the user investoruser does not have permissions to do this.", 'Something else went wrong.')
    //     }

    //     await seconduserContract.givepermissn(seconduser.name, 0, 'addaccount', 3)

    //     await firstuserContractAccounts.addaccount(firstuser.name, 0, 'Some account', 3, currency) // id = 15

    //     const accountsTableBefore = await provider.select('accounts').from(names.accounts).scope('0').limit(20).find()

    //     try {
    //         // this should fail
    //         await firstuserContractTransactions.transact(firstuser.name, 0, amounts, 1023020302, "Monthly expenses",
    //                                     ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#','https://docs.telos.kitchen/jJq8d7dwSlCSvj42yZyBGg#'])
    //     }
    //     catch (err) {
    //         assert.deepEqual(getError(err), names.permissions + ": the user investoruser does not have permissions to do this.", 'Something else went wrong.')
    //     }

    //     await seconduserContract.givepermissn(seconduser.name, 0, 'transact', 3)

    //     await sleep(1000)
    //     await firstuserContractTransactions.transact(firstuser.name, 0, amounts, 1023020302, "Monthly expenses",
    //                                     ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#','https://docs.telos.kitchen/jJq8d7dwSlCSvj42yZyBGg#'])

    //     const transactionsTableBefore = await provider.select('transactions').from(names.transactions).scope('0').limit(20).find()

    //     await seconduserContract.assignrole(seconduser.name, firstuser.name, 0, 1)
    //     await firstuserContract.addrole(firstuser.name, 0, 'Test Role 2', 0)
    //     await firstuserContract.addrole(firstuser.name, 0, 'Test Role 3', 7999)
    //     await seconduserContract.removeprmssn(seconduser.name, 0, 'addrole', 1)

    //     try {
    //         await firstuserContract.addrole(firstuser.name, 0, 'Test Role 4', 0)
    //     }
    //     catch (err) {
    //         assert.deepEqual(getError(err), names.permissions + ": the user investoruser does not have permissions to do this.", 'Something else went wrong.')
    //     }

    //     const rolesTable2 = await provider.select('roles').from(names.permissions).scope('0').limit(20).find()

    //     await seconduserContract.removerole(seconduser.name, 0, 4)

    //     const rolesTable3 = await provider.select('roles').from(names.permissions).scope('0').limit(20).find()

    // })


})
