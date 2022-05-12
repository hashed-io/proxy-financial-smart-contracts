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
const {
  BudgetFactory,
  BudgetConstants,
  BudgetUtil,
} = require("./util/BudgetUtil");
const { EntityFactory, EntityConstants } = require("./util/EntityUtil");
const {
  AccountFactory,
  AccountConstants,
  AccountUtil,
} = require("./util/AccountUtil");
const {
  ProjectFactory,
  ProjectConstants,
  ProjectUtil,
} = require("./util/ProjectUtil");
const { func } = require("promisify");
const assert = require("assert");
const { Console } = require("console");

const expect = require("chai").expect;

const { accounts, projects, budgets, permissions, transactions } =
  contractNames;

describe("Tests for budgets smart contract", async function () {
  let contracts;

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
      accounts,
      projects,
      budgets,
      permissions,
      transactions,
    ]);
    await contracts.permissions.reset({
      authorization: `${permissions}@active`,
    });
    await contracts.transactions.reset({
      authorization: `${transactions}@active`,
    });
    await contracts.accounts.reset({ authorization: `${accounts}@active` });
    await contracts.budgets.reset({ authorization: `${budgets}@active` });
    await contracts.projects.reset({ authorization: `${projects}@active` });
    await updatePermissions();
    console.log("\n");
  });

  afterEach(async function () {
    await EnvironmentUtil.killNode();
  });
/*
  it("Developer creates a new budget", async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.developer,
    });
    const developerParams = developerEntity.getActionParams();

    const investorEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.investor,
    });
    const investorParams = investorEntity.getActionParams();

    const fundEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.fund,
    });
    const fundParams = fundEntity.getActionParams();

    await contracts.projects.addentity(...developerParams, {
      authorization: `${developerParams[0]}@active`,
    });
    await contracts.projects.addtestuser(
      developerParams[0],
      developerParams[1],
      1,
      { authorization: `${developerParams[0]}@active` }
    );
    await contracts.projects.addentity(...investorParams, {
      authorization: `${investorParams[0]}@active`,
    });
    await contracts.projects.addtestuser(
      investorParams[0],
      investorParams[1],
      2,
      { authorization: `${investorParams[0]}@active` }
    );
    await contracts.projects.addentity(...fundParams, {
      authorization: `${fundParams[0]}@active`,
    });
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, {
      authorization: `${fundParams[0]}@active`,
    });

    const newProject = await ProjectFactory.createWithDefaults({
      actor: developerParams[0],
    });
    const projectParams = newProject.getActionParams();

    await contracts.projects.addproject(...projectParams, {
      authorization: `${projectParams[0]}@active`,
    });

    await ProjectUtil.approveprjct({
      actor: fundParams[0],
      project_id: 0,
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD",
      contract: contracts.projects,
      account: fundParams[0],
    });

    const newAccount = await AccountFactory.createWithDefaults({
      actor: projectParams[0],
      project_id: 0,
      parent_id: 1,
      account_category: 1,
      budget_amount: "0.00 USD",
    });
    const accountParams = newAccount.getActionParams();

    await AccountUtil.addaccount({
      actor: accountParams[0],
      project_id: 0,
      account_name: accountParams[2],
      parent_id: accountParams[3],
      account_currency: accountParams[4],
      description: accountParams[5],
      account_category: accountParams[6],
      budget_amount: accountParams[7],
      contract: contracts.accounts,
      contractAccount: accountParams[0],
    });

    //Act
    const newBudget = await BudgetFactory.createWithDefaults({
      actor: developerParams[0],
      budget_type_id: 0,
    });

    const budgetParams = newBudget.getActionParams();

    await BudgetUtil.addbudget({
      actor: developerParams[0],
      project_id: 0,
      account_id: 11,
      amount: budgetParams[3],
      budget_type_id: budgetParams[4],
      begin_date: budgetParams[5],
      end_date: budgetParams[6],
      modify_parents: budgetParams[7],
      contract: contracts.budgets,
      contractAccount: developerParams[0],
    });

    //Assert
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
        account_id: 11,
        amount: "10000.00 USD",
        budget_creation_date: budgetsTable.rows[0].budget_creation_date,
        budget_update_date: budgetsTable.rows[0].budget_update_date,
        budget_period_id: 1,
        budget_type_id: 2,
      },
    ]);
  });

  it("Developer can create more budgets", async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.developer,
    });
    const developerParams = developerEntity.getActionParams();

    const investorEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.investor,
    });
    const investorParams = investorEntity.getActionParams();

    const fundEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.fund,
    });
    const fundParams = fundEntity.getActionParams();

    await contracts.projects.addentity(...developerParams, {
      authorization: `${developerParams[0]}@active`,
    });
    await contracts.projects.addtestuser(
      developerParams[0],
      developerParams[1],
      1,
      { authorization: `${developerParams[0]}@active` }
    );
    await contracts.projects.addentity(...investorParams, {
      authorization: `${investorParams[0]}@active`,
    });
    await contracts.projects.addtestuser(
      investorParams[0],
      investorParams[1],
      2,
      { authorization: `${investorParams[0]}@active` }
    );
    await contracts.projects.addentity(...fundParams, {
      authorization: `${fundParams[0]}@active`,
    });
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, {
      authorization: `${fundParams[0]}@active`,
    });

    const newProject = await ProjectFactory.createWithDefaults({
      actor: developerParams[0],
    });
    const projectParams = newProject.getActionParams();

    await contracts.projects.addproject(...projectParams, {
      authorization: `${projectParams[0]}@active`,
    });

    await ProjectUtil.approveprjct({
      actor: fundParams[0],
      project_id: 0,
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD",
      contract: contracts.projects,
      account: fundParams[0],
    });

    const newAccount = await AccountFactory.createWithDefaults({
      actor: projectParams[0],
      project_id: 0,
      parent_id: 1,
      account_category: 1,
      budget_amount: "0.00 USD",
    });
    const accountParams = newAccount.getActionParams();

    await AccountUtil.addaccount({
      actor: accountParams[0],
      project_id: 0,
      account_name: accountParams[2],
      parent_id: accountParams[3],
      account_currency: accountParams[4],
      description: accountParams[5],
      account_category: accountParams[6],
      budget_amount: accountParams[7],
      contract: contracts.accounts,
      contractAccount: accountParams[0],
    });

    //Act
    const newBudget = await BudgetFactory.createWithDefaults({
      actor: developerParams[0],
    });

    const budgetParams = newBudget.getActionParams();

    await BudgetUtil.addbudget({
      actor: developerParams[0],
      project_id: 0,
      account_id: 11,
      amount: budgetParams[3],
      budget_type_id: budgetParams[4],
      begin_date: budgetParams[5],
      end_date: budgetParams[6],
      modify_parents: budgetParams[7],
      contract: contracts.budgets,
      contractAccount: developerParams[0],
    });

    await BudgetUtil.addbudget({
      actor: developerParams[0],
      project_id: 0,
      account_id: 1,
      amount: budgetParams[3],
      budget_type_id: budgetParams[4],
      begin_date: budgetParams[5],
      end_date: budgetParams[6],
      modify_parents: budgetParams[7],
      contract: contracts.budgets,
      contractAccount: developerParams[0],
    });

    //Assert
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
        account_id: 11,
        amount: "10000.00 USD",
        budget_creation_date: budgetsTable.rows[0].budget_creation_date,
        budget_update_date: budgetsTable.rows[0].budget_update_date,
        budget_period_id: 1,
        budget_type_id: 2,
      },
      {
        budget_id: 2,
        account_id: 1,
        amount: "10000.00 USD",
        budget_creation_date: budgetsTable.rows[0].budget_creation_date,
        budget_update_date: budgetsTable.rows[0].budget_update_date,
        budget_period_id: 1,
        budget_type_id: 2,
      },
    ]);
  });

  it("Budget can be edited", async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.developer,
    });
    const developerParams = developerEntity.getActionParams();

    const investorEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.investor,
    });
    const investorParams = investorEntity.getActionParams();

    const fundEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.fund,
    });
    const fundParams = fundEntity.getActionParams();

    await contracts.projects.addentity(...developerParams, {
      authorization: `${developerParams[0]}@active`,
    });
    await contracts.projects.addtestuser(
      developerParams[0],
      developerParams[1],
      1,
      { authorization: `${developerParams[0]}@active` }
    );
    await contracts.projects.addentity(...investorParams, {
      authorization: `${investorParams[0]}@active`,
    });
    await contracts.projects.addtestuser(
      investorParams[0],
      investorParams[1],
      2,
      { authorization: `${investorParams[0]}@active` }
    );
    await contracts.projects.addentity(...fundParams, {
      authorization: `${fundParams[0]}@active`,
    });
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, {
      authorization: `${fundParams[0]}@active`,
    });

    const newProject = await ProjectFactory.createWithDefaults({
      actor: developerParams[0],
    });
    const projectParams = newProject.getActionParams();

    await contracts.projects.addproject(...projectParams, {
      authorization: `${projectParams[0]}@active`,
    });

    await ProjectUtil.approveprjct({
      actor: fundParams[0],
      project_id: 0,
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD",
      contract: contracts.projects,
      account: fundParams[0],
    });

    const newAccount = await AccountFactory.createWithDefaults({
      actor: projectParams[0],
      project_id: 0,
      parent_id: 1,
      account_category: 1,
      budget_amount: "0.00 USD",
    });
    const accountParams = newAccount.getActionParams();

    await AccountUtil.addaccount({
      actor: accountParams[0],
      project_id: 0,
      account_name: accountParams[2],
      parent_id: accountParams[3],
      account_currency: accountParams[4],
      description: accountParams[5],
      account_category: accountParams[6],
      budget_amount: accountParams[7],
      contract: contracts.accounts,
      contractAccount: accountParams[0],
    });

    const newBudget = await BudgetFactory.createWithDefaults({
      actor: developerParams[0],
      budget_type_id: 0,
    });
    const budgetParams = newBudget.getActionParams();

    await BudgetUtil.addbudget({
      actor: developerParams[0],
      project_id: 0,
      account_id: 11,
      amount: budgetParams[3],
      budget_type_id: budgetParams[4],
      begin_date: budgetParams[5],
      end_date: budgetParams[6],
      modify_parents: budgetParams[7],
      contract: contracts.budgets,
      contractAccount: developerParams[0],
    });

    //Act
    await BudgetUtil.editbudget({
      actor: developerParams[0],
      project_id: 0,
      budget_id: 1,
      amount: "50000.00 USD",
      budget_type_id: budgetParams[4],
      begin_date: budgetParams[5],
      end_date: budgetParams[6],
      modify_parents: budgetParams[7],
      contract: contracts.budgets,
      contractAccount: developerParams[0],
    });

    //Assert
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
        account_id: 11,
        amount: "50000.00 USD",
        budget_creation_date: budgetsTable.rows[0].budget_creation_date,
        budget_update_date: budgetsTable.rows[0].budget_update_date,
        budget_period_id: 1,
        budget_type_id: 2,
      },
    ]);
  });

  it("Budget can be deleted", async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.developer,
    });
    const developerParams = developerEntity.getActionParams();

    const investorEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.investor,
    });
    const investorParams = investorEntity.getActionParams();

    const fundEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.fund,
    });
    const fundParams = fundEntity.getActionParams();

    await contracts.projects.addentity(...developerParams, {
      authorization: `${developerParams[0]}@active`,
    });
    await contracts.projects.addtestuser(
      developerParams[0],
      developerParams[1],
      1,
      { authorization: `${developerParams[0]}@active` }
    );
    await contracts.projects.addentity(...investorParams, {
      authorization: `${investorParams[0]}@active`,
    });
    await contracts.projects.addtestuser(
      investorParams[0],
      investorParams[1],
      2,
      { authorization: `${investorParams[0]}@active` }
    );
    await contracts.projects.addentity(...fundParams, {
      authorization: `${fundParams[0]}@active`,
    });
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, {
      authorization: `${fundParams[0]}@active`,
    });

    const newProject = await ProjectFactory.createWithDefaults({
      actor: developerParams[0],
    });
    const projectParams = newProject.getActionParams();

    await contracts.projects.addproject(...projectParams, {
      authorization: `${projectParams[0]}@active`,
    });

    await ProjectUtil.approveprjct({
      actor: fundParams[0],
      project_id: 0,
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD",
      contract: contracts.projects,
      account: fundParams[0],
    });

    const newAccount = await AccountFactory.createWithDefaults({
      actor: projectParams[0],
      project_id: 0,
      parent_id: 1,
      account_category: 1,
      budget_amount: "0.00 USD",
    });
    const accountParams = newAccount.getActionParams();

    await AccountUtil.addaccount({
      actor: accountParams[0],
      project_id: 0,
      account_name: accountParams[2],
      parent_id: accountParams[3],
      account_currency: accountParams[4],
      description: accountParams[5],
      account_category: accountParams[6],
      budget_amount: accountParams[7],
      contract: contracts.accounts,
      contractAccount: accountParams[0],
    });

    const newBudget = await BudgetFactory.createWithDefaults({
      actor: developerParams[0],
      budget_type_id: 0,
    });
    const budgetParams = newBudget.getActionParams();

    await BudgetUtil.addbudget({
      actor: developerParams[0],
      project_id: 0,
      account_id: 11,
      amount: budgetParams[3],
      budget_type_id: budgetParams[4],
      begin_date: budgetParams[5],
      end_date: budgetParams[6],
      modify_parents: budgetParams[7],
      contract: contracts.budgets,
      contractAccount: developerParams[0],
    });

    //Act
    await BudgetUtil.deletebudget({
      actor: developerParams[0],
      project_id: 0,
      budget_id: 1,
      modify_parents: budgetParams[7],
      contract: contracts.budgets,
      contractAccount: developerParams[0],
    });

    //Assert
    const budgetsTable = await rpc.get_table_rows({
      code: budgets,
      scope: 0,
      table: "budgets",
      json: true,
    });
    console.log("\n\n budgets table : ", budgetsTable.rows);

    assert.deepStrictEqual(budgetsTable.rows, []);
  });

  it("Admin can remove ALL budgets from selected account_id", async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.developer,
    });
    const developerParams = developerEntity.getActionParams();

    const investorEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.investor,
    });
    const investorParams = investorEntity.getActionParams();

    const fundEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.fund,
    });
    const fundParams = fundEntity.getActionParams();

    await contracts.projects.addentity(...developerParams, {
      authorization: `${developerParams[0]}@active`,
    });
    await contracts.projects.addtestuser(
      developerParams[0],
      developerParams[1],
      1,
      { authorization: `${developerParams[0]}@active` }
    );
    await contracts.projects.addentity(...investorParams, {
      authorization: `${investorParams[0]}@active`,
    });
    await contracts.projects.addtestuser(
      investorParams[0],
      investorParams[1],
      2,
      { authorization: `${investorParams[0]}@active` }
    );
    await contracts.projects.addentity(...fundParams, {
      authorization: `${fundParams[0]}@active`,
    });
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, {
      authorization: `${fundParams[0]}@active`,
    });

    const newProject = await ProjectFactory.createWithDefaults({
      actor: developerParams[0],
    });
    const projectParams = newProject.getActionParams();

    await contracts.projects.addproject(...projectParams, {
      authorization: `${projectParams[0]}@active`,
    });

    await ProjectUtil.approveprjct({
      actor: fundParams[0],
      project_id: 0,
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD",
      contract: contracts.projects,
      account: fundParams[0],
    });

    const newAccount = await AccountFactory.createWithDefaults({
      actor: projectParams[0],
      project_id: 0,
      parent_id: 1,
      account_category: 1,
      budget_amount: "10.00 USD",
    });
    const accountParams = newAccount.getActionParams();

    await AccountUtil.addaccount({
      actor: accountParams[0],
      project_id: 0,
      account_name: accountParams[2],
      parent_id: accountParams[3],
      account_currency: accountParams[4],
      description: accountParams[5],
      account_category: accountParams[6],
      budget_amount: accountParams[7],
      contract: contracts.accounts,
      contractAccount: accountParams[0],
    });

    const newBudget = await BudgetFactory.createWithDefaults({
      actor: developerParams[0],
      budget_type_id: 0,
    });
    const budgetParams = newBudget.getActionParams();

    await BudgetUtil.addbudget({
      actor: developerParams[0],
      project_id: 0,
      account_id: 11,
      amount: budgetParams[3],
      budget_type_id: budgetParams[4],
      begin_date: budgetParams[5],
      end_date: budgetParams[6],
      modify_parents: budgetParams[7],
      contract: contracts.budgets,
      contractAccount: developerParams[0],
    });

    //Act
    const budgetsTable = await rpc.get_table_rows({
      code: budgets,
      scope: 0,
      table: "budgets",
      json: true,
    });
    console.log("\n\n before delete budgets table : ", budgetsTable.rows);

    await BudgetUtil.delbdgtsacct({
      project_id: 0,
      account_id: 11,
      contract: contracts.budgets,
      contractAccount: budgets,
    });

    //Assert
    const budgetsTable2 = await rpc.get_table_rows({
      code: budgets,
      scope: 0,
      table: "budgets",
      json: true,
    });
    console.log("\n\n After delete budgets table : ", budgetsTable2.rows);

    assert.deepStrictEqual(budgetsTable2.rows, [
      {
        budget_id: 2,
        account_id: 1,
        amount: "10.00 USD",
        budget_creation_date: budgetsTable2.rows[0].budget_creation_date,
        budget_update_date: budgetsTable2.rows[0].budget_update_date,
        budget_period_id: 1,
        budget_type_id: 1,
      },
    ]);
  });

  it("Recalculate budgets for certain budget period", async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.developer,
    });
    const developerParams = developerEntity.getActionParams();

    const investorEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.investor,
    });
    const investorParams = investorEntity.getActionParams();

    const fundEntity = await EntityFactory.createWithDefaults({
      type: EntityConstants.fund,
    });
    const fundParams = fundEntity.getActionParams();

    await contracts.projects.addentity(...developerParams, {
      authorization: `${developerParams[0]}@active`,
    });
    await contracts.projects.addtestuser(
      developerParams[0],
      developerParams[1],
      1,
      { authorization: `${developerParams[0]}@active` }
    );
    await contracts.projects.addentity(...investorParams, {
      authorization: `${investorParams[0]}@active`,
    });
    await contracts.projects.addtestuser(
      investorParams[0],
      investorParams[1],
      2,
      { authorization: `${investorParams[0]}@active` }
    );
    await contracts.projects.addentity(...fundParams, {
      authorization: `${fundParams[0]}@active`,
    });
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, {
      authorization: `${fundParams[0]}@active`,
    });

    const newProject = await ProjectFactory.createWithDefaults({
      actor: developerParams[0],
    });
    const projectParams = newProject.getActionParams();

    await contracts.projects.addproject(...projectParams, {
      authorization: `${projectParams[0]}@active`,
    });

    await ProjectUtil.approveprjct({
      actor: fundParams[0],
      project_id: 0,
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD",
      contract: contracts.projects,
      account: fundParams[0],
    });

    const newAccount = await AccountFactory.createWithDefaults({
      actor: projectParams[0],
      project_id: 0,
      parent_id: 1,
      account_category: 1,
      budget_amount: "10.00 USD",
    });
    const accountParams = newAccount.getActionParams();

    await AccountUtil.addaccount({
      actor: accountParams[0],
      project_id: 0,
      account_name: accountParams[2],
      parent_id: accountParams[3],
      account_currency: accountParams[4],
      description: accountParams[5],
      account_category: accountParams[6],
      budget_amount: accountParams[7],
      contract: contracts.accounts,
      contractAccount: accountParams[0],
    });

    const newBudget = await BudgetFactory.createWithDefaults({
      actor: developerParams[0],
      budget_type_id: 0,
    });
    const budgetParams = newBudget.getActionParams();

    await BudgetUtil.addbudget({
      actor: developerParams[0],
      project_id: 0,
      account_id: 11,
      amount: budgetParams[3],
      budget_type_id: budgetParams[4],
      begin_date: budgetParams[5],
      end_date: budgetParams[6],
      modify_parents: budgetParams[7],
      contract: contracts.budgets,
      contractAccount: developerParams[0],
    });

    //Act
    await BudgetUtil.rcalcbudgets({
      actor: developerParams[0],
      project_id: 0,
      account_id: 11,
      budget_period_id: 1,
      contract: contracts.budgets,
      contractAccount: developerParams[0],
    });

    //Assert
    const budgetsTable = await rpc.get_table_rows({
      code: budgets,
      scope: 0,
      table: "budgets",
      json: true,
    });
    console.log("\n\n budgets table : ", budgetsTable.rows);

    const budgetsTable2 = await rpc.get_table_rows({
      code: budgets,
      scope: 0,
      table: "budgetpriods",
      json: true,
    });
    console.log("\n\n budgetpriods table : ", budgetsTable2.rows);
  });
  */
});
