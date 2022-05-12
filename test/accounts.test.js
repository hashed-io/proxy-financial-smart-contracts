const { rpc, api, transact } = require('../scripts/eos')
const { getContracts, createRandomAccount, createRandomName } = require('../scripts/eosio-util')
const { assertError } = require('../scripts/eosio-errors')
const { contractNames, contracts: configContracts, isLocalNode, sleep } = require('../scripts/config')

const { updatePermissions } = require('../scripts/permissions')

const { EnvironmentUtil } = require('./util/EnvironmentUtil')
const { BudgetFactory, BudgetConstants } = require('./util/BudgetUtil')
const { EntityFactory, EntityConstants } = require('./util/EntityUtil')
const { ProjectFactory, ProjectConstants, ProjectUtil } = require('./util/ProjectUtil')
const { UserFactory, Roles } = require('./util/UserUtil');
const { TransactionFactory, Flag, DrawdownState } = require('./util/TransactionUtil');
const { AccountFactory, AccountConstants, AccountUtil } = require('./util/AccountUtil');

const { func } = require('promisify')
const assert = require('assert')
const { Console } = require('console')

const expect = require('chai').expect

const { accounts, projects, budgets, permissions, transactions } = contractNames

describe('Tests for budget expenditures', async function () {

  let contracts

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
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD"
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


  it('Create all the project\'s budget expenditures', async () => {
    // Arrange

    // Act

    // Assert
    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });

    accountsTable.rows.forEach((account) => {
      // console.table(account)
      expect(account).to.include({
        ledger_id: 1
      });

    })

  });

  const addBudgetExpenditures = [
    { testName: 'Add a new hard cost budget expenditure', parent_id: 1, account_name: 'New hard cost account' },
    { testName: 'Add a new soft cost budget expenditure', parent_id: 2, account_name: 'New soft cost account' }
  ]

  addBudgetExpenditures.forEach(({ testName, parent_id, account_name }) => {
    it(testName, async () => {

      // Arrange
      const new_account = await AccountFactory.createWithDefaults({ actor: admin.params.account, account_name: account_name, parent_id: parent_id });

      // Act
      await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

      // Assert
      const accountsTable = await rpc.get_table_rows({
        code: accounts,
        scope: project.params.id,
        table: 'accounts',
        json: true,
        limit: 100
      });


      // console.table(accountsTable.rows[accountsTable.rows.length - 1]);

      expect(accountsTable.rows[accountsTable.rows.length - 1]).to.include({
        parent_id: parent_id,
        account_name: account_name,
        naics_code: new_account.params.naics_code,
        jobs_multiplier: new_account.params.jobs_multiplier
      })

    });

  });


  it('Edit NAIC code to a given budget expenditure', async () => {
    // Arrange

    // Act

    // Assert


  });

  it('Edit Jobs multiplier to a given budget expenditure', async () => {
    // Arrange

    // Act

    // Assert


  });

  it('Edit name to a given budget expenditure', async () => {
    // Arrange

    // Act

    // Assert


  });


  it('Delete a budget expenditure of a given project', async () => {
    // Arrange

    // Act

    // Assert

    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'drawdowns',
      json: true
    });

    console.table(drawdownTable.rows);

    const transactionsTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'transactions',
      json: true
    });

    console.table(transactionsTable.rows);

    const ledgerTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'ledgers',
      json: true
    });

    console.table(ledgerTable.rows);

    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });

    console.table(accountsTable.rows);

    const accountTypesTable = await rpc.get_table_rows({
      code: accounts,
      scope: accounts,
      table: 'accnttypes',
      json: true
    });

    console.table(accountTypesTable.rows);

    const UserTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'users',
      json: true
    });

    console.table(UserTable.rows);

  });

});