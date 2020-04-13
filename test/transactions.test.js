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

describe("Proxy Capital Transactions Contract", function (eoslime) {

    // Increase mocha(testing framework) time, otherwise tests fails
    this.timeout(15000);

    let thirduser = eoslime.Account.load(names.thirduser, accounts[names.thirduser].privateKey, 'active')
    let seconduser = eoslime.Account.load(names.seconduser, accounts[names.seconduser].privateKey, 'active')
    let transactions = eoslime.Account.load(names.transactions, accounts[names.transactions].privateKey, 'active')
    let accountss = eoslime.Account.load(names.accounts, accounts[names.accounts].privateKey, 'active')
    let projects = eoslime.Account.load(names.projects, accounts[names.projects].privateKey, 'active')
    let permissions = eoslime.Account.load(names.permissions, accounts[names.permissions].privateKey, 'active')

    let thirduserContract
    let seconduserContract
    let transactionsContract
    let accountssContract
    let projectsContract
    let permissionsContract

    before(async () => {

        thirduserContract = await eoslime.Contract.at(names.transactions, thirduser)
        seconduserContract = await eoslime.Contract.at(names.transactions, seconduser)
        transactionsContract = await eoslime.Contract.at(names.transactions, transactions)
        accountssContract = await eoslime.Contract.at(names.accounts, accountss)
        projectsContract = await eoslime.Contract.at(names.projects, projects)
        permissionsContract = await eoslime.Contract.at(names.permissions, permissions)

        console.log('reset permissions contract')
        await permissionsContract.reset()

        console.log('reset transactions contract')
        await transactionsContract.reset()

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

        let thirduserContractProjects = await eoslime.Contract.at(names.projects, thirduser)

        await thirduserContractProjects.approveprjct(
            thirduser.name,
            0,
            projectConfig.fund_lp,
            projectConfig.total_fund_offering_amount,
            projectConfig.total_number_fund_offering,
            projectConfig.price_per_fund_unit
        )

        let seconduserContractAccounts = await eoslime.Contract.at(names.accounts, seconduser)

        // Assets children
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Liquid Primary', 1, currency, 'Test description 6', 1, '0.00 USD')      // id = 11
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Reserve Account', 1, currency, 'Test description 7', 1, '0.00 USD')     // id = 12

        // Equity children
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Investments', 2, currency, 'Test description 8', 3, '0.00 USD')         // id = 13
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Franklin Johnson', 13, currency, 'Test description 9', 3, '0.00 USD')    // id = 14
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Michelle Wu', 13, currency, 'Test description 10', 3, '0.00 USD')         // id = 15

        // Expenses children
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Development', 3, currency, 'Test description 11', 3, '0.00 USD')         // id = 16
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Marketing', 3, currency, 'Test description 12', 2, '0.00 USD')           // id = 17
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Tech Infrastructure', 3, currency, 'Test description 13', 2, '0.00 USD') // id = 18
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Travel', 3, currency, 'Test description 14', 2, '0.00 USD')              // id = 19
        
        const amounts1 = [
            {
                'account_id': 16,
                'amount': 200
            }, {
                'account_id': 11,
                'amount': -300
            }, {
                'account_id': 17,
                'amount': 100
            }
        ]

        const amounts2 = [
            {
                'account_id': 15,
                'amount': 4000000
            }, {
                'account_id': 11,
                'amount': -4000000
            }
        ]

        const url_info = [
          {
            'filename': 'a document',
            'address': 'https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'
          },
          {
            'filename': 'a document 2',
            'address': 'https://docs.telos.kitchen-2/jJq8d7dwSlCSvj42yZyBGg#'
          }
        ]

        await seconduserContract.transact(seconduser.name, 0, amounts1, 1023020302, "Monthly expenses", 0, url_info)
        await seconduserContract.transact(seconduser.name, 0, amounts2, 1023020304, "Investment", 0, url_info)

        const provider = eoslime.Provider
        let accountsTable = await provider.select('accounts').from(names.accounts).scope('0').limit(20).find()
        let transactionsTable = await provider.select('transactions').from(names.transactions).scope('0').limit(20).find()
        let accnttransactionsTable = await provider.select('accnttrx').from(names.transactions).scope('0').limit(20).find()

        const expectedAccounts = [
            {
              account_id: 1,
              parent_id: 0,
              num_children: 2,
              account_name: 'Assets',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '40003.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 2,
              parent_id: 0,
              num_children: 1,
              account_name: 'Equity',
              account_subtype: 'Equity',
              increase_balance: '40000.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 3,
              parent_id: 0,
              num_children: 4,
              account_name: 'Expenses',
              account_subtype: 'Expenses',
              increase_balance: '3.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 4,
              parent_id: 0,
              num_children: 0,
              account_name: 'Income',
              account_subtype: 'Income',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 5,
              parent_id: 0,
              num_children: 0,
              account_name: 'Liabilities',
              account_subtype: 'Liabilities',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 6,
              parent_id: 0,
              num_children: 0,
              account_name: 'Assets',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 7,
              parent_id: 0,
              num_children: 0,
              account_name: 'Equity',
              account_subtype: 'Equity',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 8,
              parent_id: 0,
              num_children: 0,
              account_name: 'Expenses',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 9,
              parent_id: 0,
              num_children: 0,
              account_name: 'Income',
              account_subtype: 'Income',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 10,
              parent_id: 0,
              num_children: 0,
              account_name: 'Liabilities',
              account_subtype: 'Liabilities',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 11,
              parent_id: 1,
              num_children: 0,
              account_name: 'Liquid Primary',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '40003.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 6',
              account_category: 1
            },
            {
              account_id: 12,
              parent_id: 1,
              num_children: 0,
              account_name: 'Reserve Account',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 7',
              account_category: 1
            },
            {
              account_id: 13,
              parent_id: 2,
              num_children: 2,
              account_name: 'Investments',
              account_subtype: 'Equity',
              increase_balance: '40000.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 8',
              account_category: 3
            },
            {
              account_id: 14,
              parent_id: 13,
              num_children: 0,
              account_name: 'Franklin Johnson',
              account_subtype: 'Equity',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 9',
              account_category: 3
            },
            {
              account_id: 15,
              parent_id: 13,
              num_children: 0,
              account_name: 'Michelle Wu',
              account_subtype: 'Equity',
              increase_balance: '40000.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 10',
              account_category: 3
            },
            {
              account_id: 16,
              parent_id: 3,
              num_children: 0,
              account_name: 'Development',
              account_subtype: 'Expenses',
              increase_balance: '2.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 11',
              account_category: 3
            },
            {
              account_id: 17,
              parent_id: 3,
              num_children: 0,
              account_name: 'Marketing',
              account_subtype: 'Expenses',
              increase_balance: '1.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 12',
              account_category: 2
            },
            {
              account_id: 18,
              parent_id: 3,
              num_children: 0,
              account_name: 'Tech Infrastructure',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 13',
              account_category: 2
            },
            {
              account_id: 19,
              parent_id: 3,
              num_children: 0,
              account_name: 'Travel',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 14',
              account_category: 2
            }
        ]
          

        const expectedTransactions = [
            {
              transaction_id: 1,
              actor: 'builderuser1',
              timestamp: 1023020302,
              description: 'Monthly expenses',
              drawdown_id: 0,
              total_amount: '3.00 USD',
              transaction_category: 3,
              supporting_files: [
                ...url_info
              ]
            },
            {
              transaction_id: 2,
              actor: 'builderuser1',
              timestamp: 1023020304,
              description: 'Investment',
              drawdown_id: 0,
              transaction_category: 3,
              total_amount: '40000.00 USD',
              supporting_files: [
                ...url_info
              ]
            }
        ]
          
        const expectedAccntTransactions = [
            {
              accnt_transaction_id: 0,
              account_id: 16,
              transaction_id: 1,
              amount: 200
            },
            {
              accnt_transaction_id: 1,
              account_id: 11,
              transaction_id: 1,
              amount: -300
            },
            {
              accnt_transaction_id: 2,
              account_id: 17,
              transaction_id: 1,
              amount: 100
            },
            {
              accnt_transaction_id: 3,
              account_id: 15,
              transaction_id: 2,
              amount: 4000000
            },
            {
              accnt_transaction_id: 4,
              account_id: 11,
              transaction_id: 2,
              amount: -4000000
            }
        ]

        assert.deepEqual(accountsTable, expectedAccounts, 'The accounts table is not right.')
        assert.deepEqual(transactionsTable, expectedTransactions, 'The transactions table is not right.')
        assert.deepEqual(accnttransactionsTable, expectedAccntTransactions, 'The accnttrxns table is not right.')
    })

    it('Should delete a transaction', async () => {

        await seconduserContract.deletetrxn(seconduser.name, 0, 1);

        const provider = eoslime.Provider
        let accountsTable = await provider.select('accounts').from(names.accounts).scope('0').limit(20).find()
        let transactionsTable = await provider.select('transactions').from(names.transactions).scope('0').limit(20).find()
        let accnttransactionsTable = await provider.select('accnttrx').from(names.transactions).scope('0').limit(20).find()

        const expectedAccounts = [
            {
              account_id: 1,
              parent_id: 0,
              num_children: 2,
              account_name: 'Assets',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '40000.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 2,
              parent_id: 0,
              num_children: 1,
              account_name: 'Equity',
              account_subtype: 'Equity',
              increase_balance: '40000.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 3,
              parent_id: 0,
              num_children: 4,
              account_name: 'Expenses',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 4,
              parent_id: 0,
              num_children: 0,
              account_name: 'Income',
              account_subtype: 'Income',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 5,
              parent_id: 0,
              num_children: 0,
              account_name: 'Liabilities',
              account_subtype: 'Liabilities',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 6,
              parent_id: 0,
              num_children: 0,
              account_name: 'Assets',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 7,
              parent_id: 0,
              num_children: 0,
              account_name: 'Equity',
              account_subtype: 'Equity',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 8,
              parent_id: 0,
              num_children: 0,
              account_name: 'Expenses',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 9,
              parent_id: 0,
              num_children: 0,
              account_name: 'Income',
              account_subtype: 'Income',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 10,
              parent_id: 0,
              num_children: 0,
              account_name: 'Liabilities',
              account_subtype: 'Liabilities',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 11,
              parent_id: 1,
              num_children: 0,
              account_name: 'Liquid Primary',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '40000.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 6',
              account_category: 1
            },
            {
              account_id: 12,
              parent_id: 1,
              num_children: 0,
              account_name: 'Reserve Account',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 7',
              account_category: 1
            },
            {
              account_id: 13,
              parent_id: 2,
              num_children: 2,
              account_name: 'Investments',
              account_subtype: 'Equity',
              increase_balance: '40000.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 8',
              account_category: 3
            },
            {
              account_id: 14,
              parent_id: 13,
              num_children: 0,
              account_name: 'Franklin Johnson',
              account_subtype: 'Equity',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 9',
              account_category: 3
            },
            {
              account_id: 15,
              parent_id: 13,
              num_children: 0,
              account_name: 'Michelle Wu',
              account_subtype: 'Equity',
              increase_balance: '40000.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 10',
              account_category: 3
            },
            {
              account_id: 16,
              parent_id: 3,
              num_children: 0,
              account_name: 'Development',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 11',
              account_category: 3
            },
            {
              account_id: 17,
              parent_id: 3,
              num_children: 0,
              account_name: 'Marketing',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 12',
              account_category: 2
            },
            {
              account_id: 18,
              parent_id: 3,
              num_children: 0,
              account_name: 'Tech Infrastructure',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 13',
              account_category: 2
            },
            {
              account_id: 19,
              parent_id: 3,
              num_children: 0,
              account_name: 'Travel',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 14',
              account_category: 2
            }
        ]
        
        const url_info = [
          {
            'filename': 'a document',
            'address': 'https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'
          },
          {
            'filename': 'a document 2',
            'address': 'https://docs.telos.kitchen-2/jJq8d7dwSlCSvj42yZyBGg#'
          }
        ]

        const expectedTransactions = [
            {
              transaction_id: 2,
              actor: 'builderuser1',
              timestamp: 1023020304,
              description: 'Investment',
              drawdown_id: 0,
              total_amount: '40000.00 USD',
              transaction_category: 3,
              supporting_files: [
                ...url_info
              ]
            }
        ]
          
          
        const expectedAccntTransactions = [
            {
              accnt_transaction_id: 3,
              account_id: 15,
              transaction_id: 2,
              amount: 4000000
            },
            {
              accnt_transaction_id: 4,
              account_id: 11,
              transaction_id: 2,
              amount: -4000000
            }
        ]

        assert.deepEqual(accountsTable, expectedAccounts, 'The accounts table is not right.')
        assert.deepEqual(transactionsTable, expectedTransactions, 'The transactions table is not right.')
        assert.deepEqual(accnttransactionsTable, expectedAccntTransactions, 'The accnttrxns table is not right.')

    })

    it('Should edit the transaction', async () => {

        const amounts = [
            {
                'account_id': 15,
                'amount': 4500000
            }, {
                'account_id': 11,
                'amount': -4000000
            }, {
                'account_id': 12,
                'amount': -500000
            }
        ]

        const url_info = [
          {
            'filename': 'a document',
            'address': 'https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'
          },
          {
            'filename': 'a document 2',
            'address': 'https://docs.telos.kitchen-2/jJq8d7dwSlCSvj42yZyBGg#'
          }
        ]

        await seconduserContract.edittrxn(seconduser.name, 0, 2, amounts, 1023020304, "Investment Remastered", 0, url_info)

        const provider = eoslime.Provider
        let accountsTable = await provider.select('accounts').from(names.accounts).scope('0').limit(20).find()
        let transactionsTable = await provider.select('transactions').from(names.transactions).scope('0').limit(20).find()
        let accnttransactionsTable = await provider.select('accnttrx').from(names.transactions).scope('0').limit(20).find()

        const expectedAccounts = [
            {
              account_id: 1,
              parent_id: 0,
              num_children: 2,
              account_name: 'Assets',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '45000.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 2,
              parent_id: 0,
              num_children: 1,
              account_name: 'Equity',
              account_subtype: 'Equity',
              increase_balance: '45000.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 3,
              parent_id: 0,
              num_children: 4,
              account_name: 'Expenses',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 4,
              parent_id: 0,
              num_children: 0,
              account_name: 'Income',
              account_subtype: 'Income',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 5,
              parent_id: 0,
              num_children: 0,
              account_name: 'Liabilities',
              account_subtype: 'Liabilities',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 6,
              parent_id: 0,
              num_children: 0,
              account_name: 'Assets',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 7,
              parent_id: 0,
              num_children: 0,
              account_name: 'Equity',
              account_subtype: 'Equity',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 8,
              parent_id: 0,
              num_children: 0,
              account_name: 'Expenses',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 9,
              parent_id: 0,
              num_children: 0,
              account_name: 'Income',
              account_subtype: 'Income',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 10,
              parent_id: 0,
              num_children: 0,
              account_name: 'Liabilities',
              account_subtype: 'Liabilities',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 11,
              parent_id: 1,
              num_children: 0,
              account_name: 'Liquid Primary',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '40000.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 6',
              account_category: 1
            },
            {
              account_id: 12,
              parent_id: 1,
              num_children: 0,
              account_name: 'Reserve Account',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '5000.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 7',
              account_category: 1
            },
            {
              account_id: 13,
              parent_id: 2,
              num_children: 2,
              account_name: 'Investments',
              account_subtype: 'Equity',
              increase_balance: '45000.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 8',
              account_category: 3
            },
            {
              account_id: 14,
              parent_id: 13,
              num_children: 0,
              account_name: 'Franklin Johnson',
              account_subtype: 'Equity',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 9',
              account_category: 3
            },
            {
              account_id: 15,
              parent_id: 13,
              num_children: 0,
              account_name: 'Michelle Wu',
              account_subtype: 'Equity',
              increase_balance: '45000.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 10',
              account_category: 3
            },
            {
              account_id: 16,
              parent_id: 3,
              num_children: 0,
              account_name: 'Development',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 11',
              account_category: 3
            },
            {
              account_id: 17,
              parent_id: 3,
              num_children: 0,
              account_name: 'Marketing',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 12',
              account_category: 2
            },
            {
              account_id: 18,
              parent_id: 3,
              num_children: 0,
              account_name: 'Tech Infrastructure',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 13',
              account_category: 2
            },
            {
              account_id: 19,
              parent_id: 3,
              num_children: 0,
              account_name: 'Travel',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 14',
              account_category: 2
            }
        ]

        const expectedTransactions = [
            {
              transaction_id: 2,
              actor: 'builderuser1',
              timestamp: 1023020304,
              description: 'Investment Remastered',
              drawdown_id: 0,
              total_amount: '45000.00 USD',
              transaction_category: 3,
              supporting_files: [
                ...url_info
              ]
            }
        ]
          
          
        const expectedAccntTransactions = [
            {
              accnt_transaction_id: 0,
              account_id: 15,
              transaction_id: 2,
              amount: 4500000
            },
            {
              accnt_transaction_id: 1,
              account_id: 11,
              transaction_id: 2,
              amount: -4000000
            },
            {
              accnt_transaction_id: 2,
              account_id: 12,
              transaction_id: 2,
              amount: -500000
            }
        ]

        assert.deepEqual(accountsTable, expectedAccounts, 'The accounts table is not right.')
        assert.deepEqual(transactionsTable, expectedTransactions, 'The transactions table is not right.')
        assert.deepEqual(accnttransactionsTable, expectedAccntTransactions, 'The accnttrxns table is not right.')
        
    })

    it('Should transact in another ledger', async () => {

        let thirduserContractAccounts = await eoslime.Contract.at(names.accounts, thirduser)

        await thirduserContractAccounts.addaccount(thirduser.name, 0, 'Income2', 9, currency, 'Test description 14', 3, '0.00 USD')              // id = 20
        await thirduserContractAccounts.addaccount(thirduser.name, 0, 'Income3', 9, currency, 'Test description 14', 3, '0.00 USD')              // id = 21
        await thirduserContractAccounts.addaccount(thirduser.name, 0, 'Income4', 20, currency, 'Test description 14', 3, '0.00 USD')              // id = 22
        await thirduserContractAccounts.addaccount(thirduser.name, 0, 'Liabilities2', 10, currency, 'Test description 14', 3, '0.00 USD')              // id = 23
        await thirduserContractAccounts.addaccount(thirduser.name, 0, 'Liabilities3', 10, currency, 'Test description 14', 3, '0.00 USD')              // id = 24

        const amounts = [
            {
                'account_id': 22,
                'amount': 3500000
            }, {
                'account_id': 23,
                'amount': -3000000
            }, {
                'account_id': 21,
                'amount': -500000
            }
        ]

        const url_info = [
          {
            'filename': 'a document',
            'address': 'https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'
          },
          {
            'filename': 'a document 2',
            'address': 'https://docs.telos.kitchen-2/jJq8d7dwSlCSvj42yZyBGg#'
          }
        ]

        await thirduserContract.transact(thirduser.name, 0, amounts, 1023020302, "Monthly expenses", 0, url_info)


        const provider = eoslime.Provider
        let accountsTable = await provider.select('accounts').from(names.accounts).scope('0').limit(40).find()
        let transactionsTable = await provider.select('transactions').from(names.transactions).scope('0').limit(20).find()
        let accnttransactionsTable = await provider.select('accnttrx').from(names.transactions).scope('0').limit(20).find()

        const expectedAccounts = [
            {
              account_id: 1,
              parent_id: 0,
              num_children: 2,
              account_name: 'Assets',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '45000.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 2,
              parent_id: 0,
              num_children: 1,
              account_name: 'Equity',
              account_subtype: 'Equity',
              increase_balance: '45000.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 3,
              parent_id: 0,
              num_children: 4,
              account_name: 'Expenses',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 4,
              parent_id: 0,
              num_children: 0,
              account_name: 'Income',
              account_subtype: 'Income',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 5,
              parent_id: 0,
              num_children: 0,
              account_name: 'Liabilities',
              account_subtype: 'Liabilities',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: '---',
              account_category: 1
            },
            {
              account_id: 6,
              parent_id: 0,
              num_children: 0,
              account_name: 'Assets',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 7,
              parent_id: 0,
              num_children: 0,
              account_name: 'Equity',
              account_subtype: 'Equity',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 8,
              parent_id: 0,
              num_children: 0,
              account_name: 'Expenses',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 9,
              parent_id: 0,
              num_children: 2,
              account_name: 'Income',
              account_subtype: 'Income',
              increase_balance: '35000.00 USD',
              decrease_balance: '5000.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 10,
              parent_id: 0,
              num_children: 2,
              account_name: 'Liabilities',
              account_subtype: 'Liabilities',
              increase_balance: '0.00 USD',
              decrease_balance: '30000.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: '---',
              account_category: 1
            },
            {
              account_id: 11,
              parent_id: 1,
              num_children: 0,
              account_name: 'Liquid Primary',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '40000.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 6',
              account_category: 1
            },
            {
              account_id: 12,
              parent_id: 1,
              num_children: 0,
              account_name: 'Reserve Account',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '5000.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 7',
              account_category: 1
            },
            {
              account_id: 13,
              parent_id: 2,
              num_children: 2,
              account_name: 'Investments',
              account_subtype: 'Equity',
              increase_balance: '45000.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 8',
              account_category: 3
            },
            {
              account_id: 14,
              parent_id: 13,
              num_children: 0,
              account_name: 'Franklin Johnson',
              account_subtype: 'Equity',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 9',
              account_category: 3
            },
            {
              account_id: 15,
              parent_id: 13,
              num_children: 0,
              account_name: 'Michelle Wu',
              account_subtype: 'Equity',
              increase_balance: '45000.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 10',
              account_category: 3
            },
            {
              account_id: 16,
              parent_id: 3,
              num_children: 0,
              account_name: 'Development',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 11',
              account_category: 3
            },
            {
              account_id: 17,
              parent_id: 3,
              num_children: 0,
              account_name: 'Marketing',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 12',
              account_category: 2
            },
            {
              account_id: 18,
              parent_id: 3,
              num_children: 0,
              account_name: 'Tech Infrastructure',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 13',
              account_category: 2
            },
            {
              account_id: 19,
              parent_id: 3,
              num_children: 0,
              account_name: 'Travel',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 1,
              description: 'Test description 14',
              account_category: 2
            },
            {
              account_id: 20,
              parent_id: 9,
              num_children: 1,
              account_name: 'Income2',
              account_subtype: 'Income',
              increase_balance: '35000.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: 'Test description 14',
              account_category: 3
            },
            {
              account_id: 21,
              parent_id: 9,
              num_children: 0,
              account_name: 'Income3',
              account_subtype: 'Income',
              increase_balance: '0.00 USD',
              decrease_balance: '5000.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: 'Test description 14',
              account_category: 3
            },
            {
              account_id: 22,
              parent_id: 20,
              num_children: 0,
              account_name: 'Income4',
              account_subtype: 'Income',
              increase_balance: '35000.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: 'Test description 14',
              account_category: 3
            },
            {
              account_id: 23,
              parent_id: 10,
              num_children: 0,
              account_name: 'Liabilities2',
              account_subtype: 'Liabilities',
              increase_balance: '0.00 USD',
              decrease_balance: '30000.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: 'Test description 14',
              account_category: 3
            },
            {
              account_id: 24,
              parent_id: 10,
              num_children: 0,
              account_name: 'Liabilities3',
              account_subtype: 'Liabilities',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              account_symbol: '2,USD',
              ledger_id: 2,
              description: 'Test description 14',
              account_category: 3
            }
        ]

        const expectedTransactions = [
            {
              transaction_id: 2,
              actor: 'builderuser1',
              timestamp: 1023020304,
              description: 'Investment Remastered',
              drawdown_id: 0,
              total_amount: '45000.00 USD',
              transaction_category: 3,
              supporting_files: [
                ...url_info
              ]
            },
            {
              transaction_id: 3,
              actor: 'proxyadmin11',
              timestamp: 1023020302,
              description: 'Monthly expenses',
              drawdown_id: 0,
              total_amount: '35000.00 USD',
              transaction_category: 3,
              supporting_files: [
                ...url_info
              ]
            }
        ]
        
        const expectedAccntTransactions = [
            {
              accnt_transaction_id: 0,
              account_id: 15,
              transaction_id: 2,
              amount: 4500000
            },
            {
              accnt_transaction_id: 1,
              account_id: 11,
              transaction_id: 2,
              amount: -4000000
            },
            {
              accnt_transaction_id: 2,
              account_id: 12,
              transaction_id: 2,
              amount: -500000
            },
            {
              accnt_transaction_id: 3,
              account_id: 22,
              transaction_id: 3,
              amount: 3500000
            },
            {
              accnt_transaction_id: 4,
              account_id: 23,
              transaction_id: 3,
              amount: -3000000
            },
            {
              accnt_transaction_id: 5,
              account_id: 21,
              transaction_id: 3,
              amount: -500000
            }
        ]

        assert.deepEqual(accountsTable, expectedAccounts, 'The accounts table is not right.')
        assert.deepEqual(transactionsTable, expectedTransactions, 'The transactions table is not right.')
        assert.deepEqual(accnttransactionsTable, expectedAccntTransactions, 'The accnttrxns table is not right.')

    })

    it('Should add a transaction to the drawdown', async () => {

      const amounts = [
          {
              'account_id': 15,
              'amount': 1000
          }, {
              'account_id': 11,
              'amount': -1000
          }
      ]

      const url_info = [
        {
          'filename': 'a document',
          'address': 'https://docs.telos.kitchen/tO6eoye_Td-76wBz7J3EZQ#'
        },
        {
          'filename': 'a document 2',
          'address': 'https://docs.telos.kitchen-2/jJq8d7dwSlCSvj42yZyBGg#'
        }
      ]

      await sleep(300)
      await seconduserContract.transact(seconduser.name, 0, amounts, 1023020302, "Monthly drawdown expenses", 1, url_info)
      await sleep(300)
      await seconduserContract.transact(seconduser.name, 0, amounts, 1023020302, "Monthly drawdown expenses", 1, url_info)

      await sleep(300)
      await seconduserContract.submitdrwdn(seconduser.name, 0, url_info)
      await sleep(300)
      await seconduserContract.submitdrwdn(seconduser.name, 0, url_info)
      await sleep(300)
      await seconduserContract.submitdrwdn(seconduser.name, 0, url_info)

      await sleep(300)
      await seconduserContract.transact(seconduser.name, 0, amounts, 1023020302, "Monthly drawdown expenses", 1, url_info)
      await sleep(300)
      await seconduserContract.transact(seconduser.name, 0, amounts, 1023020302, "Monthly drawdown expenses", 1, url_info)

      await sleep(300)
      await seconduserContract.deletetrxn(seconduser.name, 0, 7);

      await sleep(300)
      await seconduserContract.submitdrwdn(seconduser.name, 0, url_info)

      const provider = eoslime.Provider
      let transactionsTable = await provider.select('transactions').from(names.transactions).scope('0').limit(20).find()
      let drawdowns = await provider.select('drawdowns').from(names.transactions).scope('0').limit(20).find()

      drawdowns = drawdowns.map(r => {
        return {
          drawdown_id: r.drawdown_id,
          total_amount: r.total_amount,
          files: r.files,
          state: r.state
        }
      })

      const expectedDrawdown = [
        {
          drawdown_id: 1,
          total_amount: '20.00 USD',
          files: url_info,
          state: 2
        },
        {
          drawdown_id: 2,
          total_amount: '0.00 USD',
          files: url_info,
          state: 2
        },
        {
          drawdown_id: 3,
          total_amount: '0.00 USD',
          files: url_info,
          state: 2
        },
        {
          drawdown_id: 4,
          total_amount: '10.00 USD',
          files: url_info,
          state: 2
        },
        {
          drawdown_id: 5,
          total_amount: '0.00 USD',
          files: [],
          state: 1
        }
      ]

      assert.deepEqual(drawdowns, expectedDrawdown, 'The drawdowns table is not right.')

    })

})

