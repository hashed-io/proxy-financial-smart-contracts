const { rpc, api, transact } = require('../scripts/eos')
const { getContracts, createRandomAccount, createRandomName } = require('../scripts/eosio-util')
const { assertError } = require('../scripts/eosio-errors')
const { contractNames, contracts: configContracts, isLocalNode, sleep } = require('../scripts/config')

const { updatePermissions } = require('../scripts/permissions')

const { EnvironmentUtil } = require('./util/EnvironmentUtil')
const { EntityFactory, EntityConstants } = require('./util/EntityUtil')
const { ProjectFactory, ProjectConstants, ProjectUtil } = require('./util/ProjectUtil')
const { UserFactory, Roles } = require('./util/UserUtil');
const { Budget, BudgetUtil, BudgetFactory, BudgetConstants } = require('./util/BudgetUtil');
const { TransactionFactory, Flag, DrawdownState } = require('./util/TransactionUtil');
const { AccountFactory, AccountConstants, AccountUtil } = require('./util/AccountUtil');

const { func } = require('promisify')
const assert = require('assert')
const { Console } = require('console')

const expect = require('chai').expect

const { accounts, projects, budgets, permissions, transactions } = contractNames

describe('Tests for budgets ', async function () {
  let contracts, admin, builder, investor;

  before(async function () {
    if (!isLocalNode()) {
      console.log('These tests should only be run on a local node')
      process.exit(1)
    }
  })

  beforeEach(async function () {
    await EnvironmentUtil.initNode()
    await sleep(4000)
    await EnvironmentUtil.deployContracts(configContracts)

    contracts = await getContracts([projects, accounts, budgets, permissions, transactions])

    await updatePermissions()
    console.log('\n')

    // clear old data
    await contracts.projects.reset({ authorization: `${projects}@active` });
    await contracts.accounts.reset({ authorization: `${accounts}@active` });
    await contracts.budgets.reset({ authorization: `${budgets}@active` });
    await contracts.permissions.reset({ authorization: `${permissions}@active` });
    await contracts.transactions.reset({ authorization: `${transactions}@active` });

    // setup contracts
    await contracts.projects.init({ authorization: `${projects}@active` });
    await contracts.accounts.init({ authorization: `${accounts}@active` });

    admin = await UserFactory.createWithDefaults({ role: Roles.fund, account: 'proxyadmin11', user_name: 'Admin', entity_id: 1 });
    investor = await UserFactory.createWithDefaults({ role: Roles.investor, account: 'investoruser', user_name: 'Investor', entity_id: 2 });
    builder = await UserFactory.createWithDefaults({ role: Roles.builder, account: 'builderuser1', user_name: 'Builder', entity_id: 3 });

    await EnvironmentUtil.createAccount('proxyadmin11');
    await EnvironmentUtil.createAccount('investoruser');
    await EnvironmentUtil.createAccount('builderuser1');

    project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })
    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      id: 0,
      builder: builder.params.account,
      investors: [investor.params.account],
    });

    await contracts.projects.approveprjct(admin.params.account, project.params.id,
      { authorization: `${admin.params.account}@active` });


    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })

    //console.log('\n\n Projects table : ', projectsTable)


  })

  afterEach(async function () {
    await EnvironmentUtil.killNode()

  })

  it('Automatically creates a budget when the new Budget Expenditure has an initial amount.', async () => {
    // Arrange
    const new_account = await AccountFactory.createWithDefaults({ actor: admin.params.account, budget_amount: "100.00 USD" });

    //Act
    await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

    // Assert
    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });
    console.table(accountsTable.rows[accountsTable.rows.length - 1]);

    const budgetsTable = await rpc.get_table_rows({
      code: budgets,
      scope: 0,
      table: "budgets",
      json: true,
    });
    console.log("\n\n budgets table : ", budgetsTable.rows);

    assert.deepStrictEqual(budgetsTable.rows, [
      {
        budget_id: 1,
        account_id: 24,
        amount: "100.00 USD",
        budget_creation_date: budgetsTable.rows[0].budget_creation_date,
        budget_update_date: budgetsTable.rows[0].budget_update_date,
        budget_period_id: 1,
        budget_type_id: 1,
      },
      {
        budget_id: 2,
        account_id: 1,
        amount: "100.00 USD",
        budget_creation_date: budgetsTable.rows[0].budget_creation_date,
        budget_update_date: budgetsTable.rows[0].budget_update_date,
        budget_period_id: 1,
        budget_type_id: 1,
      }
    ]);

  });

  it.only('Create a new budget', async ()=>{
    // Arrange
    const new_account = await AccountFactory.createWithDefaults({ actor: admin.params.account, budget_amount: "100.00 USD" });
    console.log(new_account)
    //await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });


    //Act
    const newBudget = await BudgetFactory.createWithDefaults({
    actor: builder.params.account,
    budget_type_id: 0,
    });
    console.log(newBudget)
    const budgetParams = newBudget.getActionParams();

    await BudgetUtil.addbudget({
      actor: newBudget.params.actor,
      project_id: 0,
      account_id: 24,
      amount: newBudget.params.amount,
      budget_type_id: newBudget.params.budget_type_id,
      begin_date: newBudget.params.begin_date,
      end_date: newBudget.params.end_date,
      modify_parents: newBudget.params.modify_parents,
      contract: contracts.budgets,
      contractAccount: newBudget.params.actor,
    })

    //Assert
    const budgetsTable = await rpc.get_table_rows({
      code: budgets,
      scope: 0,
      table: "budgets",
      json: true,
    });
    console.log("\n\n budgets table : ", budgetsTable.rows);

    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });
    console.table(accountsTable.rows[accountsTable.rows.length - 1]);
  });

});


// it("Developer creates a new budget", async function () {

//   //Act
//   const newBudget = await BudgetFactory.createWithDefaults({
//     actor: developerParams[0],
//     budget_type_id: 0,
//   });
//   const budgetParams = newBudget.getActionParams();
//   await BudgetUtil.addbudget({
//     actor: developerParams[0],
//     project_id: 0,
//     account_id: 11,
//     amount: budgetParams[3],
//     budget_type_id: budgetParams[4],
//     begin_date: budgetParams[5],
//     end_date: budgetParams[6],
//     modify_parents: budgetParams[7],
//     contract: contracts.budgets,
//     contractAccount: developerParams[0],
//   });
//   //Assert
//   const budgetsTable = await rpc.get_table_rows({
//     code: budgets,
//     scope: 0,
//     table: "budgets",
//     json: true,
//   });
//   console.log("\n\n budgets table : ", budgetsTable.rows);
//   assert.deepStrictEqual(budgetsTable.rows, [
//     {
//       budget_id: 1,
//       account_id: 11,
//       amount: "10000.00 USD",
//       budget_creation_date: budgetsTable.rows[0].budget_creation_date,
//       budget_update_date: budgetsTable.rows[0].budget_update_date,
//       budget_period_id: 1,
//       budget_type_id: 2,
//     },
//   ]);
// });