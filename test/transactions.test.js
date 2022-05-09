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

    await contracts.projects.approveprjct(admin.params.account, 0, ...project.getApproveActionParams(),
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

  // it('Creation of all drawdown types on project approval', async () => {
  //   console.log('hello')

  //   // Arrange

  //   // Act

  //   // Assert
  //   const drawdownTable = await rpc.get_table_rows({
  //     code: transactions,
  //     scope: project.params.id,
  //     table: 'drawdowns',
  //     json: true
  //   });

  //   console.log(drawdownTable.rows);

  // });

  // it('Update drawdown', async () => {

  //   // Arrange

  //   // Act

  //   // Assert
  //   const drawdownTable = await rpc.get_table_rows({
  //     code: transactions,
  //     scope: project.params.id,
  //     table: 'drawdowns',
  //     json: true
  //   });

  //   console.log(drawdownTable.rows);

  // });

  it('Create transactions', async () => {

    // Arrange
    const transaction = await TransactionFactory.createWithDefaults({});
    //console.log(...transaction.getCreateParams());

    // Act
    await contracts.transactions.transacts(builder.params.account, 0, 1, transaction.getCreateParams(), { authorization: `${builder.params.account}@active` });

    // Assert
    const transactionsTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'transactions',
      json: true
    });

    console.log('\ntransactions table is: \n', transactionsTable.rows);

    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'drawdowns',
      json: true
    });

    console.log('\ndrawdowns table is: \n', drawdownTable.rows);

    assert.deepStrictEqual(transactionsTable.rows, [{
      transaction_id: 1,
      actor: builder.params.account,
      timestamp: transactionsTable.rows[0].timestamp,
      description: 'descrip',
      drawdown_id: 1,
      total_amount: transactionsTable.rows[0].total_amount,
      transaction_category: 3,
      accounting: [],
      supporting_files: transactionsTable.rows[0].supporting_files
    }])


    // const accountsTable = await rpc.get_table_rows({
    //   code: accounts,
    //   scope: project.params.id,
    //   table: 'accounts',
    //   json: true
    // });

    // console.log('\naccounts table is: \n', accountsTable.rows);
    


    // const ledgerTable = await rpc.get_table_rows({
    //   code: accounts,
    //   scope: project.params.id,
    //   table: 'ledgers',
    //   json: true
    // });

    // console.table(ledgerTable.rows);

    // const accountTypesTable = await rpc.get_table_rows({
    //   code: accounts,
    //   scope: accounts,
    //   table: 'accnttypes',
    //   json: true
    // });

    // console.table('\naccount types table is: \n', accountTypesTable.rows);

    // const UserTable = await rpc.get_table_rows({
    //   code: projects,
    //   scope: projects,
    //   table: 'users',
    //   json: true
    // });

    // console.log('\nusers table is: \n', UserTable.rows);

  });

  it.only('Edit a transaction', async function(){
    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'drawdowns',
      json: true
    });
    console.log('\ndrawdowns table is: \n', drawdownTable.rows);
    // Arrange
    const transaction = await TransactionFactory.createWithDefaults({});
    console.log(...transaction.getCreateParams());

    await contracts.transactions.transacts(builder.params.account, 0, 1, transaction.getCreateParams(), { authorization: `${builder.params.account}@active` });

    // Act 
    const editTransaction = await TransactionFactory.createWithDefaults({id:0, flag: Flag.edit, description: 'descrip edited'});
    // Object.assign(editTransaction.params, {
    //   flag: 0
    // })
    //problemas con la flag 0, 

    console.log(...editTransaction.getCreateParams());

    await contracts.transactions.transacts(builder.params.account, 0, 2, editTransaction.getCreateParams(), { authorization: `${builder.params.account}@active` });


    // Assert
    const drawdownTable2 = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'drawdowns',
      json: true
    });
    console.log('\ndrawdowns table is: \n', drawdownTable2.rows);

    const transactionsTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'transactions',
      json: true
    });
    console.log('\ntransactions table is: \n', transactionsTable.rows);


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