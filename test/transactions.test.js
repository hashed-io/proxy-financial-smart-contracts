const { rpc, api, transact } = require('../scripts/eos')
const { getContracts, createRandomAccount, createRandomName } = require('../scripts/eosio-util')

const { assertError } = require('../scripts/eosio-errors')
const { contractNames, contracts: configContracts, isLocalNode, sleep } = require('../scripts/config')

const { updatePermissions } = require('../scripts/permissions')

const { EnvironmentUtil } = require('./util/EnvironmentUtil')
const { EntityFactory, EntityConstants } = require('./util/EntityUtil')
const { ProjectFactory, ProjectConstants, ProjectUtil } = require('./util/ProjectUtil')
const { UserFactory, Roles } = require('./util/UserUtil');
const { TransactionFactory, Flag } = require('./util/TransactionUtil');


const { func } = require('promisify')
const assert = require('assert')
const { Console } = require('console')

const expect = require('chai').expect

const { projects, accounts, budgets, permissions, transactions } = contractNames



describe('Tests for transactions smart contract', async function () {

  let contracts, admin, builder, investor, project

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

    await contracts.projects.init({ authorization: `${projects}@active` });

    await contracts.accounts.init({ authorization: `${accounts}@active` });

    admin = await UserFactory.createWithDefaults({ role: Roles.fund, account: 'proxyadmin11', user_name: 'Admin', entity_id: 1 });
    investor = await UserFactory.createWithDefaults({ role: Roles.investor, account: 'investoruser', user_name: 'Investor', entity_id: 2 });
    builder = await UserFactory.createWithDefaults({ role: Roles.builder, account: 'builderuser1', user_name: 'Builder', entity_id: 3 });

    await EnvironmentUtil.createAccount('proxyadmin11');
    await EnvironmentUtil.createAccount('investoruser');
    await EnvironmentUtil.createAccount('builderuser1');

    project = await ProjectFactory.createWithDefaults({ owner: admin.params.account });

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

    console.log(project)

    await contracts.projects.approveprjct(admin.params.account, ...project.getApproveActionParams(), { authorization: `${admin.params.account}@active` });

    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })

    console.log('\n\n Projects table : ', projectsTable)


  })

  afterEach(async function () {
    await EnvironmentUtil.killNode()

  })

  it('Creation of all drawdown types on project approval', async () => {

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

  });

  it('Update drawdown', async () => {

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

  });

  it.only('Create transactions', async () => {

    // Arrange
    const transaction = await TransactionFactory.createWithDefaults({});
    console.log(...transaction.getCreateParams());

    // Act
    await contracts.transactions.transacts(builder.params.account, 0, 1, transaction.getCreateParams(), { authorization: `${builder.params.account}@active` });

    // Assert
    const permissionsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true
    });

    console.table(permissionsTable.rows);

    
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
      json: true
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
/**
 * @param 
 * 
 * TODO update view my projects []
 * 
 * 
 * 
 */