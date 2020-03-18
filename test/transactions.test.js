const assert = require('assert');
const accounts = require('../scripts/accounts.json')
const { names, currency } = require('../scripts/helper')
const projectConfig = require('./config/new_project.json')

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

    it('Should create transactions properly', async () => {

        let seconduserContractProjects = await eoslime.Contract.at(names.projects, seconduser)
        await seconduserContractProjects.addproject(
            seconduser.name,
            projectConfig.project_class,
            projectConfig.project_name, 
            projectConfig.description, 
            projectConfig.total_project_cost,
            projectConfig.debt_financing,
            projectConfig.term,
            projectConfig.interest_rate,
            projectConfig.loan_agreement,
            projectConfig.total_equity_financing,
            projectConfig.total_gp_equity,
            projectConfig.private_equity,
            projectConfig.annual_return,
            projectConfig.project_co_lp,
            projectConfig.project_co_lp_date,
            projectConfig.projected_completion_date,
            projectConfig.projected_stabilization_date,
            projectConfig.anticipated_year_sale_refinance
        )

        let seconduserContractAccounts = await eoslime.Contract.at(names.accounts, seconduser)

        // Assets children
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Liquid Primary', 1, 'Assets', currency) // id = 6
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Reserve Account', 1, 'Assets', currency) // id = 7

        // Equity children
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Investments', 2, 'Equity', currency) // id = 8
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Franklin Johnson', 8, 'Equity', currency) // id = 9
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Michelle Wu', 8, 'Equity', currency) // id = 10

        // Expenses children
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Development', 3, 'Expenses', currency) // id = 11
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Marketing', 3, 'Expenses', currency) // id = 12
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Tech Infrastructure', 3, 'Expenses', currency) // id = 13
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Travel', 3, 'Expenses', currency) // id = 14

        await seconduserContract.transact(seconduser.name, 0, 10, 6, 1023020302, "Invest into project", "100000.00 USD", 1, 
                                        ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#','https://docs.telos.kitchen/jJq8d7dwSlCSvj42yZyBGg#'])

        await seconduserContract.transact(seconduser.name, 0, 13, 6, 1023020302, "AWS Server Expenses", "100.00 USD", 1, 
                                        ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'])

        await seconduserContract.transact(seconduser.name, 0, 13, 6, 1023020302, "AWS Server Expenses", "200.00 USD", 1, 
                                        ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'])
        
    })

    it('Should edit and delete transactions', async () => {

        let seconduserContractProjects = await eoslime.Contract.at(names.projects, seconduser)
        await seconduserContractProjects.addproject(
            seconduser.name,
            projectConfig.project_class,
            projectConfig.project_name + ' 2', 
            projectConfig.description, 
            projectConfig.total_project_cost,
            projectConfig.debt_financing,
            projectConfig.term,
            projectConfig.interest_rate,
            projectConfig.loan_agreement,
            projectConfig.total_equity_financing,
            projectConfig.total_gp_equity,
            projectConfig.private_equity,
            projectConfig.annual_return,
            projectConfig.project_co_lp,
            projectConfig.project_co_lp_date,
            projectConfig.projected_completion_date,
            projectConfig.projected_stabilization_date,
            projectConfig.anticipated_year_sale_refinance
        )

        let seconduserContractAccounts = await eoslime.Contract.at(names.accounts, seconduser)

         // Assets children
        await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Liquid Primary', 1, 'Assets', currency) // id = 6
        await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Reserve Account', 1, 'Assets', currency) // id = 7

        // Equity children
        await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Investments', 2, 'Equity', currency) // id = 8
        await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Franklin Johnson', 8, 'Equity', currency) // id = 9
        await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Michelle Wu', 8, 'Equity', currency) // id = 10

        // Expenses children
        await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Development', 3, 'Expenses', currency) // id = 11
        await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Marketing', 3, 'Expenses', currency) // id = 12
        await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Tech Infrastructure', 3, 'Expenses', currency) // id = 13
        await seconduserContractAccounts.addaccount(seconduser.name, 1, 'Travel', 3, 'Expenses', currency) // id = 14

        await seconduserContract.transact(seconduser.name, 1, 6, 13, 1023020302, "Test 2", "100.00 USD", 0, 
                                    ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'])

        await seconduserContract.transact(seconduser.name, 1, 9, 5, 1023020302, "Test 3", "200.00 USD", 0, 
                                        ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'])


        const provider = eoslime.Provider

        await seconduserContract.deletetrxn(seconduser.name, 1, 1)

        await seconduserContract.edittrxn(seconduser.name, 1, 0, 22222222, "Changed transaction", "500.00 USD", 1, 
                                        ['https://docs.telos.kitchen#', 'https://docs.telos.kitchen/sajiojoas#'])

        const secondTransactionsTableAfter = await provider.select('transactions').from(names.transactions).scope('1').limit(20).find()

        const expectedTransactionsTable = [
            {
                transaction_id: 0,
                from: 6,
                to: 13,
                from_increase: 1,
                amount: '500.00 USD',
                actor: 'proxycapusrb',
                timestamp: 22222222,
                description: 'Changed transaction',
                supporting_urls: [
                    'https://docs.telos.kitchen#',
                    'https://docs.telos.kitchen/sajiojoas#'
                ]
            }
        ]
        
        assert.deepEqual(secondTransactionsTableAfter, expectedTransactionsTable, 'The transactions table is not right.')

    })
   
})

