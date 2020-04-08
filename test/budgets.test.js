const assert = require('assert');
const accounts = require('../scripts/accounts.json')
const { names, currency } = require('../scripts/helper')
const projectConfig = require('./config/new_project.json')

function getError (err) {
  return JSON.parse(err).error.details[0].message.replace('assertion failure with message: ', '')
}

describe("Proxy Capital Budgets Contract", function (eoslime) {

    let firstuser = eoslime.Account.load(names.firstuser, accounts[names.firstuser].privateKey, 'active')
    let seconduser = eoslime.Account.load(names.seconduser, accounts[names.seconduser].privateKey, 'active')
    let budgets = eoslime.Account.load(names.budgets, accounts[names.budgets].privateKey, 'active')
    let accountss = eoslime.Account.load(names.accounts, accounts[names.accounts].privateKey, 'active')
    let projects = eoslime.Account.load(names.projects, accounts[names.projects].privateKey, 'active')
    let permissions = eoslime.Account.load(names.permissions, accounts[names.permissions].privateKey, 'active')

    let firstuserContract
    let seconduserContract
    let budgetsContract
    let accountssContract
    let projectsContract
    let permissionsContract

    before(async () => {

        firstuserContract = await eoslime.Contract.at(names.budgets, firstuser)
        seconduserContract = await eoslime.Contract.at(names.budgets, seconduser)
        seconduserContractProjects = await eoslime.Contract.at(names.projects, seconduser)
        seconduserContractAccounts = await eoslime.Contract.at(names.accounts, seconduser)
        budgetsContract = await eoslime.Contract.at(names.budgets, budgets)
        accountssContract = await eoslime.Contract.at(names.accounts, accountss)
        projectsContract = await eoslime.Contract.at(names.projects, projects)
        permissionsContract = await eoslime.Contract.at(names.permissions, permissions)

        console.log('reset permissions contract')
        await permissionsContract.reset()

        console.log('reset budgets contract')
        await budgetsContract.reset()

        console.log('reset accounts contract')
        await accountssContract.reset()

        console.log('reset projects contract')
        await projectsContract.reset()

    })

    it('Should create total budgets', async () => {
    
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
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Liquid Primary', 1, currency, 'Test description 6', 1)      // id = 11
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Reserve Account', 1, currency, 'Test description 7', 1)     // id = 12

        // Equity children
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Investments', 2, currency, 'Test description 8', 3)         // id = 13
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Franklin Johnson', 8, currency, 'Test description 9', 3)    // id = 14
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Michelle Wu', 8, currency, 'Test description 10', 3)         // id = 15

        // Expenses children
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Development', 3, currency, 'Test description 11', 3)         // id = 16
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Marketing', 3, currency, 'Test description 12', 2)           // id = 17
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Tech Infrastructure', 3, currency, 'Test description 13', 2) // id = 18
        await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Travel', 3, currency, 'Test description 14', 2)              // id = 19
        

      // travel children
      await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Flights', 19, currency, '---', 2)  // id = 20
      await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Bus', 19, currency, '---', 2)      // id = 21
      await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Taxis', 19, currency, '---', 2)    // id = 22

      await seconduserContract.addbudget(seconduser.name, 0, 22, "300.00 USD", 1, 1585762692, 1588354692, 1)
      await seconduserContract.addbudget(seconduser.name, 0, 21, "200.00 USD", 1, 1585762692, 1588354692, 1)

      try {
        await seconduserContract.addbudget(seconduser.name, 0, 20, "700.00 USD", 1, 1585762692, 1588354692, 0)
      } catch (err) {
        assert.deepEqual(getError(err), 'proxycapbdgt: the child can not have more budget than its parent, account_id = 20 parent_budget = 500.00 USD.', 'Something else went wrong.')
      }

      await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Backend', 16, currency, '---', 3)    // id = 23
      await seconduserContractAccounts.addaccount(seconduser.name, 0, 'Frontend', 16, currency, '---', 3)   // id = 24

      await seconduserContract.addbudget(seconduser.name, 0, 23, "200.00 USD", 1, 1585762692, 1588354692, 0)
      await seconduserContract.addbudget(seconduser.name, 0, 24, "200.00 USD", 1, 1585762692, 1588354692, 0)

      await seconduserContract.addbudget(seconduser.name, 0, 16, "350.00 USD", 1, 1585762692, 1588354692, 1)

      const provider = eoslime.Provider
      let budgetsDatesTable = await provider.select('budgetpriods').from(names.budgets).scope('0').limit(20).find()
      let budgetsTable = await provider.select('budgets').from(names.budgets).scope('0').limit(20).find()

      const expectedDatesTable = [
        { budget_period_id: 1, begin_date: 0, end_date: 0, budget_type_id: 1 }
      ]      

      const expectedBudgets = [
        {
          budget_id: 1,
          account_id: 22,
          amount: '300.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 2,
          account_id: 19,
          amount: '500.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 3,
          account_id: 3,
          amount: '900.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 4,
          account_id: 21,
          amount: '200.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 5,
          account_id: 23,
          amount: '200.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 6,
          account_id: 24,
          amount: '200.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 7,
          account_id: 16,
          amount: '400.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        }
      ]      
      
      assert.deepEqual(budgetsDatesTable, expectedDatesTable, 'The budgets dates are not right.')

      budgetsTable = budgetsTable.map(row => {
        return {
          budget_id: row.budget_id,
          account_id: row.account_id,
          amount: row.amount,
          budget_period_id: row.budget_period_id,
          budget_type_id: row.budget_type_id
        }
      })

      assert.deepEqual(budgetsTable, expectedBudgets, 'The budgets are not right.')

    })

    it('Should create any date budgets', async () => {

      await seconduserContract.addbudget(seconduser.name, 0, 22, "300.00 USD", 2, 1585762692, 1588354692, 0)
      await seconduserContract.addbudget(seconduser.name, 0, 21, "200.00 USD", 2, 1585762692, 1588354692, 0)

      try {
        await seconduserContract.addbudget(seconduser.name, 0, 22, "300.00 USD", 2, 1585762692, 1588354392, 1)
      } catch (err) {
        assert.deepEqual(getError(err), 'proxycapbdgt: the interval from begin to end overlaps with an existing budget.', 'Something else went wrong.')
      }

      await seconduserContract.addbudget(seconduser.name, 0, 22, "300.00 USD", 2, 1588441092, 1591033092, 0)
      await seconduserContract.addbudget(seconduser.name, 0, 22, "300.00 USD", 2, 1585762692, 1588354692, 1)

      const provider = eoslime.Provider
      let budgetsDatesTable = await provider.select('budgetpriods').from(names.budgets).scope('0').limit(20).find()
      let budgetsTable = await provider.select('budgets').from(names.budgets).scope('0').limit(20).find()

      const expectedDatesTable = [
        { budget_period_id: 1, begin_date: 0, end_date: 0, budget_type_id: 1 },
        {
          budget_period_id: 2,
          begin_date: 1585762692,
          end_date: 1588354692,
          budget_type_id: 2
        },
        {
          budget_period_id: 3,
          begin_date: 1588441092,
          end_date: 1591033092,
          budget_type_id: 2
        }
      ]           

      const expectedBudgets = [
        {
          budget_id: 1,
          account_id: 22,
          amount: '300.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 2,
          account_id: 19,
          amount: '500.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 3,
          account_id: 3,
          amount: '900.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 4,
          account_id: 21,
          amount: '200.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 5,
          account_id: 23,
          amount: '200.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 6,
          account_id: 24,
          amount: '200.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 7,
          account_id: 16,
          amount: '400.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 8,
          account_id: 22,
          amount: '600.00 USD',
          budget_period_id: 2,
          budget_type_id: 2
        },
        {
          budget_id: 9,
          account_id: 21,
          amount: '200.00 USD',
          budget_period_id: 2,
          budget_type_id: 2
        },
        {
          budget_id: 10,
          account_id: 22,
          amount: '300.00 USD',
          budget_period_id: 3,
          budget_type_id: 2
        },
        {
          budget_id: 11,
          account_id: 19,
          amount: '800.00 USD',
          budget_period_id: 2,
          budget_type_id: 2
        },
        {
          budget_id: 12,
          account_id: 3,
          amount: '800.00 USD',
          budget_period_id: 2,
          budget_type_id: 2
        }
      ]      
      
      assert.deepEqual(budgetsDatesTable, expectedDatesTable, 'The budgets dates are not right.')

      budgetsTable = budgetsTable.map(row => {
        return {
          budget_id: row.budget_id,
          account_id: row.account_id,
          amount: row.amount,
          budget_period_id: row.budget_period_id,
          budget_type_id: row.budget_type_id
        }
      })

      assert.deepEqual(budgetsTable, expectedBudgets, 'The budgets are not right.')

    })

    it('Should delete budgets', async () => {

      await seconduserContract.deletebudget(seconduser.name, 0, 2, 1) // account_id = 19
      await seconduserContract.deletebudget(seconduser.name, 0, 1, 1)
      await seconduserContract.deletebudget(seconduser.name, 0, 10, 1)
      await seconduserContract.deletebudget(seconduser.name, 0, 9, 1)
      await seconduserContract.deletebudget(seconduser.name, 0, 6, 0)

      const provider = eoslime.Provider
      let budgetsDatesTable = await provider.select('budgetpriods').from(names.budgets).scope('0').limit(20).find()
      let budgetsTable = await provider.select('budgets').from(names.budgets).scope('0').limit(20).find()

      const expectedDatesTable = [
        { budget_period_id: 1, begin_date: 0, end_date: 0, budget_type_id: 1 },
        {
          budget_period_id: 2,
          begin_date: 1585762692,
          end_date: 1588354692,
          budget_type_id: 2
        }
      ]          

      const expectedBudgets = [
        {
          budget_id: 3,
          account_id: 3,
          amount: '400.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 4,
          account_id: 21,
          amount: '200.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 5,
          account_id: 23,
          amount: '200.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 7,
          account_id: 16,
          amount: '400.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 8,
          account_id: 22,
          amount: '600.00 USD',
          budget_period_id: 2,
          budget_type_id: 2
        },
        {
          budget_id: 11,
          account_id: 19,
          amount: '600.00 USD',
          budget_period_id: 2,
          budget_type_id: 2
        },
        {
          budget_id: 12,
          account_id: 3,
          amount: '600.00 USD',
          budget_period_id: 2,
          budget_type_id: 2
        }
      ]      
      
      assert.deepEqual(budgetsDatesTable, expectedDatesTable, 'The budgets dates are not right.')

      budgetsTable = budgetsTable.map(row => {
        return {
          budget_id: row.budget_id,
          account_id: row.account_id,
          amount: row.amount,
          budget_period_id: row.budget_period_id,
          budget_type_id: row.budget_type_id
        }
      })

      assert.deepEqual(budgetsTable, expectedBudgets, 'The budgets are not right.')

    })

    it('Should edit budgets', async() => {

      await seconduserContract.addbudget(seconduser.name, 0, 20, "100.00 USD", 2, 1585762692, 1588354692, 1)
      await seconduserContract.editbudget(seconduser.name, 0, 8, "550.00 USD", 1, 1585762692, 1588354692, 1)
      await seconduserContract.editbudget(seconduser.name, 0, 5, "250.00 USD", 1, 1585762692, 1588354692, 1)

      try {
        await seconduserContract.editbudget(seconduser.name, 0, 13, "350.00 USD", 2, 1585762692, 1588354192, 1)
      } catch (err) {
        assert.deepEqual(getError(err), 'proxycapbdgt: the interval from begin to end overlaps with an existing budget.', 'Something else went wrong.')
      }

      try {
        await seconduserContract.editbudget(seconduser.name, 0, 13, "350.00 USD", 2, 1585762692, 1588354692, 0)
      } catch (err) {
        assert.deepEqual(getError(err), 'proxycapbdgt: the child can not have more budget than its parent, account_id = 20 parent_budget = 100.00 USD.', 'Something else went wrong.')
      }

      const provider = eoslime.Provider
      let budgetsDatesTable = await provider.select('budgetpriods').from(names.budgets).scope('0').limit(20).find()
      let budgetsTable = await provider.select('budgets').from(names.budgets).scope('0').limit(20).find()

      const expectedDatesTable = [
        { budget_period_id: 1, begin_date: 0, end_date: 0, budget_type_id: 1 },
        {
          budget_period_id: 2,
          begin_date: 1585762692,
          end_date: 1588354692,
          budget_type_id: 2
        }
      ]

      const expectedBudgets = [
        {
          budget_id: 3,
          account_id: 3,
          amount: '1000.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 4,
          account_id: 21,
          amount: '200.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 7,
          account_id: 16,
          amount: '250.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 11,
          account_id: 19,
          amount: '100.00 USD',
          budget_period_id: 2,
          budget_type_id: 2
        },
        {
          budget_id: 12,
          account_id: 3,
          amount: '100.00 USD',
          budget_period_id: 2,
          budget_type_id: 2
        },
        {
          budget_id: 13,
          account_id: 20,
          amount: '100.00 USD',
          budget_period_id: 2,
          budget_type_id: 2
        },
        {
          budget_id: 14,
          account_id: 22,
          amount: '550.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 15,
          account_id: 19,
          amount: '750.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        },
        {
          budget_id: 16,
          account_id: 23,
          amount: '250.00 USD',
          budget_period_id: 1,
          budget_type_id: 1
        }
      ]      
      
      assert.deepEqual(budgetsDatesTable, expectedDatesTable, 'The budgets dates are not right.')

      budgetsTable = budgetsTable.map(row => {
        return {
          budget_id: row.budget_id,
          account_id: row.account_id,
          amount: row.amount,
          budget_period_id: row.budget_period_id,
          budget_type_id: row.budget_type_id
        }
      })

      assert.deepEqual(budgetsTable, expectedBudgets, 'The budgets are not right.')

    })

    it('Should delete all the budgets for all the accounts', async () => {

      await budgetsContract.delbdgtsacct(0, 3)
      await budgetsContract.delbdgtsacct(0, 19)
      await budgetsContract.delbdgtsacct(0, 22)
      await budgetsContract.delbdgtsacct(0, 21)
      await budgetsContract.delbdgtsacct(0, 20)
      await budgetsContract.delbdgtsacct(0, 16)
      await budgetsContract.delbdgtsacct(0, 23)

      const provider = eoslime.Provider
      let budgetsDatesTable = await provider.select('budgetpriods').from(names.budgets).scope('0').limit(20).find()
      let budgetsTable = await provider.select('budgets').from(names.budgets).scope('0').limit(20).find()

      assert.deepEqual(budgetsDatesTable, [], 'The budgets dates are not right.')
      assert.deepEqual(budgetsTable, [], 'The budgets are not right.')

    })

})
