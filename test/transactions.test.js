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

    // it('Should create transactions properly', async () => {

    //     let seconduserContractProjects = await eoslime.Contract.at(names.projects, seconduser)
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

    //     let seconduserContractAccounts = await eoslime.Contract.at(names.accounts, seconduser)

    //     // Assets children
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
        
    //     const amounts1 = [
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

    //     const amounts2 = [
    //         {
    //             'account_id': 10,
    //             'amount': 4000000
    //         }, {
    //             'account_id': 6,
    //             'amount': -4000000
    //         }
    //     ]

    //     await seconduserContract.transact(seconduser.name, 0, amounts1, 1023020302, "Monthly expenses",
    //                                     ['https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#','https://docs.telos.kitchen/jJq8d7dwSlCSvj42yZyBGg#'])

    //     await seconduserContract.transact(seconduser.name, 0, amounts2, 1023020304, "Investment",
    //                                     ['https://docs.telos.kitchen-2/tO6eoye_Td-76wBz7J3EZQ#','https://docs.telos.kitchen-2/jJq8d7dwSlCSvj42yZyBGg#'])

    //     const provider = eoslime.Provider
    //     let accountsTable = await provider.select('accounts').from(names.accounts).scope('0').limit(20).find()
    //     let transactionsTable = await provider.select('transactions').from(names.transactions).scope('0').limit(20).find()
    //     let accnttransactionsTable = await provider.select('accnttrx').from(names.transactions).scope('0').limit(20).find()

    //     const expectedAccounts = [
    //         {
    //           account_id: 1,
    //           parent_id: 0,
    //           num_children: 2,
    //           account_name: 'Assets',
    //           account_subtype: 'Assets',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '40003.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 2,
    //           parent_id: 0,
    //           num_children: 1,
    //           account_name: 'Equity',
    //           account_subtype: 'Equity',
    //           increase_balance: '40000.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 3,
    //           parent_id: 0,
    //           num_children: 4,
    //           account_name: 'Expenses',
    //           account_subtype: 'Expenses',
    //           increase_balance: '3.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 4,
    //           parent_id: 0,
    //           num_children: 0,
    //           account_name: 'Income',
    //           account_subtype: 'Income',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 5,
    //           parent_id: 0,
    //           num_children: 0,
    //           account_name: 'Liabilities',
    //           account_subtype: 'Liabilities',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 6,
    //           parent_id: 1,
    //           num_children: 0,
    //           account_name: 'Liquid Primary',
    //           account_subtype: 'Assets',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '40003.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 7,
    //           parent_id: 1,
    //           num_children: 0,
    //           account_name: 'Reserve Account',
    //           account_subtype: 'Assets',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 8,
    //           parent_id: 2,
    //           num_children: 2,
    //           account_name: 'Investments',
    //           account_subtype: 'Equity',
    //           increase_balance: '40000.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 9,
    //           parent_id: 8,
    //           num_children: 0,
    //           account_name: 'Franklin Johnson',
    //           account_subtype: 'Equity',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 10,
    //           parent_id: 8,
    //           num_children: 0,
    //           account_name: 'Michelle Wu',
    //           account_subtype: 'Equity',
    //           increase_balance: '40000.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 11,
    //           parent_id: 3,
    //           num_children: 0,
    //           account_name: 'Development',
    //           account_subtype: 'Expenses',
    //           increase_balance: '2.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 12,
    //           parent_id: 3,
    //           num_children: 0,
    //           account_name: 'Marketing',
    //           account_subtype: 'Expenses',
    //           increase_balance: '1.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 13,
    //           parent_id: 3,
    //           num_children: 0,
    //           account_name: 'Tech Infrastructure',
    //           account_subtype: 'Expenses',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 14,
    //           parent_id: 3,
    //           num_children: 0,
    //           account_name: 'Travel',
    //           account_subtype: 'Expenses',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         }
    //     ]

    //     const expectedTransactions = [
    //         {
    //           transaction_id: 1,
    //           actor: 'proxycapusrb',
    //           timestamp: 1023020302,
    //           description: 'Monthly expenses',
    //           supporting_urls: [
    //             'https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#',
    //             'https://docs.telos.kitchen/jJq8d7dwSlCSvj42yZyBGg#'
    //           ]
    //         },
    //         {
    //           transaction_id: 2,
    //           actor: 'proxycapusrb',
    //           timestamp: 1023020304,
    //           description: 'Investment',
    //           supporting_urls: [
    //             'https://docs.telos.kitchen-2/tO6eoye_Td-76wBz7J3EZQ#',
    //             'https://docs.telos.kitchen-2/jJq8d7dwSlCSvj42yZyBGg#'
    //           ]
    //         }
    //     ]
          
    //     const expectedAccntTransactions = [
    //         {
    //           accnt_transaction_id: 0,
    //           account_id: 11,
    //           transaction_id: 1,
    //           amount: 200
    //         },
    //         {
    //           accnt_transaction_id: 1,
    //           account_id: 6,
    //           transaction_id: 1,
    //           amount: -300
    //         },
    //         {
    //           accnt_transaction_id: 2,
    //           account_id: 12,
    //           transaction_id: 1,
    //           amount: 100
    //         },
    //         {
    //           accnt_transaction_id: 3,
    //           account_id: 10,
    //           transaction_id: 2,
    //           amount: 4000000
    //         },
    //         {
    //           accnt_transaction_id: 4,
    //           account_id: 6,
    //           transaction_id: 2,
    //           amount: -4000000
    //         }
    //     ]
          
    //     assert.deepEqual(accountsTable, expectedAccounts, 'The accounts table is not right.')
    //     assert.deepEqual(transactionsTable, expectedTransactions, 'The transactions table is not right.')
    //     assert.deepEqual(accnttransactionsTable, expectedAccntTransactions, 'The accnttrxns table is not right.')
    // })

    // it('Should delete a transaction', async () => {

    //     await seconduserContract.deletetrxn(seconduser.name, 0, 1);

    //     const provider = eoslime.Provider
    //     let accountsTable = await provider.select('accounts').from(names.accounts).scope('0').limit(20).find()
    //     let transactionsTable = await provider.select('transactions').from(names.transactions).scope('0').limit(20).find()
    //     let accnttransactionsTable = await provider.select('accnttrx').from(names.transactions).scope('0').limit(20).find()

    //     const expectedAccounts = [
    //         {
    //           account_id: 1,
    //           parent_id: 0,
    //           num_children: 2,
    //           account_name: 'Assets',
    //           account_subtype: 'Assets',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '40000.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 2,
    //           parent_id: 0,
    //           num_children: 1,
    //           account_name: 'Equity',
    //           account_subtype: 'Equity',
    //           increase_balance: '40000.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 3,
    //           parent_id: 0,
    //           num_children: 4,
    //           account_name: 'Expenses',
    //           account_subtype: 'Expenses',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 4,
    //           parent_id: 0,
    //           num_children: 0,
    //           account_name: 'Income',
    //           account_subtype: 'Income',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 5,
    //           parent_id: 0,
    //           num_children: 0,
    //           account_name: 'Liabilities',
    //           account_subtype: 'Liabilities',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 6,
    //           parent_id: 1,
    //           num_children: 0,
    //           account_name: 'Liquid Primary',
    //           account_subtype: 'Assets',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '40000.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 7,
    //           parent_id: 1,
    //           num_children: 0,
    //           account_name: 'Reserve Account',
    //           account_subtype: 'Assets',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 8,
    //           parent_id: 2,
    //           num_children: 2,
    //           account_name: 'Investments',
    //           account_subtype: 'Equity',
    //           increase_balance: '40000.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 9,
    //           parent_id: 8,
    //           num_children: 0,
    //           account_name: 'Franklin Johnson',
    //           account_subtype: 'Equity',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 10,
    //           parent_id: 8,
    //           num_children: 0,
    //           account_name: 'Michelle Wu',
    //           account_subtype: 'Equity',
    //           increase_balance: '40000.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 11,
    //           parent_id: 3,
    //           num_children: 0,
    //           account_name: 'Development',
    //           account_subtype: 'Expenses',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 12,
    //           parent_id: 3,
    //           num_children: 0,
    //           account_name: 'Marketing',
    //           account_subtype: 'Expenses',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 13,
    //           parent_id: 3,
    //           num_children: 0,
    //           account_name: 'Tech Infrastructure',
    //           account_subtype: 'Expenses',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 14,
    //           parent_id: 3,
    //           num_children: 0,
    //           account_name: 'Travel',
    //           account_subtype: 'Expenses',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         }
    //     ]
          

    //     const expectedTransactions = [
    //         {
    //           transaction_id: 2,
    //           actor: 'proxycapusrb',
    //           timestamp: 1023020304,
    //           description: 'Investment',
    //           supporting_urls: [
    //             'https://docs.telos.kitchen-2/tO6eoye_Td-76wBz7J3EZQ#',
    //             'https://docs.telos.kitchen-2/jJq8d7dwSlCSvj42yZyBGg#'
    //           ]
    //         }
    //     ]
          
          
    //     const expectedAccntTransactions = [
    //         {
    //           accnt_transaction_id: 3,
    //           account_id: 10,
    //           transaction_id: 2,
    //           amount: 4000000
    //         },
    //         {
    //           accnt_transaction_id: 4,
    //           account_id: 6,
    //           transaction_id: 2,
    //           amount: -4000000
    //         }
    //     ]
          
          
    //     assert.deepEqual(accountsTable, expectedAccounts, 'The accounts table is not right.')
    //     assert.deepEqual(transactionsTable, expectedTransactions, 'The transactions table is not right.')
    //     assert.deepEqual(accnttransactionsTable, expectedAccntTransactions, 'The accnttrxns table is not right.')

    // })

    // it('Should edit the transaction', async () => {

    //     const amounts = [
    //         {
    //             'account_id': 10,
    //             'amount': 4500000
    //         }, {
    //             'account_id': 6,
    //             'amount': -4000000
    //         }, {
    //             'account_id': 7,
    //             'amount': -500000
    //         }
    //     ]

    //     await seconduserContract.edittrxn(seconduser.name, 0, 2, amounts, 1023020304, "Investment Remastered",
    //                                     ['https://docs.telos.kitchen-2/tO6eoye_Td-76wBz7J3EZQ#','https://docs.telos.kitchen-2r/jJq8d7dwSlCSvj42yZyBGg#'])

    //     const provider = eoslime.Provider
    //     let accountsTable = await provider.select('accounts').from(names.accounts).scope('0').limit(20).find()
    //     let transactionsTable = await provider.select('transactions').from(names.transactions).scope('0').limit(20).find()
    //     let accnttransactionsTable = await provider.select('accnttrx').from(names.transactions).scope('0').limit(20).find()

    //     const expectedAccounts = [
    //         {
    //           account_id: 1,
    //           parent_id: 0,
    //           num_children: 2,
    //           account_name: 'Assets',
    //           account_subtype: 'Assets',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '45000.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 2,
    //           parent_id: 0,
    //           num_children: 1,
    //           account_name: 'Equity',
    //           account_subtype: 'Equity',
    //           increase_balance: '45000.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 3,
    //           parent_id: 0,
    //           num_children: 4,
    //           account_name: 'Expenses',
    //           account_subtype: 'Expenses',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 4,
    //           parent_id: 0,
    //           num_children: 0,
    //           account_name: 'Income',
    //           account_subtype: 'Income',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 5,
    //           parent_id: 0,
    //           num_children: 0,
    //           account_name: 'Liabilities',
    //           account_subtype: 'Liabilities',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 6,
    //           parent_id: 1,
    //           num_children: 0,
    //           account_name: 'Liquid Primary',
    //           account_subtype: 'Assets',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '40000.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 7,
    //           parent_id: 1,
    //           num_children: 0,
    //           account_name: 'Reserve Account',
    //           account_subtype: 'Assets',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '5000.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 8,
    //           parent_id: 2,
    //           num_children: 2,
    //           account_name: 'Investments',
    //           account_subtype: 'Equity',
    //           increase_balance: '45000.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 9,
    //           parent_id: 8,
    //           num_children: 0,
    //           account_name: 'Franklin Johnson',
    //           account_subtype: 'Equity',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 10,
    //           parent_id: 8,
    //           num_children: 0,
    //           account_name: 'Michelle Wu',
    //           account_subtype: 'Equity',
    //           increase_balance: '45000.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 11,
    //           parent_id: 3,
    //           num_children: 0,
    //           account_name: 'Development',
    //           account_subtype: 'Expenses',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 12,
    //           parent_id: 3,
    //           num_children: 0,
    //           account_name: 'Marketing',
    //           account_subtype: 'Expenses',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 13,
    //           parent_id: 3,
    //           num_children: 0,
    //           account_name: 'Tech Infrastructure',
    //           account_subtype: 'Expenses',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         },
    //         {
    //           account_id: 14,
    //           parent_id: 3,
    //           num_children: 0,
    //           account_name: 'Travel',
    //           account_subtype: 'Expenses',
    //           increase_balance: '0.00 USD',
    //           decrease_balance: '0.00 USD',
    //           account_symbol: '2,USD'
    //         }
    //     ]
          

    //     const expectedTransactions = [
    //         {
    //           transaction_id: 2,
    //           actor: 'proxycapusrb',
    //           timestamp: 1023020304,
    //           description: 'Investment Remastered',
    //           supporting_urls: [
    //             'https://docs.telos.kitchen-2/tO6eoye_Td-76wBz7J3EZQ#',
    //             'https://docs.telos.kitchen-2r/jJq8d7dwSlCSvj42yZyBGg#'
    //           ]
    //         }
    //     ]
          
          
    //     const expectedAccntTransactions = [
    //         {
    //           accnt_transaction_id: 0,
    //           account_id: 10,
    //           transaction_id: 2,
    //           amount: 4500000
    //         },
    //         {
    //           accnt_transaction_id: 1,
    //           account_id: 6,
    //           transaction_id: 2,
    //           amount: -4000000
    //         },
    //         {
    //           accnt_transaction_id: 2,
    //           account_id: 7,
    //           transaction_id: 2,
    //           amount: -500000
    //         }
    //     ]
          
    //     assert.deepEqual(accountsTable, expectedAccounts, 'The accounts table is not right.')
    //     assert.deepEqual(transactionsTable, expectedTransactions, 'The transactions table is not right.')
    //     assert.deepEqual(accnttransactionsTable, expectedAccntTransactions, 'The accnttrxns table is not right.')
        
    // })

})

