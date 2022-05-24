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
  bulkTransaction, 
  bulkTransactionFactory,
  TransactionConstants
} = require("./util/TransactionUtil");

const { func } = require("promisify");
const assert = require("assert");
const { Console } = require("console");

const expect = require("chai").expect;

const { projects, accounts, budgets, permissions, transactions } =
  contractNames;

describe("Tests for transactions smart contract", async function () {
  let contracts, admin, builder, investor, project, fail;

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

    // clear old data
    await contracts.projects.reset({ authorization: `${projects}@active` });
    await contracts.accounts.reset({ authorization: `${accounts}@active` });
    await contracts.budgets.reset({ authorization: `${budgets}@active` });
    await contracts.permissions.reset({ authorization: `${permissions}@active` });
    await contracts.transactions.reset({ authorization: `${transactions}@active` });


    // setup contracts
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
    //console.log('project params is: ', project)

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
    });

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

    // console.log('drawdown table is: ', drawdownTable.rows);

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
          description: transaction.params.description,
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

  const drawdownEditTransactionsCases = [
    { testName: 'Create and edit a transaction for a EB5 drawdown', drawdown_id: 1 },
    { testName: 'Create and edit a transaction for a Construction Loan drawdown', drawdown_id: 2 },
    { testName: 'Create and edit a transaction for a Developer Equity drawdown', drawdown_id: 3 }
  ]

  drawdownEditTransactionsCases.forEach(({ testName, drawdown_id }) => {

    it(testName, async () => {
      // Arrange
      const transaction = await TransactionFactory.createWithDefaults({});
      const transaction_to_edit = await TransactionFactory.createWithDefaults({
        id:1, 
        flag:2, 
        description: "description was edited",
      });

      // Act
      await contracts.transactions.transacts(
        builder.params.account, 
        project.params.id, 
        drawdown_id, 
        transaction.getCreateParams(), 
        { authorization: `${builder.params.account}@active` }
      )


      await contracts.transactions.transacts(
        builder.params.account, 
        project.params.id, 
        drawdown_id, 
        transaction_to_edit.getCreateParams(), 
        { authorization: `${builder.params.account}@active` }
      )

      // Assert    
      const drawdownTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'drawdowns',
        json: true
      });


      // expect(drawdownTable.rows[drawdown_id - 1]).to.include({
      //   state: DrawdownState.daft,
      //   total_amount: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD`
      // });


      const transactionsTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'transactions',
        json: true
      });
      // console.log('\n transactions table is: ', transactionsTable.rows);

      expect(transactionsTable.rows).to.deep.equals([
        {
          accounting: [],
          actor: builder.params.account,
          description: transaction_to_edit.params.description,
          drawdown_id: drawdown_id,
          supporting_files: transaction_to_edit.getCreateParams()[0].supporting_files,
          timestamp: transactionsTable.rows[0].timestamp,
          total_amount: `${transaction_to_edit.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD`,
          transaction_category: 3,
          transaction_id: 1
        }
      ])

      const accountsTable = await rpc.get_table_rows({
        code: accounts,
        scope: project.params.id,
        table: 'accounts',
        json: true
      });

      // // console.table(accountsTable.rows);

      expect(accountsTable.rows[1]).to.include({ increase_balance: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD` });
      expect(accountsTable.rows[5]).to.include({ increase_balance: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD` });

    });

  });

  const drawdownRemoveTransactionsCases = [
    { testName: 'Create and remove a transaction for a EB5 drawdown', drawdown_id: 1 },
    { testName: 'Create and remove a transaction for a Construction Loan drawdown', drawdown_id: 2 },
    { testName: 'Create and remove a transaction for a Developer Equity drawdown', drawdown_id: 3 }
  ]

  drawdownRemoveTransactionsCases.forEach(({ testName, drawdown_id }) => {

    it(testName, async () => {
      // Arrange
      const transaction = await TransactionFactory.createWithDefaults({});
      const transaction_to_remove = await TransactionFactory.createWithDefaults({id: 1});
      Object.assign(transaction_to_remove.params, {
        flag:0
      });
      
      await contracts.transactions.transacts(
        builder.params.account, 
        project.params.id, 
        drawdown_id, 
        transaction.getCreateParams(), 
        { authorization: `${builder.params.account}@active` })

      // Act  
      await contracts.transactions.transacts(
        builder.params.account, 
        project.params.id, 
        drawdown_id, 
        transaction_to_remove.getCreateParams(), 
        { authorization: `${builder.params.account}@active` })

      // Assert    
      const drawdownTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'drawdowns',
        json: true
      });
      //console.log('\n drawdown table is: ', drawdownTable.rows);


      expect(drawdownTable.rows[drawdown_id - 1]).to.include({
        state: DrawdownState.daft,
        total_amount: `${transaction.getCreateParams()[0].amounts[0].amount * 0.0}.00 USD`
      });


      const transactionsTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'transactions',
        json: true
      });
      //console.log('\n transactions table is: ', transactionsTable.rows);

      assert.deepStrictEqual(transactionsTable.rows, [])


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
          description: transaction.params.description,
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
        //console.log(e);
      }
      

      // Assert    
      const drawdownTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'drawdowns',
        json: true
      });

      // console.table(drawdownTable.rows);

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
          description: transaction.params.description,
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
          description: transaction.params.description,
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
      })
    
    });

  });

  //DRAWDOWNS RELATIONS FOR EB5
  it('admin cannot edit an EB5 drawdown in daft state, only builder can', async () => {
    // Arrange
    const transaction = await TransactionFactory.createWithDefaults({});
    const transaction_edited_by_builder = await TransactionFactory.createWithDefaults({
      id: 1, 
      flag: 2,
      description: 'description was edited by builder'
    });
    const transaction_edited_by_admin = await TransactionFactory.createWithDefaults({
      id: 1, 
      flag: 2,
      description: 'description was edited by admin'
    });

    await contracts.transactions.transacts(builder.params.account, 
      project.params.id, 
      1, 
      transaction.getCreateParams(), {
      authorization: `${builder.params.account}@active` }
    );

    await contracts.transactions.transacts(builder.params.account, 
      project.params.id, 
      1, 
      transaction_edited_by_builder.getCreateParams(), {
      authorization: `${builder.params.account}@active` }
    );

    // Act
    try{
      await contracts.transactions.transacts(
        admin.params.account, 
        project.params.id, 
        1, 
        transaction_edited_by_admin.getCreateParams(), 
        { authorization: `${admin.params.account}@active` }
      );
      fail = false;
    } catch (err) {
      fail = true;
      // console.error(err)
    }


    // Assert    
    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'drawdowns',
      json: true
    });
    // console.log('\n drawdown table is: ', drawdownTable.rows);

    const transactionsTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'transactions',
      json: true
    });
    // console.log('\n transactions table is: ', transactionsTable.rows);

    expect(fail).to.be.true

    expect(transactionsTable.rows).to.deep.equals([
      {
        accounting: [],
        actor: builder.params.account,
        description: transaction_edited_by_builder.params.description,
        drawdown_id: 1,
        supporting_files: transaction_edited_by_builder.getCreateParams()[0].supporting_files,
        timestamp: transactionsTable.rows[0].timestamp,
        total_amount: `${transaction_edited_by_builder.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD`,
        transaction_category: 3,
        transaction_id: 1
      }
    ]);

  });

  it('Admin can approve EB5 drawdowns in sumbitted state (->approved state)', async () => {
    // TODO, waiting for its implementation
  });

  it('Issuer can approve EB5 drawdowns in submitted state (-> approved state)', async () => {
    // TODO, waiting for its implementation
    // Issuer need to approve eb5 drawdowns to release the founds
  });
  
  const drawdownDaftTransactionsCasesEb5 = [
    { testName: 'transactions can be only removed in daft drawdown state for EB5', drawdown_id: 1 , flag_id: 0, id_transac: 1},
    { testName: 'transactions can be only created in daft drawdown state for EB5', drawdown_id: 1 , flag_id: 1, id_transac: 2},
    { testName: 'transactions can be only edited in daft drawdown state for EB5', drawdown_id: 1 , flag_id: 2, id_transac: 1}
  ]

  drawdownDaftTransactionsCasesEb5.forEach(({ testName, drawdown_id, flag_id, id_transac }) => {
    it(testName, async () => {
      // Arrange
      const transaction = await TransactionFactory.createWithDefaults({});
      const transaction_executed = await TransactionFactory.createWithDefaults({});
      Object.assign(transaction_executed.params, {
        id: id_transac,
        flag: flag_id
      })

      await contracts.transactions.transacts(builder.params.account, project.params.id, drawdown_id, transaction.getCreateParams(), { authorization: `${builder.params.account}@active` });

      await contracts.transactions.movedrawdown(builder.params.account, project.params.id, drawdown_id, { authorization: `${builder.params.account}@active` });

      //Act
      try {
        await contracts.transactions.transacts(
          builder.params.account, 
          project.params.id, 
          drawdown_id, 
          transaction_executed.getCreateParams(), 
          { authorization: `${builder.params.account}@active` }
        );
        fail = false;
      } catch (err) {
        fail = true;
        //console.error(err);
      }

      // Assert    
      const drawdownTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'drawdowns',
        json: true
      });
      // console.log('\n drawdown table is: ', drawdownTable.rows);

      const transactionsTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'transactions',
        json: true
      });
      // console.log('\n transactions table is: ', transactionsTable.rows);

      expect(fail).to.be.true

      expect(transactionsTable.rows).to.deep.equals([
        {
          accounting: [],
          actor: builder.params.account,
          description: transaction.params.description,
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

      //console.table(accountsTable.rows);

      expect(accountsTable.rows[1]).to.include({ increase_balance: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD` });
      expect(accountsTable.rows[5]).to.include({ increase_balance: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD` });


    });

  });
  
  //DRAWDOWNS RELATIONS FOR CONSTRUCTION LOAN 
  it('admin cannot edit a Construction load drawdown in daft state, only builder can', async () => {
    // Arrange
    const transaction = await TransactionFactory.createWithDefaults({});
    const transaction_edited_by_builder = await TransactionFactory.createWithDefaults({
      id: 1, 
      flag: 2,
      description: 'description was edited by builder'
    });
    const transaction_edited_by_admin = await TransactionFactory.createWithDefaults({
      id: 1, 
      flag: 2,
      description: 'description was edited by admin'
    });

    await contracts.transactions.transacts(builder.params.account, 
      project.params.id, 
      2, 
      transaction.getCreateParams(), {
      authorization: `${builder.params.account}@active` }
    );

    await contracts.transactions.transacts(builder.params.account, 
      project.params.id, 
      2, 
      transaction_edited_by_builder.getCreateParams(), {
      authorization: `${builder.params.account}@active` }
    );

    // Act
    try{
      await contracts.transactions.transacts(
        admin.params.account, 
        project.params.id, 
        2, 
        transaction_edited_by_admin.getCreateParams(), 
        { authorization: `${admin.params.account}@active` }
      );
      fail = false;
    } catch (err) {
      fail = true;
      // console.error(err)
    }


    // Assert    
    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'drawdowns',
      json: true
    });
    // console.log('\n drawdown table is: ', drawdownTable.rows);

    const transactionsTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'transactions',
      json: true
    });
    // console.log('\n transactions table is: ', transactionsTable.rows);

    expect(fail).to.be.true

    expect(transactionsTable.rows).to.deep.equals([
      {
        accounting: [],
        actor: builder.params.account,
        description: transaction_edited_by_builder.params.description,
        drawdown_id: 2,
        supporting_files: transaction_edited_by_builder.getCreateParams()[0].supporting_files,
        timestamp: transactionsTable.rows[0].timestamp,
        total_amount: `${transaction_edited_by_builder.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD`,
        transaction_category: 3,
        transaction_id: 1
      }
    ]);

  }); 

  it('Admin can approve Construction Loan drawdowns in sumbitted state (->approved state)', async () => {
    // TODO, waiting for its implementation
  });

  const drawdownDaftTransactionsCasesConsLoan = [
    { testName: 'transactions can be only removed in daft drawdown state for Construction loan', drawdown_id: 2, flag_id: 0, id_transac: 1},
    { testName: 'transactions can be only created in daft drawdown state for Construction loan', drawdown_id: 2, flag_id: 1, id_transac: 2},
    { testName: 'transactions can be only edited in daft drawdown state for Construction loan', drawdown_id: 2, flag_id: 2, id_transac: 1}
  ]

  drawdownDaftTransactionsCasesConsLoan.forEach(({ testName, drawdown_id, flag_id, id_transac }) => {
    it(testName, async () => {
      // Arrange
      const transaction = await TransactionFactory.createWithDefaults({});
      const transaction_executed = await TransactionFactory.createWithDefaults({});
      Object.assign(transaction_executed.params, {
        id: id_transac,
        flag: flag_id
      })

      await contracts.transactions.transacts(builder.params.account, project.params.id, drawdown_id, transaction.getCreateParams(), { authorization: `${builder.params.account}@active` });

      await contracts.transactions.movedrawdown(builder.params.account, project.params.id, drawdown_id, { authorization: `${builder.params.account}@active` });

      //Act
      try {
        await contracts.transactions.transacts(
          builder.params.account, 
          project.params.id, 
          drawdown_id, 
          transaction_executed.getCreateParams(), 
          { authorization: `${builder.params.account}@active` }
        );
        fail = false;
      } catch (err) {
        fail = true;
        // console.error(err);
      }

      // Assert    
      const drawdownTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'drawdowns',
        json: true
      });
      // console.log('\n drawdown table is: ', drawdownTable.rows);

      const transactionsTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'transactions',
        json: true
      });
      // console.log('\n transactions table is: ', transactionsTable.rows);

      expect(fail).to.be.true

      expect(transactionsTable.rows).to.deep.equals([
        {
          accounting: [],
          actor: builder.params.account,
          description: transaction.params.description,
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

      //console.table(accountsTable.rows);

      expect(accountsTable.rows[1]).to.include({ increase_balance: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD` });
      expect(accountsTable.rows[5]).to.include({ increase_balance: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD` });


    });

  });
  
  it('Only admin can edit a Construction Loan drawdown in submitted state, builder cannot', async () => {
    // TODO: It should be for reviewed state, waiting for its implementation
    // Arrange
    const transaction = await TransactionFactory.createWithDefaults({});
    const transaction_edited_by_builder = await TransactionFactory.createWithDefaults({
      id: 1, 
      flag: 2,
      description: 'description was edited by builder'
    });
    const transaction_edited_by_admin = await TransactionFactory.createWithDefaults({
      id: 1, 
      flag: 2,
      description: 'description was edited by admin'
    });

    await contracts.transactions.transacts(builder.params.account, 
      project.params.id, 
      2, 
      transaction.getCreateParams(), {
      authorization: `${builder.params.account}@active` }
    );

    await contracts.transactions.movedrawdown(
      builder.params.account, 
      project.params.id, 
      2, 
      { authorization: `${builder.params.account}@active` }
    );

    await contracts.transactions.transacts(
      admin.params.account, 
      project.params.id, 
      2, 
      transaction_edited_by_admin.getCreateParams(), {
      authorization: `${admin.params.account}@active` }
    );

    // Act
    try{
      await contracts.transactions.transacts(
        builder.params.account, 
        project.params.id, 
        2, 
        transaction_edited_by_builder.getCreateParams(), 
        { authorization: `${builder.params.account}@active` }
      );
      fail = false;
    } catch (err) {
      fail = true;
      // console.error(err)
    }

    // Assert    
    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'drawdowns',
      json: true
    });
    // console.log('\n drawdown table is: ', drawdownTable.rows);

    const transactionsTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'transactions',
      json: true
    });
    // console.log('\n transactions table is: ', transactionsTable.rows);

    expect(fail).to.be.true

    expect(transactionsTable.rows).to.deep.equals([
      {
        accounting: [],
        actor: admin.params.account,
        description: transaction_edited_by_admin.params.description,
        drawdown_id: 2,
        supporting_files: transaction_edited_by_admin.getCreateParams()[0].supporting_files,
        timestamp: transactionsTable.rows[0].timestamp,
        total_amount: `${transaction_edited_by_admin.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD`,
        transaction_category: 3,
        transaction_id: 1
      }
    ]);

  });


  //DRAWDOWNS RELATIONS FOR DEVELOPER EQUITY
  it('admin cannot edit a Developer Equity drawdown in daft state, only builder can', async () => {
    // Arrange
    const transaction = await TransactionFactory.createWithDefaults({});
    const transaction_edited_by_builder = await TransactionFactory.createWithDefaults({
      id: 1, 
      flag: 2,
      description: 'description was edited by builder'
    });
    const transaction_edited_by_admin = await TransactionFactory.createWithDefaults({
      id: 1, 
      flag: 2,
      description: 'description was edited by admin'
    });

    await contracts.transactions.transacts(builder.params.account, 
      project.params.id, 
      3, 
      transaction.getCreateParams(), {
      authorization: `${builder.params.account}@active` }
    );

    await contracts.transactions.transacts(builder.params.account, 
      project.params.id, 
      3, 
      transaction_edited_by_builder.getCreateParams(), {
      authorization: `${builder.params.account}@active` }
    );

    // Act
    try{
      await contracts.transactions.transacts(
        admin.params.account, 
        project.params.id, 
        3, 
        transaction_edited_by_admin.getCreateParams(), 
        { authorization: `${admin.params.account}@active` }
      );
      fail = false;
    } catch (err) {
      fail = true;
      // console.error(err)
    }


    // Assert    
    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'drawdowns',
      json: true
    });
    // console.log('\n drawdown table is: ', drawdownTable.rows);

    const transactionsTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'transactions',
      json: true
    });
    // console.log('\n transactions table is: ', transactionsTable.rows);

    expect(fail).to.be.true

    expect(transactionsTable.rows).to.deep.equals([
      {
        accounting: [],
        actor: builder.params.account,
        description: transaction_edited_by_builder.params.description,
        drawdown_id: 3,
        supporting_files: transaction_edited_by_builder.getCreateParams()[0].supporting_files,
        timestamp: transactionsTable.rows[0].timestamp,
        total_amount: `${transaction_edited_by_builder.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD`,
        transaction_category: 3,
        transaction_id: 1
      }
    ]);

  }); 

  const drawdownDaftTransactionsCasesDevEquity = [
    { testName: 'transactions can be only removed in daft drawdown state for Developer Equity', drawdown_id: 3, flag_id: 0, id_transac: 1},
    { testName: 'transactions can be only created in daft drawdown state for Developer Equity', drawdown_id: 3, flag_id: 1, id_transac: 2},
    { testName: 'transactions can be only edited in daft drawdown state for Developer Equity', drawdown_id: 3, flag_id: 2, id_transac: 1}
  ]

  drawdownDaftTransactionsCasesDevEquity.forEach(({ testName, drawdown_id, flag_id, id_transac }) => {
    it(testName, async () => {
      // Arrange
      const transaction = await TransactionFactory.createWithDefaults({});
      const transaction_executed = await TransactionFactory.createWithDefaults({});
      Object.assign(transaction_executed.params, {
        id: id_transac,
        flag: flag_id
      })

      await contracts.transactions.transacts(builder.params.account, project.params.id, drawdown_id, transaction.getCreateParams(), { authorization: `${builder.params.account}@active` });

      await contracts.transactions.movedrawdown(builder.params.account, project.params.id, drawdown_id, { authorization: `${builder.params.account}@active` });

      //Act
      try {
        await contracts.transactions.transacts(
          builder.params.account, 
          project.params.id, 
          drawdown_id, 
          transaction_executed.getCreateParams(), 
          { authorization: `${builder.params.account}@active` }
        );
        fail = false;
      } catch (err) {
        fail = true;
        // console.error(err);
      }

      // Assert    
      const drawdownTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'drawdowns',
        json: true
      });
      // console.log('\n drawdown table is: ', drawdownTable.rows);

      const transactionsTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'transactions',
        json: true
      });
      // console.log('\n transactions table is: ', transactionsTable.rows);

      expect(fail).to.be.true

      expect(transactionsTable.rows).to.deep.equals([
        {
          accounting: [],
          actor: builder.params.account,
          description: transaction.params.description,
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

      //console.table(accountsTable.rows);

      expect(accountsTable.rows[1]).to.include({ increase_balance: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD` });
      expect(accountsTable.rows[5]).to.include({ increase_balance: `${transaction.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD` });


    });

  });

  it('Only admin can edit a Developer Equity drawdown in submitted state, builder cannot', async () => {
    // TODO: It should be for reviewed state, waiting for its implementation
    // Arrange
    const transaction = await TransactionFactory.createWithDefaults({});
    const transaction_edited_by_builder = await TransactionFactory.createWithDefaults({
      id: 1, 
      flag: 2,
      description: 'description was edited by builder'
    });
    const transaction_edited_by_admin = await TransactionFactory.createWithDefaults({
      id: 1, 
      flag: 2,
      description: 'description was edited by admin'
    });

    await contracts.transactions.transacts(builder.params.account, 
      project.params.id, 
      3, 
      transaction.getCreateParams(), {
      authorization: `${builder.params.account}@active` }
    );

    await contracts.transactions.movedrawdown(
      builder.params.account, 
      project.params.id, 
      3, 
      { authorization: `${builder.params.account}@active` }
    );

    await contracts.transactions.transacts(
      admin.params.account, 
      project.params.id, 
      3, 
      transaction_edited_by_admin.getCreateParams(), {
      authorization: `${admin.params.account}@active` }
    );

    // Act
    try{
      await contracts.transactions.transacts(
        builder.params.account, 
        project.params.id, 
        3, 
        transaction_edited_by_builder.getCreateParams(), 
        { authorization: `${builder.params.account}@active` }
      );
      fail = false;
    } catch (err) {
      fail = true;
      // console.error(err)
    }

    // Assert    
    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'drawdowns',
      json: true
    });
    // console.log('\n drawdown table is: ', drawdownTable.rows);

    const transactionsTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'transactions',
      json: true
    });
    // console.log('\n transactions table is: ', transactionsTable.rows);

    expect(fail).to.be.true

    expect(transactionsTable.rows).to.deep.equals([
      {
        accounting: [],
        actor: admin.params.account,
        description: transaction_edited_by_admin.params.description,
        drawdown_id: 3,
        supporting_files: transaction_edited_by_admin.getCreateParams()[0].supporting_files,
        timestamp: transactionsTable.rows[0].timestamp,
        total_amount: `${transaction_edited_by_admin.getCreateParams()[0].amounts[0].amount * 0.01}.00 USD`,
        transaction_category: 3,
        transaction_id: 1
      }
    ]);

  });


  it('Rejected drawdowns are sent back to the builder', async () =>{
    // TODO 
  });

  //Bulktransaction Developer Equity
  it('Builder can create bulktransactions for Developer equity drawdown', async ()=>{1
    //Arrange
    const bulk = await bulkTransactionFactory.createWithDefaults({});

    // Act    
    try {
      await contracts.transactions.bulktransact(builder.params.account, 0, 3, bulk.params, 
        { authorization: `${builder.params.account}@active` });
    } catch(err){
      //console.error(err)
    }

    // Assert    
    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'drawdowns',
      json: true
    });
    //console.log('\n drawdown table is: ', JSON.stringify(drawdownTable.rows[2], ' ', 2));

    assert.deepStrictEqual(drawdownTable.rows[2], {
      drawdown_id: drawdownTable.rows[2].drawdown_id,
      drawdown_number: drawdownTable.rows[2].drawdown_number,
      type_str: TransactionConstants.type_str.devEquity,
      type: TransactionConstants.type.devEquity,
      total_amount: drawdownTable.rows[2].total_amount,
      files: [{
        supporting_files: bulk.params[0].supporting_files,
        description:bulk.params[0].description,
        date:String(bulk.params[0].date),
        amount:bulk.params[0].amount,
      }],
      state: 0,
      open_date: drawdownTable.rows[2].open_date,
      close_date: drawdownTable.rows[2].close_date,
      creator: drawdownTable.rows[2].creator
    });

  });

  it('Builder can modify bulktransactions for Developer equity drawdowns', async ()=>{
    // Arrange
    const bulk = await bulkTransactionFactory.createWithDefaults({});
    const bulk2 = await bulkTransactionFactory.createWithDefaults({
      description: "description was modified",
      add_file:2});

    await contracts.transactions.bulktransact(builder.params.account, 0, 3, bulk.params, { authorization: `${builder.params.account}@active` });

    // Act
    try {
      await contracts.transactions.bulktransact(builder.params.account, 0, 3, bulk2.params, { authorization: `${builder.params.account}@active` });
    } catch(err){
      //console.error(err)
    }

    // Assert    
    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'drawdowns',
      json: true
    });
    //console.log('\n drawdown table is: ', JSON.stringify(drawdownTable.rows[2], ' ', 2));

    assert.deepStrictEqual(drawdownTable.rows[2], {
      drawdown_id: drawdownTable.rows[2].drawdown_id,
      drawdown_number: drawdownTable.rows[2].drawdown_number,
      type_str: TransactionConstants.type_str.devEquity,
      type: TransactionConstants.type.devEquity,
      total_amount: drawdownTable.rows[2].total_amount,
      files: [{
        supporting_files: bulk2.params[0].supporting_files,
        description:bulk2.params[0].description,
        date:String(bulk2.params[0].date),
        amount:bulk2.params[0].amount,
      }],
      state: 0,
      open_date: drawdownTable.rows[2].open_date,
      close_date: drawdownTable.rows[2].close_date,
      creator: drawdownTable.rows[2].creator
    });
    
  });

  it('Builder can delete bulktransactions for Developer equity drawdowns', async ()=>{
    // Arrange
    const bulk = await bulkTransactionFactory.createWithDefaults({});
    const bulk2 = await bulkTransactionFactory.createWithDefaults({
      add_file: 0
    });

    await contracts.transactions.bulktransact(builder.params.account, 0, 3, bulk.params, { authorization: `${builder.params.account}@active` });

    // Act
    try {
      await contracts.transactions.bulktransact(builder.params.account, 0, 3, bulk2.params, { authorization: `${builder.params.account}@active` });
    } catch(err){
      //console.error(err)
    }

    // Assert    
    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'drawdowns',
      json: true
    });
    //console.log('\n drawdown table is: ', JSON.stringify(drawdownTable.rows[2], ' ', 2));
    
    assert.deepStrictEqual(drawdownTable.rows[2], {
      drawdown_id: drawdownTable.rows[2].drawdown_id,
      drawdown_number: drawdownTable.rows[2].drawdown_number,
      type_str: TransactionConstants.type_str.devEquity,
      type: TransactionConstants.type.devEquity,
      total_amount: drawdownTable.rows[2].total_amount,
      files: [],
      state: 0,
      open_date: drawdownTable.rows[2].open_date,
      close_date: drawdownTable.rows[2].close_date,
      creator: drawdownTable.rows[2].creator
    });
    
  });

  const builderDevEquityBulkCases = [
    {testName: "Builder cannot create bulktransactions for Developer equity drawdowns once bulktransactions was submitted", numberFile: 1},
    {testName: "Builder cannot edit bulktransactions for Developer equity drawdowns once bulktransactions was submitted", numberFile: 2},
    {testName: "Builder cannot delete bulktransactions for Developer equity drawdowns once bulktransactions was submitted", numberFile: 0}
  ]

  builderDevEquityBulkCases.forEach(({testName, numberFile}) => {
    it(testName, async () =>{
      //Arrange
      const bulk = await bulkTransactionFactory.createWithDefaults({});
      const bulk2 = await bulkTransactionFactory.createWithDefaults({
        add_file: numberFile
      });

      await contracts.transactions.bulktransact(builder.params.account, 0, 3, bulk.params, { authorization: `${builder.params.account}@active` });
      await contracts.transactions.movedrawdown(builder.params.account, 0, 3, { authorization: `${builder.params.account}@active` });

      //Act
      try{
        await contracts.transactions.bulktransact(builder.params.account, 0, 3, bulk2.params, { authorization: `${builder.params.account}@active` });
        fail = false;
      } catch (err) {
        fail = true;
        //console.error(err);
      }

      //Assert
      const drawdownTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'drawdowns',
        json: true
      });
      //console.log('\n drawdown table is: ', JSON.stringify(drawdownTable.rows[2], ' ', 2));
  
      expect(fail).to.be.true;

      assert.deepStrictEqual(drawdownTable.rows[2], {
        drawdown_id: drawdownTable.rows[2].drawdown_id,
        drawdown_number: drawdownTable.rows[2].drawdown_number,
        type_str: TransactionConstants.type_str.devEquity,
        type: TransactionConstants.type.devEquity,
        total_amount: drawdownTable.rows[2].total_amount,
        files: [{
          supporting_files: bulk.params[0].supporting_files,
          description:bulk.params[0].description,
          date:String(bulk.params[0].date),
          amount:bulk.params[0].amount,
        }],
        state: 1,
        open_date: drawdownTable.rows[2].open_date,
        close_date: drawdownTable.rows[2].close_date,
        creator: builder.params.account
      });

    });
  });

  //Bulktransaction Construction Loan
  it('Builder can create bulktransactions for Construction Loan drawdown', async ()=>{1
    //Arrange
    const bulk = await bulkTransactionFactory.createWithDefaults({});

    // Act    
    try {
      await contracts.transactions.bulktransact(builder.params.account, 0, 2, bulk.params, 
        { authorization: `${builder.params.account}@active` });
    } catch(err){
      // console.error(err)
    }

    // Assert    
    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'drawdowns',
      json: true
    });
    //console.log('\n drawdown table is: ', JSON.stringify(drawdownTable.rows[1], ' ', 2));


    assert.deepStrictEqual(drawdownTable.rows[1], {
      drawdown_id: drawdownTable.rows[1].drawdown_id,
      drawdown_number: drawdownTable.rows[1].drawdown_number,
      type_str: TransactionConstants.type_str.consLoan,
      type: TransactionConstants.type.consLoan,
      total_amount: drawdownTable.rows[1].total_amount,
      files: [{
        supporting_files: bulk.params[0].supporting_files,
        description:bulk.params[0].description,
        date:String(bulk.params[0].date),
        amount:bulk.params[0].amount,
      }],
      state: 0,
      open_date: drawdownTable.rows[1].open_date,
      close_date: drawdownTable.rows[1].close_date,
      creator: drawdownTable.rows[1].creator
    });

  });

  it('Builder can modify bulktransactions for Construction Loan drawdown', async ()=>{1
    //Arrange
    const bulk = await bulkTransactionFactory.createWithDefaults({});
    const bulk2 = await bulkTransactionFactory.createWithDefaults({
      description: "description was modified",
      add_file:2});

    await contracts.transactions.bulktransact(builder.params.account, 0, 2, bulk.params, { authorization: `${builder.params.account}@active` });

    // Act    
    try {
      await contracts.transactions.bulktransact(builder.params.account, 0, 2, bulk2.params, 
        { authorization: `${builder.params.account}@active` });
    } catch(err){
      //console.error(err)
    }

    // Assert    
    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'drawdowns',
      json: true
    });
    //console.log('\n drawdown table is: ', JSON.stringify(drawdownTable.rows[1], ' ', 2));

    assert.deepStrictEqual(drawdownTable.rows[1], {
      drawdown_id: drawdownTable.rows[1].drawdown_id,
      drawdown_number: drawdownTable.rows[1].drawdown_number,
      type_str: TransactionConstants.type_str.consLoan,
      type: TransactionConstants.type.consLoan,
      total_amount: drawdownTable.rows[1].total_amount,
      files: [{
        supporting_files: bulk2.params[0].supporting_files,
        description:bulk2.params[0].description,
        date:String(bulk2.params[0].date),
        amount:bulk2.params[0].amount,
      }],
      state: 0,
      open_date: drawdownTable.rows[1].open_date,
      close_date: drawdownTable.rows[1].close_date,
      creator: drawdownTable.rows[1].creator
    });

  });

  it('Builder can delete bulktransactions for Construction Loan drawdown', async ()=>{1
    //Arrange
    const bulk = await bulkTransactionFactory.createWithDefaults({});
    const bulk2 = await bulkTransactionFactory.createWithDefaults({
      add_file: 0
    });

    await contracts.transactions.bulktransact(builder.params.account, 0, 2, bulk.params, { authorization: `${builder.params.account}@active` });

    // Act    
    try {
      await contracts.transactions.bulktransact(builder.params.account, 0, 2, bulk2.params, 
        { authorization: `${builder.params.account}@active` });
    } catch(err){
      //console.error(err)
    }

    // Assert    
    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'drawdowns',
      json: true
    });
    //console.log('\n drawdown table is: ', JSON.stringify(drawdownTable.rows[1], ' ', 2));
   
    assert.deepStrictEqual(drawdownTable.rows[1], {
      drawdown_id: drawdownTable.rows[1].drawdown_id,
      drawdown_number: drawdownTable.rows[1].drawdown_number,
      type_str: TransactionConstants.type_str.consLoan,
      type: TransactionConstants.type.consLoan,
      total_amount: drawdownTable.rows[1].total_amount,
      files: [],
      state: 0,
      open_date: drawdownTable.rows[1].open_date,
      close_date: drawdownTable.rows[1].close_date,
      creator: drawdownTable.rows[1].creator
    });;

  });

  const builderConsLoanBulkCases = [
    {testName: "Builder cannot create bulktransactions for Construction Loan drawdowns once bulktransactions was submitted", numberFile: 1},
    {testName: "Builder cannot edit bulktransactions for Construction Loan drawdowns once bulktransactions was submitted", numberFile: 2},
    {testName: "Builder cannot delete bulktransactions for Construction Loan drawdowns once bulktransactions was submitted", numberFile: 0}
  ]

  builderConsLoanBulkCases.forEach(({testName, numberFile}) => {
    it(testName, async () =>{
      //Arrange
      const bulk = await bulkTransactionFactory.createWithDefaults({});
      const bulk2 = await bulkTransactionFactory.createWithDefaults({
        add_file: numberFile
      });
      await contracts.transactions.bulktransact(builder.params.account, 0, 2, bulk.params, { authorization: `${builder.params.account}@active` });
      await contracts.transactions.movedrawdown(builder.params.account, 0, 2, { authorization: `${builder.params.account}@active` });

      //Act
      try{
        await contracts.transactions.bulktransact(builder.params.account, 0, 2, bulk2, { authorization: `${builder.params.account}@active` });
        fail = false;
      } catch (err) {
        fail = true;
        //console.error(err);
      }

      //Assert
      const drawdownTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'drawdowns',
        json: true
      });
      //console.log('\n drawdown table is: ', JSON.stringify(drawdownTable.rows[1], ' ', 2));
  
      expect(fail).to.be.true;

      assert.deepStrictEqual(drawdownTable.rows[1], {
        drawdown_id: drawdownTable.rows[1].drawdown_id,
        drawdown_number: drawdownTable.rows[1].drawdown_number,
        type_str: TransactionConstants.type_str.consLoan,
        type: TransactionConstants.type.consLoan,
        total_amount: drawdownTable.rows[1].total_amount,
        files: [{
          supporting_files: bulk.params[0].supporting_files,
          description:bulk.params[0].description,
          date:String(bulk.params[0].date),
          amount:bulk.params[0].amount,
        }],
        state: 1,
        open_date: drawdownTable.rows[1].open_date,
        close_date: drawdownTable.rows[1].close_date,
        creator: builder.params.account
      });

    });
  });

 });