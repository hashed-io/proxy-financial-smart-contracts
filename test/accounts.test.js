const assert = require('assert');
const accounts = require('../scripts/accounts.json')
const { names, currency } = require('../scripts/helper')
const projectConfig = require('./config/new_project.json')

describe("Proxy Capital Accounts Contract", function (eoslime) {

    let firstuser = eoslime.Account.load(names.firstuser, accounts[names.firstuser].privateKey, 'active')
    let seconduser = eoslime.Account.load(names.seconduser, accounts[names.seconduser].privateKey, 'active')
    let accountss = eoslime.Account.load(names.accounts, accounts[names.accounts].privateKey, 'active')
    let projects = eoslime.Account.load(names.projects, accounts[names.projects].privateKey, 'active')
    let permissions = eoslime.Account.load(names.permissions, accounts[names.permissions].privateKey, 'active')

    let firstuserContract
    let seconduserContract
    let accountssContract
    let projectsContract
    let permissionsContract

    before(async () => {

        firstuserContract = await eoslime.Contract.at(names.accounts, firstuser)
        seconduserContract = await eoslime.Contract.at(names.accounts, seconduser)
        accountssContract = await eoslime.Contract.at(names.accounts, accountss)
        projectsContract = await eoslime.Contract.at(names.projects, projects)
        permissionsContract = await eoslime.Contract.at(names.permissions, permissions)

        console.log('reset permissions contract')
        await permissionsContract.reset()

        console.log('reset accounts contract')
        await accountssContract.reset()

        console.log('reset projects contract')
        await projectsContract.reset()

    })

    it('Should create new accounts properly', async () => {

        seconduserContractProjects = await eoslime.Contract.at(names.projects, seconduser)
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



        // Assets children
        await seconduserContract.addaccount(seconduser.name, 0, 'Liquid Primary', 1, 'Assets', currency)
        await seconduserContract.addaccount(seconduser.name, 0, 'Reserve Account', 1, 'Assets', currency)

        // Equity children
        await seconduserContract.addaccount(seconduser.name, 0, 'Investments', 2, 'Equity', currency)
        await seconduserContract.addaccount(seconduser.name, 0, 'Franklin Johnson', 8, 'Equity', currency)
        await seconduserContract.addaccount(seconduser.name, 0, 'Michelle Wu', 8, 'Equity', currency)

        // Expenses children
        await seconduserContract.addaccount(seconduser.name, 0, 'Development', 3, 'Expenses', currency)
        await seconduserContract.addaccount(seconduser.name, 0, 'Marketing', 3, 'Expenses', currency)
        await seconduserContract.addaccount(seconduser.name, 0, 'Tech Infrastructure', 3, 'Expenses', currency)
        await seconduserContract.addaccount(seconduser.name, 0, 'Travel', 3, 'Expenses', currency)

        const expected = [
            {
              account_id: 1,
              parent_id: 0,
              account_name: 'Assets',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              num_children: 2,
              account_symbol: '2,USD'
            },
            {
              account_id: 2,
              parent_id: 0,
              account_name: 'Equity',
              account_subtype: 'Equity',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              num_children: 1,
              account_symbol: '2,USD'
            },
            {
              account_id: 3,
              parent_id: 0,
              account_name: 'Expenses',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              num_children: 4,
              account_symbol: '2,USD'
            },
            {
              account_id: 4,
              parent_id: 0,
              account_name: 'Income',
              account_subtype: 'Income',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              num_children: 0,
              account_symbol: '2,USD'
            },
            {
              account_id: 5,
              parent_id: 0,
              account_name: 'Liabilities',
              account_subtype: 'Liabilities',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              num_children: 0,
              account_symbol: '2,USD'
            },
            {
              account_id: 6,
              parent_id: 1,
              account_name: 'Liquid Primary',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              num_children: 0,
              account_symbol: '2,USD'
            },
            {
              account_id: 7,
              parent_id: 1,
              account_name: 'Reserve Account',
              account_subtype: 'Assets',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              num_children: 0,
              account_symbol: '2,USD'
            },
            {
              account_id: 8,
              parent_id: 2,
              account_name: 'Investments',
              account_subtype: 'Equity',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              num_children: 2,
              account_symbol: '2,USD'
            },
            {
              account_id: 9,
              parent_id: 8,
              account_name: 'Franklin Johnson',
              account_subtype: 'Equity',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              num_children: 0,
              account_symbol: '2,USD'
            },
            {
              account_id: 10,
              parent_id: 8,
              account_name: 'Michelle Wu',
              account_subtype: 'Equity',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              num_children: 0,
              account_symbol: '2,USD'
            },
            {
              account_id: 11,
              parent_id: 3,
              account_name: 'Development',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              num_children: 0,
              account_symbol: '2,USD'
            },
            {
              account_id: 12,
              parent_id: 3,
              account_name: 'Marketing',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              num_children: 0,
              account_symbol: '2,USD'
            },
            {
              account_id: 13,
              parent_id: 3,
              account_name: 'Tech Infrastructure',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              num_children: 0,
              account_symbol: '2,USD'
            },
            {
              account_id: 14,
              parent_id: 3,
              account_name: 'Travel',
              account_subtype: 'Expenses',
              increase_balance: '0.00 USD',
              decrease_balance: '0.00 USD',
              num_children: 0,
              account_symbol: '2,USD'
            }
          ]          

        const provider = eoslime.Provider
        const accountsTable = await provider.select('accounts').from(names.accounts).scope('0').limit(20).find()

        assert.deepEqual(accountsTable, expected, 'The accounts are not right.')

    })

    it('Should edit and delete accounts', async () => {

      await seconduserContract.editaccount(seconduser.name, 0, 6, 'Liquid Primary Test')

      const provider = eoslime.Provider
      let accountsTable = await provider.select('accounts').from(names.accounts).scope('0').limit(20).find()

      accountsTable = accountsTable.map(account => {
        if (account.account_id === 6) {
          return account
        }
      })

      const expectedAccountsTable = [
        {
          account_id: 6,
          parent_id: 1,
          num_children: 0,
          account_name: 'Liquid Primary Test',
          account_subtype: 'Assets',
          increase_balance: '0.00 USD',
          decrease_balance: '0.00 USD',
          account_symbol: '2,USD'
        }
      ]
      
      assert.deepEqual(accountsTable.filter(Boolean), expectedAccountsTable, 'The accounts are not right.')

      await seconduserContract.deleteaccnt(seconduser.name, 0, 6)

      let accountsTableAfterDelete = await provider.select('accounts').from(names.accounts).scope('0').limit(20).find()

      accountsTableAfterDelete = accountsTableAfterDelete.map(account => {
        if (account.account_id === 6) {
          return account
        }
      })

      assert.deepEqual(accountsTableAfterDelete.filter(Boolean), [], 'The accounts are not right.')

    })

})


