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

  let contracts, admin, builder, investor, project;

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

  it('Only admin can create new Budget Expenditures', async () => {
    // Arrange
    let fail
    const new_account = await AccountFactory.createWithDefaults({ actor: investor.params.account });

    // Act
    try {
      await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${investor.params.account}@active` });
      fail = false
    } catch (err) {
      //console.error(err)
      fail = true
    }


    // Assert
    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });
    // console.log(accountsTable)
    //console.table(accountsTable.rows[accountsTable.rows.length - 1]);

    expect(fail).to.be.true


  })

  it('Cannot create budget expenditures under another parent_id (soft/hard cost)', async () => {
    // Arrange
    let fail
    const new_account = await AccountFactory.createWithDefaults({ actor: admin.params.account, parent_id: 3 });
    // console.log(new_account)

    // Act
    try {
      await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
      fail = false
    } catch (err) {
      fail = true
    }

    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });
    // console.log(accountsTable)
    // console.log(accountsTable.rows);


    expect(fail).to.be.true

  })

  it('Edit NAIC code to a given budget expenditure', async () => {
    // Arrange
    const new_account = await AccountFactory.createWithDefaults({ actor: admin.params.account });
    await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

    // Act
    await AccountUtil.editaccount({
      actor: new_account.params.actor,
      project_id: new_account.params.project_id,
      account_id: 24,
      account_name: new_account.params.account_name,
      description: new_account.params.description,
      account_category: new_account.params.account_category,
      budget_amount: new_account.params.budget_amount,
      naics_code: 6665166,
      jobs_multiplier: new_account.params.jobs_multiplier,
      contract: contracts.accounts,
      contractAccount: admin.params.account
    })

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
      account_id: 24,
      parent_id: new_account.params.parent_id,
      account_name: new_account.params.account_name,
      description: new_account.params.description,
      naics_code: 6665166,
      jobs_multiplier: new_account.params.jobs_multiplier,
    })

  });

  it('Edit Jobs multiplier to a given budget expenditure', async () => {
    // Arrange
    const new_account = await AccountFactory.createWithDefaults({ actor: admin.params.account });
    await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    // console.log('params is: ', new_account.params)

    // Act
    await AccountUtil.editaccount({
      actor: new_account.params.actor,
      project_id: new_account.params.project_id,
      account_id: 24,
      account_name: new_account.params.account_name,
      description: new_account.params.description,
      account_category: new_account.params.account_category,
      budget_amount: new_account.params.budget_amount,
      naics_code: new_account.params.naics_code,
      jobs_multiplier: 89445,
      contract: contracts.accounts,
      contractAccount: admin.params.account
    })

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
      account_id: 24,
      parent_id: new_account.params.parent_id,
      account_name: new_account.params.account_name,
      description: new_account.params.description,
      naics_code: new_account.params.naics_code,
      jobs_multiplier: 89445,
    })

  });

  it('Edit name to a given budget expenditure', async () => {
    // Arrange
    const new_account = await AccountFactory.createWithDefaults({ actor: admin.params.account });
    await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    // console.log('params is: ', new_account.params)

    // Act
    await AccountUtil.editaccount({
      actor: new_account.params.actor,
      project_id: new_account.params.project_id,
      account_id: 24,
      account_name: 'Name was edited',
      description: new_account.params.description,
      account_category: new_account.params.account_category,
      budget_amount: new_account.params.budget_amount,
      naics_code: new_account.params.naics_code,
      jobs_multiplier: new_account.params.jobs_multiplier,
      contract: contracts.accounts,
      contractAccount: admin.params.account
    })

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
      account_id: 24,
      parent_id: new_account.params.parent_id,
      account_name: 'Name was edited',
      description: new_account.params.description,
      naics_code: new_account.params.naics_code,
      jobs_multiplier: new_account.params.jobs_multiplier,
    })

  });

  it('Delete a budget expenditure of a given project', async () => {
    //Arrange
    const new_account = await AccountFactory.createWithDefaults({ actor: admin.params.account });
    await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

    //Act
    await AccountUtil.deleteaccnt({
      actor: new_account.params.actor,
      project_id: new_account.params.project_id,
      account_id: 24,
      contract: contracts.accounts,
      contractAccount: admin.params.account
    })

    // Assert
    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });
    // console.table(accountsTable.rows[accountsTable.rows.length - 1]);

    //account id = 23 'cause new_account was 24. 
    expect(accountsTable.rows[accountsTable.rows.length - 1]).to.include({
      account_id: 23,
    })

  });


  it('Automatically creates a budget when the new account has an initial budget.', async () => {
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
    //console.log(accountsTable.rows[accountsTable.rows.length - 1]);

    const budgetsTable = await rpc.get_table_rows({
      code: budgets,
      scope: 0,
      table: "budgets",
      json: true,
      limit: 100
    });
    //console.log("\n\n budgets table : ", budgetsTable.rows);

    expect(budgetsTable.rows[budgetsTable.rows.length - 1]).to.include({
      budget_id: 24,
      account_id: 24,
      amount: "100.00 USD",
      budget_creation_date: budgetsTable.rows[budgetsTable.rows.length - 1].budget_creation_date,
      budget_update_date: budgetsTable.rows[budgetsTable.rows.length - 1].budget_update_date,
      budget_period_id: 1,
      budget_type_id: 1,
    });

    expect(budgetsTable.rows[1]).to.include({
      budget_id: 2,
      account_id: 1,
      amount: "100.00 USD",
      budget_creation_date: budgetsTable.rows[1].budget_creation_date,
      budget_update_date: budgetsTable.rows[1].budget_update_date,
      budget_period_id: 1,
      budget_type_id: 1,
    });

  });




  it("Edit the budget amount for a budget expenditure, should update the parent amount", async () => {
    // Arrange
    let modified_amount = "5000.00 USD";

    const new_account = await AccountFactory.createWithDefaults({ 
      actor: admin.params.account, 
      project_id: 0,
      account_name: "Hardcost test1 budget expenditure",
      parent_id: 1,
      description: "Hardcost test1 description",
      account_category: "2",
      budget_amount: "2000.00 USD",
      naics_code: "0",
      jobs_multiplier: "0", 
    });

    const new_account2 = await AccountFactory.createWithDefaults({ 
      actor: admin.params.account, 
      project_id: 0,
      account_name: "Hardcost test2 budget expenditure",
      parent_id: 1,
      description: "Hardcost test2 description",
      account_category: "2",
      budget_amount: "500.00 USD",
      naics_code: "0",
      jobs_multiplier: "0", 
    });

    await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    await contracts.accounts.addaccount(...new_account2.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    
    //Act
    await AccountUtil.editaccount({
      actor: new_account.params.actor,
      project_id: new_account.params.project_id,
      account_id: 24,
      account_name: new_account.params.account_name,
      description: new_account.params.description,
      account_category: new_account.params.account_category,
      budget_amount: modified_amount,
      naics_code: "0",
      jobs_multiplier: "0", 
      contract: contracts.accounts,
      contractAccount: admin.params.account
    })

    // Assert
    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });
    //console.log(accountsTable.rows, "\n\n");


    const budgetsTable = await rpc.get_table_rows({
      code: budgets,
      scope: 0,
      table: "budgets",
      json: true,
      limit: 100
    });
    //console.log("\n\n budgets table : ", budgetsTable.rows);

    budgetsTable.rows.forEach((budget) => {
      
      //paren account (hard cost)
      if (budget.account_id == 1) {
        expect(budget.amount).to.equal("5500.00 USD");
      }

      //child account new_account (hard cost)
      if (budget.account_id == 24) {
        expect(budget.amount).to.equal("5000.00 USD");
      }

      //child account new_account2 (hard cost)
      if (budget.account_id == 25) {
        expect(budget.amount).to.equal("500.00 USD");
      }
    })

  });


  it("Deleting a hard cost budget expenditure, also deletes the associated budget", async () => {
    // Arrange
    const new_account = await AccountFactory.createWithDefaults({ 
      actor: admin.params.account, 
      project_id: 0,
      account_name: "Hardcost test1 budget expenditure",
      parent_id: 1,
      //account_currency: "2,USD",
      description: "Hardcost test1 description",
      account_category: "2",
      budget_amount: "2000.00 USD",
      naics_code: "0",
      jobs_multiplier: "0", 
    });

    await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });


    //Act
    await AccountUtil.deleteaccnt({
      actor: new_account.params.actor,
      project_id: new_account.params.project_id,
      account_id: 24,
      contract: contracts.accounts,
      contractAccount: admin.params.account
    })
          

    // Assert
    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });
    //console.log(accountsTable.rows, "\n\n");

    accountsTable.rows.forEach((account) => {
      //console.log(budget)
      if (account.account_id == 24) {
        expect.fail('Account 24 should not exist');
      }
    })

    const budgetsTable = await rpc.get_table_rows({
      code: budgets,
      scope: 0,
      table: "budgets",
      json: true,
      limit: 100
    });
    //console.log("\n\n budgets table : ", budgetsTable.rows);

    budgetsTable.rows.forEach((budget) => {
      //console.log(budget)
      if (budget.account_id == 1) {
        expect(budget.amount).to.equal("0.00 USD");
      }

      if (budget.account_id == 24) {
        expect.fail('Account 24 should not exist');
      }

    })


  });

  it("No one can edit Hard cost (parent account)", async () => {
    // Arrange
    const new_account = await AccountFactory.createWithDefaults({ actor: admin.params.account, budget_amount: "500.00 USD" });
    await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    let new_amount = "2000.00 USD";
    let fail;

    //Act
    try{
      await AccountUtil.editaccount({
        actor: new_account.params.actor,
        project_id: new_account.params.project_id,
        account_id: 1,
        account_name: "Hard Cost test1 budget expenditure",
        description: new_account.params.description,
        account_category: new_account.params.account_category,
        budget_amount: new_amount,
        naics_code: 6665166,
        jobs_multiplier: new_account.params.jobs_multiplier,
        contract: contracts.accounts,
        contractAccount: admin.params.account
      })
      fail = false;
    } catch (err) {
      fail = true;
    }

    // Assert
    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });

    //console.log(accountsTable.rows);
    //console.log(accountsTable.rows[0]);

    const budgetsTable = await rpc.get_table_rows({
      code: budgets,
      scope: 0,
      table: "budgets",
      json: true,
      limit: 100
    });
    //console.log("\n\n budgets table : ", budgetsTable.rows);
    //console.log("\n\n budgets table : ", budgetsTable.rows[budgetsTable.rows.length - 1]);

    budgetsTable.rows.forEach((budget) => {
      //console.log(budget)
      if (budget.account_id == 1) {
        expect(budget.amount).to.equal(new_account.params.budget_amount);
      }
    })

    expect(accountsTable.rows[0]).to.include({
      account_id: 1,
      parent_id: 0,
      account_name: "Hard Cost",
      description: "Hard Cost",
      naics_code: 0,
      jobs_multiplier: 0,
      account_category: 2,
    })

    expect(fail).to.be.true

  });

  it("No one can edit Soft cost (parent account)", async () => {
    // Arrange
    const new_account = await AccountFactory.createWithDefaults({ 
      actor: admin.params.account, 
      budget_amount: "500.00 USD",
      parent_id: 2,
      account_category: 2,
    });

    await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    let new_amount = "2000.00 USD";
    let fail;

    //Act
    try{
      await AccountUtil.editaccount({
        actor: new_account.params.actor,
        project_id: new_account.params.project_id,
        account_id: 2,
        account_name: "Soft Cost test1 budget expenditure",
        description: new_account.params.description,
        account_category: new_account.params.account_category,
        budget_amount: new_amount,
        naics_code: 6665166,
        jobs_multiplier: new_account.params.jobs_multiplier,
        contract: contracts.accounts,
        contractAccount: admin.params.account
      })
      fail = false;
    } catch (err) {
      fail = true;
    }

    // Assert
    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });

    //console.log(accountsTable.rows);
    //console.log(accountsTable.rows[1]);

    const budgetsTable = await rpc.get_table_rows({
      code: budgets,
      scope: 0,
      table: "budgets",
      json: true,
      limit: 100
    });
    //console.log("\n\n budgets table : ", budgetsTable.rows);
    //console.log("\n\n budgets table : ", budgetsTable.rows[budgetsTable.rows.length - 1]);

    budgetsTable.rows.forEach((budget) => {
      //console.log(budget)
      if (budget.account_id == 2) {
        expect(budget.amount).to.equal(new_account.params.budget_amount);
      }
    })

    expect(accountsTable.rows[1]).to.include({
      account_id: 2,
      parent_id: 0,
      account_name: "Soft Cost",
      description: "Soft Cost",
      naics_code: 0,
      jobs_multiplier: 0,
      account_category: 3,
    })

    expect(fail).to.be.true

  });

  it("Send editbudget with zero amount, should not delete the budget", async () => {
    // Arrange
    const new_account = await AccountFactory.createWithDefaults({ actor: admin.params.account, budget_amount: "500.00 USD" });
    await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    let new_amount = "0.00 USD";
    let budget_account_exist;

    //Act
    await AccountUtil.editaccount({
      actor: new_account.params.actor,
      project_id: new_account.params.project_id,
      account_id: 24,
      account_name: new_account.params.account_name,
      description: new_account.params.description,
      account_category: new_account.params.account_category,
      budget_amount: new_amount,
      naics_code: "0",
      jobs_multiplier: "0", 
      contract: contracts.accounts,
      contractAccount: admin.params.account
    })

    // Assert
    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });

    //console.log(accountsTable.rows);
    //console.log(accountsTable.rows[accountsTable.rows.length - 1]);

    const budgetsTable = await rpc.get_table_rows({
      code: budgets,
      scope: 0,
      table: "budgets",
      json: true,
      limit: 100
    });
    //console.log("\n\n budgets table : ", budgetsTable.rows);
    //console.log("\n\n budgets table : ", budgetsTable.rows[budgetsTable.rows.length - 1]);
    
    budgetsTable.rows.forEach((budget) => {
      //console.log(budget.account_id)
      if (budget.account_id === 24) {
        budget_account_exist = true;
        expect(budget.amount).to.equal(new_amount);
      } else {
        budget_account_exist = false;
      }
    })

    expect(budget_account_exist).to.be.true;


  });

  it('Add balance to a budget expenditure of a given project', async () => {
    // Arrange
    const new_account = await AccountFactory.createWithDefaults({ actor: admin.params.account, budget_amount: "100.00 USD" });
    await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

    //Act
    await AccountUtil.addbalance({
      project_id: 0,
      account_id: 24,
      amount: "500.00 USD",
      contract: contracts.accounts,
      contractAccount: accounts
    })

    // Assert
    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });
    // console.log(accountsTable)
    // console.table(accountsTable.rows[accountsTable.rows.length - 1]);

    expect(accountsTable.rows[accountsTable.rows.length - 1]).to.include({
      account_id: 24,
      parent_id: new_account.params.parent_id,
      account_name: new_account.params.account_name,
      description: new_account.params.description,
      naics_code: new_account.params.naics_code,
      jobs_multiplier: new_account.params.jobs_multiplier,
      increase_balance: "500.00 USD"
    })

  });

  it('Sub balance to a budget expenditure of a given project', async () => {
    // Arrange
    const new_account = await AccountFactory.createWithDefaults({ actor: admin.params.account, budget_amount: "100.00 USD" });
    await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    await AccountUtil.addbalance({
      project_id: 0,
      account_id: 24,
      amount: "500.00 USD",
      contract: contracts.accounts,
      contractAccount: accounts
    })

    //Act
    await AccountUtil.subbalance({
      project_id: 0,
      account_id: 24,
      amount: "100.00 USD",
      contract: contracts.accounts,
      contractAccount: accounts
    })

    // Assert
    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });
    // console.log(accountsTable)
    // console.table(accountsTable.rows[accountsTable.rows.length - 1]);

    expect(accountsTable.rows[accountsTable.rows.length - 1]).to.include({
      account_id: 24,
      parent_id: new_account.params.parent_id,
      account_name: new_account.params.account_name,
      description: new_account.params.description,
      naics_code: new_account.params.naics_code,
      jobs_multiplier: new_account.params.jobs_multiplier,
      increase_balance: "500.00 USD",
      decrease_balance: "100.00 USD"
    })
  });

  it('Cancel add balance to a budget expenditure of a given project', async () => {
    // Arrange
    const new_account = await AccountFactory.createWithDefaults({ actor: admin.params.account, budget_amount: "100.00 USD" });
    await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    await AccountUtil.addbalance({
      project_id: 0,
      account_id: 24,
      amount: "500.00 USD",
      contract: contracts.accounts,
      contractAccount: accounts
    })

    //Act
    await AccountUtil.canceladd({
      project_id: 0,
      account_id: 24,
      amount: "70.00 USD",
      contract: contracts.accounts,
      contractAccount: accounts
    })

    // Assert
    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });
    // console.log(accountsTable)
    // console.table(accountsTable.rows[accountsTable.rows.length - 1]);

    expect(accountsTable.rows[accountsTable.rows.length - 1]).to.include({
      account_id: 24,
      parent_id: new_account.params.parent_id,
      account_name: new_account.params.account_name,
      description: new_account.params.description,
      naics_code: new_account.params.naics_code,
      jobs_multiplier: new_account.params.jobs_multiplier,
      increase_balance: "430.00 USD",
      decrease_balance: "0.00 USD"
    })
  });

  it('cancel sub balance to a budget expenditure of a given project', async () => {
    // Arrange
    const new_account = await AccountFactory.createWithDefaults({ actor: admin.params.account, budget_amount: "100.00 USD" });
    await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    await AccountUtil.subbalance({
      project_id: 0,
      account_id: 24,
      amount: "100.00 USD",
      contract: contracts.accounts,
      contractAccount: accounts
    })

    //Act
    await AccountUtil.cancelsub({
      project_id: 0,
      account_id: 24,
      amount: "70.00 USD",
      contract: contracts.accounts,
      contractAccount: accounts
    })

    // Assert
    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });
    // console.log(accountsTable)
    // console.table(accountsTable.rows[accountsTable.rows.length - 1]);

    expect(accountsTable.rows[accountsTable.rows.length - 1]).to.include({
      account_id: 24,
      parent_id: new_account.params.parent_id,
      account_name: new_account.params.account_name,
      description: new_account.params.description,
      naics_code: new_account.params.naics_code,
      jobs_multiplier: new_account.params.jobs_multiplier,
      increase_balance: "0.00 USD",
      decrease_balance: "30.00 USD"
    })
  });

  it('Admin can delete ALL budgets expenditures', async () => {
    // Arrange
    const new_account = await AccountFactory.createWithDefaults({ actor: admin.params.account, budget_amount: "100.00 USD" });
    await contracts.accounts.addaccount(...new_account.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

    //Act
    await AccountUtil.deleteaccnts({
      project_id: 0,
      contract: contracts.accounts,
      contractAccount: accounts
    })

    // Assert
    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: project.params.id,
      table: 'accounts',
      json: true,
      limit: 100
    });
    // console.log(accountsTable)
    // console.table(accountsTable.rows[accountsTable.rows.length - 1]);

    assert.deepStrictEqual(accountsTable.rows, [])
  });

});