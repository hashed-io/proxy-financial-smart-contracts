const { rpc, api, transact } = require("../scripts/eos");
const {
  getContracts,
  createRandomAccount,
  createRandomName,
} = require("../scripts/eosio-util");

const { assertError } = require("../scripts/eosio-errors");
const {
  contractNames,
  contracts: configContracts,
  isLocalNode,
  sleep,
} = require("../scripts/config");

const { updatePermissions } = require("../scripts/permissions");

const { EnvironmentUtil } = require("./util/EnvironmentUtil");
const { EntityFactory, EntityConstants } = require("./util/EntityUtil");
const {
  ProjectFactory,
  ProjectConstants,
  ProjectUtil,
} = require("./util/ProjectUtil");
const { UserFactory, Roles } = require("./util/UserUtil");
const {
  TransactionFactory,
  Flag,
  DrawdownState,
} = require("./util/TransactionUtil");

const { func } = require("promisify");
const assert = require("assert");
const { Console } = require("console");

const expect = require("chai").expect;

const { projects, accounts, budgets, permissions, transactions } =
  contractNames;

describe("Tests for transactions smart contract", async function () {
  let contracts, admin, builder, investor, project;

  before(async function () {
    if (!isLocalNode()) {
      console.log("These tests should only be run on a local node");
      process.exit(1);
    }
  });

  beforeEach(async function () {
    await EnvironmentUtil.initNode();
    await sleep(4000);
    await EnvironmentUtil.deployContracts(configContracts);

    contracts = await getContracts([
      projects,
      accounts,
      budgets,
      permissions,
      transactions,
    ]);

    await updatePermissions();
    console.log("\n");

    await contracts.projects.init({ authorization: `${projects}@active` });

    await contracts.accounts.init({ authorization: `${accounts}@active` });

    admin = await UserFactory.createWithDefaults({
      role: Roles.fund,
      account: "proxyadmin11",
      user_name: "Admin",
      entity_id: 1,
    });
    investor = await UserFactory.createWithDefaults({
      role: Roles.investor,
      account: "investoruser",
      user_name: "Investor",
      entity_id: 2,
    });
    builder = await UserFactory.createWithDefaults({
      role: Roles.builder,
      account: "builderuser1",
      user_name: "Builder",
      entity_id: 3,
    });

    await EnvironmentUtil.createAccount("proxyadmin11");
    await EnvironmentUtil.createAccount("investoruser");
    await EnvironmentUtil.createAccount("builderuser1");

    project = await ProjectFactory.createWithDefaults({
      actor: admin.params.account,
    });

    await contracts.projects.addproject(...project.getCreateActionParams(), {
      authorization: `${admin.params.account}@active`,
    });

    await contracts.projects.assignuser(
      admin.params.account,
      builder.params.account,
      0,
      { authorization: `${admin.params.account}@active` }
    );
    await contracts.projects.assignuser(
      admin.params.account,
      investor.params.account,
      0,
      { authorization: `${admin.params.account}@active` }
    );

    Object.assign(project.params, {
      status: 1,
      id: 0,
      builder: builder.params.account,
      investors: [investor.params.account],
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD",
    });

    await contracts.projects.approveprjct(
      admin.params.account,
      project.params.id,
      ...project.getApproveActionParams(),
      { authorization: `${admin.params.account}@active` }
    );

    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });

    //console.log('\n\n Projects table : ', projectsTable)
  });

  afterEach(async function () {
    await EnvironmentUtil.killNode();
  });

  it("Creation of all drawdown types on project approval", async () => {
    // Arrange

    // Act

    // Assert
    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: "drawdowns",
      json: true,
    });

    //console.log('drawdown table is: ', drawdownTable.rows);

    expect(drawdownTable.rows).to.deep.equals([
      { 
        drawdown_id: 1,
        drawdown_number: 1,
        type_str: "EB-5",
        type: "eb5",
        total_amount: "0.00 USD",
        files: [],
        state: 0,
        open_date: drawdownTable.rows[0].open_date,
        close_date: 0,
        creator: "",
      },
      {
        drawdown_id: 2,
        drawdown_number: 1,
        type_str: "Construction Loan",
        type: "constrcloan",
        total_amount: "0.00 USD",
        files: [],
        state: 0,
        open_date: drawdownTable.rows[1].open_date,
        close_date: 0,
        creator: "",
      },
      {
        drawdown_id: 3,
        drawdown_number: 1,
        type_str: "Developer Equity",
        type: "devequity",
        total_amount: "0.00 USD",
        files: [],
        state: 0,
        open_date: drawdownTable.rows[2].open_date,
        close_date: 0,
        creator: "",
      },
    ]);


  });

  const drawdownTransactionsCases = [
    { testName: 'Create a transaction for a EB5 drawdown', drawdown_id: 1 },
    { testName: 'Create a transaction for a Construction Loan drawdown', drawdown_id: 2 },
    { testName: 'Create a transaction for a Developer Equity drawdown', drawdown_id: 3 }
  ]


  drawdownTransactionsCases.forEach(({ testName, drawdown_id }) => {

    it(testName, async () => {
      // Arrange
      const transaction = await TransactionFactory.createWithDefaults({});
      // console.log(transaction.getCreateParams());

      // Act
      await contracts.transactions.transacts(builder.params.account, project.params.id, drawdown_id, transaction.getCreateParams(), { authorization: `${builder.params.account}@active` });

      // Assert    
      const drawdownTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'drawdowns',
        json: true
      });

      expect(drawdownTable.rows[drawdown_id - 1]).to.include({
        state: DrawdownState.daft,
        total_amount: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD`
      });


      const transactionsTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'transactions',
        json: true
      });

      expect(transactionsTable.rows).to.deep.equals([
        {
          accounting: [],
          actor: builder.params.account,
          description: 'descrip',
          drawdown_id: drawdown_id,
          supporting_files: transaction.getCreateParams()[0].supporting_files,
          timestamp: transactionsTable.rows[0].timestamp,
          total_amount: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD`,
          transaction_category: 3,
          transaction_id: 1
        }
      ]);


      const accountsTable = await rpc.get_table_rows({
        code: accounts,
        scope: project.params.id,
        table: 'accounts',
        json: true
      });

      // console.table(accountsTable.rows);

      expect(accountsTable.rows[1]).to.include({ increase_balance: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD` });
      expect(accountsTable.rows[5]).to.include({ increase_balance: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD` });

    });

  });


  const drawdownSubmitCases = [
    { testName: 'Submit a EB5 drawdown', drawdown_id: 1 },
    { testName: 'Submit a Construction Loan drawdown', drawdown_id: 2 },
    { testName: 'Submit a Developer Equity drawdown', drawdown_id: 3 }
  ]

  drawdownSubmitCases.forEach(({ testName, drawdown_id }) => {
    it(testName, async () => {
      // Arrange
      const transaction = await TransactionFactory.createWithDefaults({});
      // console.log(...transaction.getCreateParams());

      await contracts.transactions.transacts(builder.params.account, project.params.id, drawdown_id, transaction.getCreateParams(), { authorization: `${builder.params.account}@active` });

      // Act
      await contracts.transactions.movedrawdown(builder.params.account, project.params.id, drawdown_id, { authorization: `${builder.params.account}@active` });

      // Assert    
      const drawdownTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'drawdowns',
        json: true
      });

      expect(drawdownTable.rows[drawdown_id - 1]).to.include({
        state: DrawdownState.submitted,
        total_amount: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD`
      });

      const transactionsTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'transactions',
        json: true
      });

      expect(transactionsTable.rows).to.deep.equals([
        {
          accounting: [],
          actor: builder.params.account,
          description: 'descrip',
          drawdown_id: drawdown_id,
          supporting_files: transaction.getCreateParams()[0].supporting_files,
          timestamp: transactionsTable.rows[0].timestamp,
          total_amount: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD`,
          transaction_category: 3,
          transaction_id: 1
        }
      ]);

      const accountsTable = await rpc.get_table_rows({
        code: accounts,
        scope: project.params.id,
        table: 'accounts',
        json: true
      });

      // console.table(accountsTable.rows);

      expect(accountsTable.rows[1]).to.include({ increase_balance: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD` });
      expect(accountsTable.rows[5]).to.include({ increase_balance: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD` });



    });

  });

  const drawdownApproveCases = [
    { testName: 'Approve a submitted EB5 drawdown', drawdown_id: 1 },
    { testName: 'Approve a submitted Construction Loan drawdown', drawdown_id: 2 },
    { testName: 'Approve a submitted Developer Equity drawdown', drawdown_id: 3 }
  ]

  drawdownApproveCases.forEach(({ testName, drawdown_id }) => {
    it(testName, async () => {
      // Arrange
      const transaction = await TransactionFactory.createWithDefaults({});
      // console.log(...transaction.getCreateParams());

      await contracts.transactions.transacts(builder.params.account, project.params.id, drawdown_id, transaction.getCreateParams(), { authorization: `${builder.params.account}@active` });
      await contracts.transactions.movedrawdown(builder.params.account, project.params.id, drawdown_id, { authorization: `${builder.params.account}@active` });

      // Act
      try {
        await contracts.transactions.acptdrawdown(admin.params.account, project.params.id, drawdown_id, { authorization: `${admin.params.account}@active` });
        
      } catch (e) {
        console.log(e);
      }
      

      // Assert    
      const drawdownTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'drawdowns',
        json: true
      });

      console.table(drawdownTable.rows);

      expect(drawdownTable.rows[drawdown_id - 1]).to.include({
        state: DrawdownState.approved,
        total_amount: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD`
      });

      const transactionsTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'transactions',
        json: true
      });

      expect(transactionsTable.rows).to.deep.equals([
        {
          accounting: [],
          actor: builder.params.account,
          description: 'descrip',
          drawdown_id: drawdown_id,
          supporting_files: transaction.getCreateParams()[0].supporting_files,
          timestamp: transactionsTable.rows[0].timestamp,
          total_amount: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD`,
          transaction_category: 3,
          transaction_id: 1
        }
      ]);

      const accountsTable = await rpc.get_table_rows({
        code: accounts,
        scope: project.params.id,
        table: 'accounts',
        json: true
      });

      // console.table(accountsTable.rows);

      expect(accountsTable.rows[1]).to.include({ increase_balance: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD` });
      expect(accountsTable.rows[5]).to.include({ increase_balance: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD` });



    });

  });

  const drawdownRejectCases = [
    { testName: 'Reject a submitted EB5 drawdown', drawdown_id: 1 },
    { testName: 'Reject a submitted Construction Loan drawdown', drawdown_id: 2 },
    { testName: 'Reject a submitted Developer Equity drawdown', drawdown_id: 3 }
  ]

  drawdownRejectCases.forEach(({ testName, drawdown_id }) => {
    it(testName, async () => {
      // Arrange
      const transaction = await TransactionFactory.createWithDefaults({});
      // console.log(...transaction.getCreateParams());

      await contracts.transactions.transacts(builder.params.account, project.params.id, drawdown_id, transaction.getCreateParams(), { authorization: `${builder.params.account}@active` });
      await contracts.transactions.movedrawdown(builder.params.account, project.params.id, drawdown_id, { authorization: `${builder.params.account}@active` });

      // Act
      await contracts.transactions.rejtdrawdown(admin.params.account, project.params.id, drawdown_id, { authorization: `${admin.params.account}@active` });

      // Assert    
      const drawdownTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'drawdowns',
        json: true
      });

      // console.log(drawdownTable);

      expect(drawdownTable.rows[drawdown_id - 1]).to.include({
        state: DrawdownState.daft,
        total_amount: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD`
      });

      const transactionsTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'transactions',
        json: true
      });

      expect(transactionsTable.rows).to.deep.equals([
        {
          accounting: [],
          actor: builder.params.account,
          description: 'descrip',
          drawdown_id: drawdown_id,
          supporting_files: transaction.getCreateParams()[0].supporting_files,
          timestamp: transactionsTable.rows[0].timestamp,
          total_amount: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD`,
          transaction_category: 3,
          transaction_id: 1
        }
      ]);

      const accountsTable = await rpc.get_table_rows({
        code: accounts,
        scope: project.params.id,
        table: 'accounts',
        json: true
      });
    });

  it("Create and remove a transaction for the project", async () => {
    // Arrange
    const transaction = await TransactionFactory.createWithDefaults({});
    //console.log(...transaction.getCreateParams());

    // Act
    await contracts.transactions.transacts(
      builder.params.account,
      project.params.id,
      1,
      transaction.getCreateParams(),
      { authorization: `${builder.params.account}@active` }
    );

    // Assert

    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: "drawdowns",
      json: true,
    });

    //console.table(drawdownTable.rows);

    const transactionsTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: "transactions",
      json: true,
    });

    //console.table(transactionsTable.rows);

    const ledgerTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: "ledgers",
      json: true,
    });

    //console.table(ledgerTable.rows);

    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: "accounts",
      json: true,
    });

    //console.table(accountsTable.rows);

    const accountTypesTable = await rpc.get_table_rows({
      code: accounts,
      scope: accounts,
      table: "accnttypes",
      json: true,
    });

    //table(accountTypesTable.rows);

    const UserTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "users",
      json: true,
    });

    //console.table(UserTable.rows);
  });

});
// TODO: CHECK WHERE ADMIN CAN EDIT (status)
// it.only('admin can edit transactions in submit state', async () => {
//   //arrange
//   let fail
//   const transaction = await TransactionFactory.createWithDefaults({flag: 1});
//   console.log(transaction)
//   eb5

//   //act
//   try{
//     await contracts.transactions.transacts(admin.params.account, project.params.id, 1, transaction.getCreateParams(), { authorization: `${admin.params.account}@active` });
//     fail = false
//   } catch (err) {
//     console.log(err)
//     fail = true
//   }
//   //assert
//   //expect(fail).to.be.true
// });

});
