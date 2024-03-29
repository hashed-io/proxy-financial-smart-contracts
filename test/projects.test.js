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

const expect = require("chai").expect;

const { projects, accounts, budgets, permissions, transactions } =
  contractNames;

describe("Tests for projects smart contract", async function () {
  let contracts, admin, builder, investor, issuer, regional;
  let fail;

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
    issuer = await UserFactory.createWithDefaults({
      role: Roles.issuer,
      account: "issueruser11",
      user_name: "Issuer",
      entity_id: 4,
    });
    regional = await UserFactory.createWithDefaults({
      role: Roles.regional_center,
      account: "regionalcntr",
      user_name: "Regional Center",
      entity_id: 5,
    });

    await EnvironmentUtil.createAccount("proxyadmin11");
    await EnvironmentUtil.createAccount("investoruser");
    await EnvironmentUtil.createAccount("builderuser1");
    await EnvironmentUtil.createAccount("issueruser11");
    await EnvironmentUtil.createAccount("regionalcntr");
  });

  afterEach(async function () {
    await EnvironmentUtil.killNode();
  });

  it("Creates a project", async function () {
    //Arrange
    const user = await UserFactory.createWithDefaults({ role: Roles.fund });
    await contracts.projects.adduser(projects, ...user.getCreateParams(), {
      authorization: `${projects}@active`,
    });

    const project = await ProjectFactory.createWithDefaults({
      actor: user.params.account,
    });
    // console.log(project);

    Object.assign(project.params, {
      builder: "",
      investors: [],
      issuer: "",
      regional_center: "",
    });

    //Act
    await contracts.projects.addproject(...project.getCreateActionParams(), {
      authorization: `${user.params.account}@active`,
    });

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });

    // console.log("\n\n Projects  table : ", projectsTable.rows);

    assert.deepStrictEqual(projectsTable.rows, [
      {
        project_id: projectsTable.rows[0].project_id,
        developer_id: 0,
        owner: project.params.actor,
        builder: project.params.builder,
        investors: project.params.investors,
        issuer: project.params.issuer,
        regional_center: project.params.regional_center,
        project_name: project.params.project_name,
        description: project.params.description,
        image: project.params.image,
        projected_starting_date: projectsTable.rows[0].projected_starting_date,
        projected_completion_date: projectsTable.rows[0].projected_completion_date,
        created_date: projectsTable.rows[0].created_date,
        updated_date: projectsTable.rows[0].updated_date,
        close_date: projectsTable.rows[0].close_date,
        status: ProjectConstants.status.ready,
        approved_date: projectsTable.rows[0].approved_date,
        approved_by: projectsTable.rows[0].approved_by,
      },
    ])

  });

  it("Assign builder to a project", async () => {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({
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

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [],
      issuer: "",
      regional_center: "",
    });

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });

    // console.log("\n\n Projects table : ", projectsTable);

    assert.deepStrictEqual(projectsTable.rows, [
      {
        project_id: projectsTable.rows[0].project_id,
        developer_id: 0,
        owner: project.params.actor,
        builder: builder.params.account,
        investors: project.params.investors,
        issuer: project.params.issuer,
        regional_center: project.params.regional_center,
        project_name: project.params.project_name,
        description: project.params.description,
        image: project.params.image,
        projected_starting_date: projectsTable.rows[0].projected_starting_date,
        projected_completion_date: projectsTable.rows[0].projected_completion_date,
        created_date: projectsTable.rows[0].created_date,
        updated_date: projectsTable.rows[0].updated_date,
        close_date: projectsTable.rows[0].close_date,
        status: ProjectConstants.status.ready,
        approved_date: projectsTable.rows[0].approved_date,
        approved_by: projectsTable.rows[0].approved_by,
      },
    ])

  });


  it("Assign one of each type (Investor, Builder, Regional Center, Issuer)", async () => {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({
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

    await contracts.projects.assignuser(
      admin.params.account,
      issuer.params.account,
      0,
      { authorization: `${admin.params.account}@active` }
    );

    await contracts.projects.assignuser(
      admin.params.account,
      regional.params.account,
      0,
      { authorization: `${admin.params.account}@active` }
    );

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: issuer.params.account,
      regional_center: regional.params.account,
    });

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });

    //console.log("\n\n Projects table : ", projectsTable);

    assert.deepStrictEqual(projectsTable.rows, [
      {
        project_id: projectsTable.rows[0].project_id,
        developer_id: 0,
        owner: project.params.actor,
        builder: project.params.builder,
        investors: project.params.investors,
        issuer: project.params.issuer,
        regional_center: project.params.regional_center,
        project_name: project.params.project_name,
        description: project.params.description,
        image: project.params.image,
        projected_starting_date: projectsTable.rows[0].projected_starting_date,
        projected_completion_date: projectsTable.rows[0].projected_completion_date,
        created_date: projectsTable.rows[0].created_date,
        updated_date: projectsTable.rows[0].updated_date,
        close_date: projectsTable.rows[0].close_date,
        status: ProjectConstants.status.ready,
        approved_date: projectsTable.rows[0].approved_date,
        approved_by: projectsTable.rows[0].approved_by,
      },
    ])

  });

  it("Edit project", async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({
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
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: "",
      regional_center: "",
    });

    // Act
    Object.assign(project.params, {
      description: "Desctiption edited",
    });

    await contracts.projects.editproject(
      admin.params.account,
      0,
      ...project.getEditActionParams(),
      { authorization: `${admin.params.account}@active` }
    );

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    // console.log("\n\n Projects table : ", projectsTable.rows);

   assert.deepStrictEqual(projectsTable.rows, [
    {
      project_id: projectsTable.rows[0].project_id,
      developer_id: 0,
      owner: project.params.actor,
      builder: project.params.builder,
      investors: project.params.investors,
      issuer: project.params.issuer,
      regional_center: project.params.regional_center,
      project_name: project.params.project_name,
      description: project.params.description,
      image: project.params.image,
      projected_starting_date: projectsTable.rows[0].projected_starting_date,
      projected_completion_date: projectsTable.rows[0].projected_completion_date,
      created_date: projectsTable.rows[0].created_date,
      updated_date: projectsTable.rows[0].updated_date,
      close_date: projectsTable.rows[0].close_date,
      status: ProjectConstants.status.ready,
      approved_date: projectsTable.rows[0].approved_date,
      approved_by: projectsTable.rows[0].approved_by,
    },
  ])

  });

  it("Cannot delete a project when has been approved", async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({
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
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: "",
      regional_center: "",
    });

    // deleted approve part

    // Act
    try {
      await contracts.projects.deleteprojct(admin.params.account, 0, {
        authorization: `${admin.params.account}@active`,
      });
      fail = false;
    } catch (err) {
      fail = true;
      // console.log(err);
    }

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    //console.log("\n\n Projects table : ", projectsTable.rows);

    expect(fail).to.be.true;
  });

  it("Change project status", async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({
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
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: "",
      regional_center: "",
    });

    // deleted approve part

    //Act
    await contracts.projects.changestatus(
      0,
      ProjectConstants.status.investment,
      { authorization: `${projects}@active` }
    );

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    //console.log("\n\n Projects table : ", projectsTable.rows);

    assert.deepStrictEqual(projectsTable.rows, [
      {
        project_id: projectsTable.rows[0].project_id,
        developer_id: 0,
        owner: project.params.actor,
        builder: project.params.builder,
        investors: project.params.investors,
        issuer: project.params.issuer,
        regional_center: project.params.regional_center,
        project_name: project.params.project_name,
        description: project.params.description,
        image: project.params.image,
        projected_starting_date: projectsTable.rows[0].projected_starting_date,
        projected_completion_date: projectsTable.rows[0].projected_completion_date,
        created_date: projectsTable.rows[0].created_date,
        updated_date: projectsTable.rows[0].updated_date,
        close_date: projectsTable.rows[0].close_date,
        status: ProjectConstants.status.investment,
        approved_date: projectsTable.rows[0].approved_date,
        approved_by: projectsTable.rows[0].approved_by,
      },
    ])

  });

  it("Create an investment", async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({
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
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: "",
      regional_center: "",
    });

    // deleted approve part

    //Act
    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: "subscription package",
      contract: contracts.projects,
      account: investor.params.account,
    });

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    //console.log("\n\n Projects table : ", projectsTable.rows);

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "investments",
      json: true,
    });
    //console.log("\n\n investments table is: ", investTable);

    assert.deepStrictEqual(investTable.rows, [
      {
        investment_id: 0,
        user: investor.params.account,
        project_id: 0,
        total_investment_amount: "5000000.00 USD",
        quantity_units_purchased: 20,
        annual_preferred_return: 500,
        signed_agreement_date: 1666675375,
        total_confirmed_transferred_amount: "0.00 USD",
        total_unconfirmed_transferred_amount: "0.00 USD",
        total_confirmed_transfers: 0,
        total_unconfirmed_transfers: 0,
        subscription_package: "subscription package",
        status: ProjectConstants.investment.pending,
        approved_by: "",
        approved_date: 0,
        investment_date: investTable.rows[0].investment_date,
      },
    ]);
  });

  it("Modify an investment", async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({
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
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: "",
      regional_center: "",
    });

    // deleted approve part

    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: "subscription package",
      contract: contracts.projects,
      account: investor.params.account,
    });

    //Act
    await ProjectUtil.editinvest({
      actor: investor.params.account,
      investment_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: "subscription package modified",
      contract: contracts.projects,
      account: investor.params.account,
    });

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    // console.log("\n\n Projects table : ", projectsTable.rows);

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "investments",
      json: true,
    });
    //console.log("\n\n investments table is: ", investTable);

    assert.deepStrictEqual(investTable.rows, [
      {
        investment_id: 0,
        user: investor.params.account,
        project_id: 0,
        total_investment_amount: "5000000.00 USD",
        quantity_units_purchased: 20,
        annual_preferred_return: 500,
        signed_agreement_date: 1666675375,
        total_confirmed_transferred_amount: "0.00 USD",
        total_unconfirmed_transferred_amount: "0.00 USD",
        total_confirmed_transfers: 0,
        total_unconfirmed_transfers: 0,
        subscription_package: "subscription package modified",
        status: ProjectConstants.investment.pending,
        approved_by: "",
        approved_date: 0,
        investment_date: investTable.rows[0].investment_date,
      },
    ]);
  });

  it("Delete an investment", async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({
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
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: "",
      regional_center: "",
    });

    // deleted approve part

    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: "subscription package",
      contract: contracts.projects,
      account: investor.params.account,
    });

    //Act
    await contracts.projects.deleteinvest(investor.params.account, 0, {
      authorization: `${investor.params.account}@active`,
    });

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    //console.log("\n\n Projects table : ", projectsTable.rows);

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "investments",
      json: true,
    });
    //console.log("\n\n investments table is: ", investTable);

    assert.deepStrictEqual(investTable.rows, []);
  });

  it("Approve an investment", async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({
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
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: "",
      regional_center: "",
    });

    // deleted approve part

    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: "subscription package",
      contract: contracts.projects,
      account: investor.params.account,
    });

    //Act
    await contracts.projects.approveinvst(admin.params.account, 0, {
      authorization: `${admin.params.account}@active`,
    });

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    //console.log("\n\n Projects table : ", projectsTable.rows);

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "investments",
      json: true,
    });
    //console.log("\n\n investments table is: ", investTable);

    assert.deepStrictEqual(investTable.rows, [
      {
        investment_id: 0,
        user: investor.params.account,
        project_id: 0,
        total_investment_amount: "5000000.00 USD",
        quantity_units_purchased: 20,
        annual_preferred_return: 500,
        signed_agreement_date: 1666675375,
        total_confirmed_transferred_amount: "0.00 USD",
        total_unconfirmed_transferred_amount: "0.00 USD",
        total_confirmed_transfers: 0,
        total_unconfirmed_transfers: 0,
        subscription_package: "subscription package",
        status: ProjectConstants.investment.funding,
        approved_by: investTable.rows[0].approved_by,
        approved_date: investTable.rows[0].approved_date,
        investment_date: investTable.rows[0].investment_date,
      },
    ]);
  });

  it("Make a transfer", async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({
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
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: "",
      regional_center: "",
    });

    // deleted approve part

    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: "subscription package",
      contract: contracts.projects,
      account: investor.params.account,
    });

    await contracts.projects.approveinvst(admin.params.account, 0, {
      authorization: `${admin.params.account}@active`,
    });

    //Act
    await ProjectUtil.maketransfer({
      actor: investor.params.account,
      amount: "5000.00 USD",
      investment_id: 0,
      proof_of_transfer: "Transfer done",
      transfer_date: Date.now(),
      contract: contracts.projects,
      account: investor.params.account,
    });

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "investments",
      json: true,
    });
    //console.log("\n\n Investments table : ", projectsTable.rows);

    const transferTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "transfers",
      json: true,
    });
    //console.log("\n\n transfer table is: ", transferTable);

    assert.deepStrictEqual(transferTable.rows, [
      {
        fund_transfer_id: 0,
        proof_of_transfer: "Transfer done",
        amount: "5000.00 USD",
        investment_id: 0,
        user: investor.params.account,
        status: 1,
        transfer_date: transferTable.rows[0].transfer_date,
        updated_date: transferTable.rows[0].updated_date,
        confirmed_date: transferTable.rows[0].confirmed_date,
        confirmed_by: "",
      },
    ]);
  });

  it("Edit a transfer", async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({
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
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: "",
      regional_center: "",
    });

    // deleted approve part

    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: "subscription package",
      contract: contracts.projects,
      account: investor.params.account,
    });

    await contracts.projects.approveinvst(admin.params.account, 0, {
      authorization: `${admin.params.account}@active`,
    });

    await ProjectUtil.maketransfer({
      actor: investor.params.account,
      amount: "5000.00 USD",
      investment_id: 0,
      proof_of_transfer: "Transfer done",
      transfer_date: Date.now(),
      contract: contracts.projects,
      account: investor.params.account,
    });

    //Act
    await ProjectUtil.edittransfer({
      actor: investor.params.account,
      transfer_id: 0,
      amount: "5000.00 USD",
      proof_of_transfer: "Transfer edited",
      date: Date.now(),
      contract: contracts.projects,
      account: investor.params.account,
    });

    // Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "investments",
      json: true,
    });
    //console.log("\n\n Investments table : ", projectsTable.rows);

    const transferTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "transfers",
      json: true,
    });
    //console.log("\n\n transfer table is: ", transferTable);

    assert.deepStrictEqual(transferTable.rows, [
      {
        fund_transfer_id: 0,
        proof_of_transfer: "Transfer edited",
        amount: "5000.00 USD",
        investment_id: 0,
        user: investor.params.account,
        status: 1,
        transfer_date: transferTable.rows[0].transfer_date,
        updated_date: transferTable.rows[0].updated_date,
        confirmed_date: transferTable.rows[0].confirmed_date,
        confirmed_by: "",
      },
    ]);
  });

  it("Confirm a transfer", async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({
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
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: "",
      regional_center: "",
    });

    // deleted approve part

    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: "subscription package",
      contract: contracts.projects,
      account: investor.params.account,
    });

    await contracts.projects.approveinvst(admin.params.account, 0, {
      authorization: `${admin.params.account}@active`,
    });

    await ProjectUtil.maketransfer({
      actor: investor.params.account,
      amount: "5000.00 USD",
      investment_id: 0,
      proof_of_transfer: "Transfer done",
      transfer_date: Date.now(),
      contract: contracts.projects,
      account: investor.params.account,
    });

    //Act
    await ProjectUtil.confrmtrnsfr({
      actor: admin.params.account,
      transfer_id: 0,
      proof_of_transfer: "Transfer confirmed",
      contract: contracts.projects,
      account: admin.params.account,
    });

    // Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "investments",
      json: true,
    });
    //console.log("\n\n Investments table : ", projectsTable.rows);

    const transferTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "transfers",
      json: true,
    });
    //console.log("\n\n transfer table is: ", transferTable);

    assert.deepStrictEqual(transferTable.rows, [
      {
        fund_transfer_id: 0,
        proof_of_transfer: "Transfer confirmed",
        amount: "5000.00 USD",
        investment_id: 0,
        user: investor.params.account,
        status: ProjectConstants.transfer.confirmed,
        transfer_date: transferTable.rows[0].transfer_date,
        updated_date: transferTable.rows[0].updated_date,
        confirmed_date: transferTable.rows[0].confirmed_date,
        confirmed_by: admin.params.account,
      },
    ]);
  });

  it("Delete a transfer", async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({
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
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: "",
      regional_center: "",
    });

    // deleted approve part

    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: "subscription package",
      contract: contracts.projects,
      account: investor.params.account,
    });

    await contracts.projects.approveinvst(admin.params.account, 0, {
      authorization: `${admin.params.account}@active`,
    });

    await ProjectUtil.maketransfer({
      actor: investor.params.account,
      amount: "5000.00 USD",
      investment_id: 0,
      proof_of_transfer: "Transfer done",
      transfer_date: Date.now(),
      contract: contracts.projects,
      account: investor.params.account,
    });

    //Act
    await contracts.projects.deletetrnsfr(investor.params.account, 0, {
      authorization: `${investor.params.account}@active`,
    });

    // Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "investments",
      json: true,
    });
    //console.log("\n\n Investments table : ", projectsTable.rows);

    const transferTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "transfers",
      json: true,
    });
    //console.log("\n\n transfer table is: ", transferTable);

    assert.deepStrictEqual(transferTable.rows, []);
  });

  it("cannot send action initdrawdown twice per project", async () => {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({
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
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: "",
      regional_center: "",
    });

    // deleted approve part

    // Act
    try {
      await contracts.transactions.initdrawdown(0, {
        authorization: `${transactions}@active`,
      });
      fail = false;
    } catch (err) {
      fail = true;
    }

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    //console.log("\n\n Projects table : ", projectsTable.rows);

    const drawdownTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: "drawdowns",
      json: true,
    });

    //console.log("drawdown table is: ", drawdownTable.rows);

    expect(fail).to.be.true;

    assert.deepStrictEqual(projectsTable.rows, [
      {
        project_id: projectsTable.rows[0].project_id,
        developer_id: 0,
        owner: project.params.actor,
        builder: project.params.builder,
        investors: project.params.investors,
        issuer: project.params.issuer,
        regional_center: project.params.regional_center,
        project_name: project.params.project_name,
        description: project.params.description,
        image: project.params.image,
        projected_starting_date: projectsTable.rows[0].projected_starting_date,
        projected_completion_date: projectsTable.rows[0].projected_completion_date,
        created_date: projectsTable.rows[0].created_date,
        updated_date: projectsTable.rows[0].updated_date,
        close_date: projectsTable.rows[0].close_date,
        status: ProjectConstants.status.ready,
        approved_date: projectsTable.rows[0].approved_date,
        approved_by: projectsTable.rows[0].approved_by,
      },
    ])

  });

  it("There can only be one builder per project", async () => {
    //Arrange
    let failBuilder;

    await contracts.projects.adduser(
      projects,
      "builderuser3",
      "Builder3",
      Roles.developer,
      {
        authorization: `${projects}@active`,
      }
    );

    const project = await ProjectFactory.createWithDefaults({
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

    // Act
    try {
      await contracts.projects.assignuser(
        admin.params.account,
        'builderuser3',
        0,
        { authorization: `${admin.params.account}@active` }
      );
      failBuilder = false;
    } catch (err) {
      failBuilder = true;
      //console.log(err)
    }

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    //console.log("\n\n Projects table : ", projectsTable.rows);

    expect(failBuilder).to.be.true

    assert.deepStrictEqual(projectsTable.rows, [
      {
        project_id: projectsTable.rows[0].project_id,
        developer_id: 0,
        owner: project.params.actor,
        builder: builder.params.account,
        investors: [],
        issuer: '',
        regional_center: '',
        project_name: project.params.project_name,
        description: project.params.description,
        image: project.params.image,
        projected_starting_date: projectsTable.rows[0].projected_starting_date,
        projected_completion_date: projectsTable.rows[0].projected_completion_date,
        created_date: projectsTable.rows[0].created_date,
        updated_date: projectsTable.rows[0].updated_date,
        close_date: projectsTable.rows[0].close_date,
        status: ProjectConstants.status.ready,
        approved_date: projectsTable.rows[0].approved_date,
        approved_by: projectsTable.rows[0].approved_by,
      },
    ])
  });

  it("There can only be one issuer per project", async () => {
    //Arrange
    let failIssuer;

    await contracts.projects.adduser(
      projects,
      "issueruser2",
      "Issuer2",
      Roles.issuer,
      {
        authorization: `${projects}@active`,
      }
    );

    const project = await ProjectFactory.createWithDefaults({
      actor: admin.params.account,
    });

    await contracts.projects.addproject(...project.getCreateActionParams(), {
      authorization: `${admin.params.account}@active`,
    });

    await contracts.projects.assignuser(
      admin.params.account,
      issuer.params.account,
      0,
      { authorization: `${admin.params.account}@active` }
    );

    // Act
    try {
      await contracts.projects.assignuser(
        admin.params.account,
        'issueruser2',
        0,
        { authorization: `${admin.params.account}@active` }
      );
      failIssuer = false;
    } catch (err) {
      failIssuer = true;
    }

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    //console.log("\n\n Projects table : ", projectsTable.rows);

    expect(failIssuer).to.be.true

    assert.deepStrictEqual(projectsTable.rows, [
      {
        project_id: projectsTable.rows[0].project_id,
        developer_id: 0,
        owner: project.params.actor,
        builder: '',
        investors: [],
        issuer: issuer.params.account,
        regional_center: '',
        project_name: project.params.project_name,
        description: project.params.description,
        image: project.params.image,
        projected_starting_date: projectsTable.rows[0].projected_starting_date,
        projected_completion_date: projectsTable.rows[0].projected_completion_date,
        created_date: projectsTable.rows[0].created_date,
        updated_date: projectsTable.rows[0].updated_date,
        close_date: projectsTable.rows[0].close_date,
        status: ProjectConstants.status.ready,
        approved_date: projectsTable.rows[0].approved_date,
        approved_by: projectsTable.rows[0].approved_by,
      },
    ])
  });

  it("There can only be one regional center per project", async () => {
    //Arrange
    let failRegional;

    await contracts.projects.adduser(
      projects,
      "regionlcntr2",
      "RegionalCenter2",
      Roles.regional_center,
      {
        authorization: `${projects}@active`,
      }
    );

    const project = await ProjectFactory.createWithDefaults({
      actor: admin.params.account,
    });

    await contracts.projects.addproject(...project.getCreateActionParams(), {
      authorization: `${admin.params.account}@active`,
    });

    await contracts.projects.assignuser(
      admin.params.account,
      regional.params.account,
      0,
      { authorization: `${admin.params.account}@active` }
    );

    // Act
    try {
      await contracts.projects.assignuser(
        admin.params.account,
        'regionlcntr2',
        0,
        { authorization: `${admin.params.account}@active` }
      );
      failRegional = false;
    } catch (err) {
      failRegional = true;
    }

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    //console.log("\n\n Projects table : ", projectsTable.rows);

    expect(failRegional).to.be.true

    assert.deepStrictEqual(projectsTable.rows, [
      {
        project_id: projectsTable.rows[0].project_id,
        developer_id: 0,
        owner: project.params.actor,
        builder: '',
        investors: [],
        issuer: '',
        regional_center: regional.params.account,
        project_name: project.params.project_name,
        description: project.params.description,
        image: project.params.image,
        projected_starting_date: projectsTable.rows[0].projected_starting_date,
        projected_completion_date: projectsTable.rows[0].projected_completion_date,
        created_date: projectsTable.rows[0].created_date,
        updated_date: projectsTable.rows[0].updated_date,
        close_date: projectsTable.rows[0].close_date,
        status: ProjectConstants.status.ready,
        approved_date: projectsTable.rows[0].approved_date,
        approved_by: projectsTable.rows[0].approved_by,
      },
    ])
  });

  it("There can be many investors per project", async () => {
    //TODO
  });

  it('Remove builder from project', async () =>{
    //Arrange
    let failBuilder
    const project = await ProjectFactory.createWithDefaults({
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

    // Act
    try {
      await contracts.projects.removeuser(
        admin.params.account,
        'builderuser1',
        0,
        { authorization: `${admin.params.account}@active` }
      );
      failBuilder= false
    } catch (err) {
      failBuilder = true
      // console.log(err)
    }

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    // console.log("\n\n Projects table : ", projectsTable.rows);

    expect(failBuilder).to.be.false

    assert.deepStrictEqual(projectsTable.rows, [
      {
        project_id: projectsTable.rows[0].project_id,
        developer_id: 0,
        owner: project.params.actor,
        builder: '',
        investors: [],
        issuer: '',
        regional_center: '',
        project_name: project.params.project_name,
        description: project.params.description,
        image: project.params.image,
        projected_starting_date: projectsTable.rows[0].projected_starting_date,
        projected_completion_date: projectsTable.rows[0].projected_completion_date,
        created_date: projectsTable.rows[0].created_date,
        updated_date: projectsTable.rows[0].updated_date,
        close_date: projectsTable.rows[0].close_date,
        status: ProjectConstants.status.ready,
        approved_date: projectsTable.rows[0].approved_date,
        approved_by: projectsTable.rows[0].approved_by,
      },
    ])




  });

  it('Remove investor from project', async () =>{
    //Arrange
    let failInvestor
    const project = await ProjectFactory.createWithDefaults({
      actor: admin.params.account,
    });

    await contracts.projects.addproject(...project.getCreateActionParams(), {
      authorization: `${admin.params.account}@active`,
    });

    await contracts.projects.assignuser(
      admin.params.account,
      investor.params.account,
      0,
      { authorization: `${admin.params.account}@active` }
    );

    // Act
    try {
      await contracts.projects.removeuser(
        admin.params.account,
        'investoruser',
        0,
        { authorization: `${admin.params.account}@active` }
      );
      failInvestor = false
    } catch (err) {
      failInvestor = true
    } 


    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    // console.log("\n\n Projects table : ", projectsTable.rows);

    expect(failInvestor).to.be.false

    assert.deepStrictEqual(projectsTable.rows, [
      {
        project_id: projectsTable.rows[0].project_id,
        developer_id: 0,
        owner: project.params.actor,
        builder: '',
        investors: [],
        issuer: '',
        regional_center: '',
        project_name: project.params.project_name,
        description: project.params.description,
        image: project.params.image,
        projected_starting_date: projectsTable.rows[0].projected_starting_date,
        projected_completion_date: projectsTable.rows[0].projected_completion_date,
        created_date: projectsTable.rows[0].created_date,
        updated_date: projectsTable.rows[0].updated_date,
        close_date: projectsTable.rows[0].close_date,
        status: ProjectConstants.status.ready,
        approved_date: projectsTable.rows[0].approved_date,
        approved_by: projectsTable.rows[0].approved_by,
      },
    ])

  });

  it('Remove issuer from project', async () =>{
    //Arrange
    let failIssuer
    const project = await ProjectFactory.createWithDefaults({
      actor: admin.params.account,
    });

    await contracts.projects.addproject(...project.getCreateActionParams(), {
      authorization: `${admin.params.account}@active`,
    });

    await contracts.projects.assignuser(
      admin.params.account,
      issuer.params.account,
      0,
      { authorization: `${admin.params.account}@active` }
    );

    // Act
    try {
      await contracts.projects.removeuser(
        admin.params.account,
        'issueruser11',
        0,
        { authorization: `${admin.params.account}@active` }
      );
      failIssuer = false
    } catch (err){
      failIssuer = true
    }

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    // console.log("\n\n Projects table : ", projectsTable.rows);

    expect(failIssuer).to.be.false

    assert.deepStrictEqual(projectsTable.rows, [
      {
        project_id: projectsTable.rows[0].project_id,
        developer_id: 0,
        owner: project.params.actor,
        builder: '',
        investors: [],
        issuer: '',
        regional_center: '',
        project_name: project.params.project_name,
        description: project.params.description,
        image: project.params.image,
        projected_starting_date: projectsTable.rows[0].projected_starting_date,
        projected_completion_date: projectsTable.rows[0].projected_completion_date,
        created_date: projectsTable.rows[0].created_date,
        updated_date: projectsTable.rows[0].updated_date,
        close_date: projectsTable.rows[0].close_date,
        status: ProjectConstants.status.ready,
        approved_date: projectsTable.rows[0].approved_date,
        approved_by: projectsTable.rows[0].approved_by,
      },
    ])

  });

  it('Remove regional center from project', async () =>{
    //Arrange
    let failRegional
    const project = await ProjectFactory.createWithDefaults({
      actor: admin.params.account,
    });

    await contracts.projects.addproject(...project.getCreateActionParams(), {
      authorization: `${admin.params.account}@active`,
    });

    await contracts.projects.assignuser(
      admin.params.account,
      regional.params.account,
      0,
      { authorization: `${admin.params.account}@active` }
    );

    // Act
    try {
      await contracts.projects.removeuser(
        admin.params.account,
        'regionalcntr',
        0,
        { authorization: `${admin.params.account}@active` }
      );
      failRegional = false
    } catch (err) {
      failRegional = true
      //console.error(err)
    }

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    // console.log("\n\n Projects table : ", projectsTable.rows);

    expect(failRegional).to.be.false

    assert.deepStrictEqual(projectsTable.rows, [
      {
        project_id: projectsTable.rows[0].project_id,
        developer_id: 0,
        owner: project.params.actor,
        builder: '',
        investors: [],
        issuer: '',
        regional_center: '',
        project_name: project.params.project_name,
        description: project.params.description,
        image: project.params.image,
        projected_starting_date: projectsTable.rows[0].projected_starting_date,
        projected_completion_date: projectsTable.rows[0].projected_completion_date,
        created_date: projectsTable.rows[0].created_date,
        updated_date: projectsTable.rows[0].updated_date,
        close_date: projectsTable.rows[0].close_date,
        status: ProjectConstants.status.ready,
        approved_date: projectsTable.rows[0].approved_date,
        approved_by: projectsTable.rows[0].approved_by,
      },
    ])

  });

  const transactionsWithoutBuilderCases = [
    {testName: "Cannot send a transaction for EB5 if builder is missing", drawdown_id: 1},
    {testName: "Cannot send a transaction for Construction Loan if builder is missing", drawdown_id: 1},
    {testName: "Cannot send a transaction for Developer Equity if builder is missing", drawdown_id: 1}
  ]

  transactionsWithoutBuilderCases.forEach(({testName, drawdown_id}) => {
    it(testName, async () =>{
      //Arrange
      const transaction = await TransactionFactory.createWithDefaults({});

      const project = await ProjectFactory.createWithDefaults({
        actor: admin.params.account,
      });

      await contracts.projects.addproject(...project.getCreateActionParams(), {
        authorization: `${admin.params.account}@active`,
      });

      // Act
      try{
        await contracts.transactions.transacts(issuer.params.account, 0, drawdown_id, transaction.getCreateParams(), { authorization: `${issuer.params.account}@active` });
        fail = true
      } catch (err) {
        //console.error(err)
        fail = true
      }

      //Assert
      const usersTable = await rpc.get_table_rows({
        code: projects,
        scope: projects,
        table: 'users',
        json: true
      });
      //console.log(usersTable.rows); 

      const transactionsTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'transactions',
        json: true
      });
      //console.log('transactions table is: ', transactionsTable)

      expect(transactionsTable.rows).to.deep.equals([]);

      expect(fail).to.be.true

    });
  });

  const userRolesTransactionsCases = [
    {testName: "Investor role cannot send transactions for EB5 drawdowns", drawdown_id: 1, userName: "investoruser"},
    {testName: "Issuer role cannot send transactions for EB5 drawdowns", drawdown_id: 1, userName: "issueruser11"},
    {testName: "Regional Center role cannot send transactions for EB5 drawdowns", drawdown_id: 1, userName: "regionalcntr"},
    {testName: "External builder cannot send transactions for EB5 drawdowns", drawdown_id: 1, userName: "builderuser2"}
  ]

  userRolesTransactionsCases.forEach(({testName, drawdown_id, userName}) => {
    it(testName, async () =>{
      //Arrange
      await EnvironmentUtil.createAccount("builderuser2");

      const transaction = await TransactionFactory.createWithDefaults({});

      const project = await ProjectFactory.createWithDefaults({
        actor: admin.params.account,
      });

      Object.assign(project.params, {
        status: 1,
        id: 0,
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

      // Act
      try{
        await contracts.transactions.transacts(userName, project.params.id, drawdown_id, transaction.getCreateParams(), { authorization: `${userName}@active` });
        fail = true
      } catch (err) {
        //console.error(err)
        fail = true
      }

      //Assert
      const usersTable = await rpc.get_table_rows({
        code: projects,
        scope: projects,
        table: 'users',
        json: true
      });
      //console.log(usersTable.rows); 

      const transactionsTable = await rpc.get_table_rows({
        code: transactions,
        scope: project.params.id,
        table: 'transactions',
        json: true
      });
      //console.log('transactions table is: ', transactionsTable)

      expect(transactionsTable.rows).to.deep.equals([]);

      expect(fail).to.be.true

    });
  });

  it("A removed builder tries to do a transaction for a project where he was assigned (EB5 case)", async () =>  {
    //Arrange
    let drawdown_id = 1 //EB5 drawdown
    const project = await ProjectFactory.createWithDefaults({
      actor: admin.params.account,
    });

    await contracts.projects.addproject(...project.getCreateActionParams(), {
      authorization: `${admin.params.account}@active`,
    });

    Object.assign(project.params, {
      status: 1,
      id: 0,
      builder: builder.params.account
    });

    await contracts.projects.assignuser(
      admin.params.account,
      builder.params.account,
      0,
      { authorization: `${admin.params.account}@active` }
    );

    const transaction = await TransactionFactory.createWithDefaults({});
    const transaction2 = await TransactionFactory.createWithDefaults({});
    await contracts.transactions.transacts(builder.params.account, project.params.id, drawdown_id, transaction.getCreateParams(), { authorization: `${builder.params.account}@active` });
    
    await contracts.projects.removeuser(
      admin.params.account,
      'builderuser1',
      0,
      { authorization: `${admin.params.account}@active` }
    );

    //Act
    try{
      await contracts.transactions.transacts(builder.params.account, project.params.id, drawdown_id, transaction2.getCreateParams(), { authorization: `${builder.params.account}@active` });
      fail = false
    } catch (err) {
      //console.error(err)
      fail = true
    }
    
    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    //console.log("\n\n Projects table : ", projectsTable);

    const transactionsTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'transactions',
      json: true
    });
    //console.log('transactions table is: ', transactionsTable)

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
  });

  it("A builder tries to do a transaction for a project where he is not assigned (EB5 case)", async () =>  {
    //Arrange
    let drawdown_id = 1 //EB5 drawdown
    const project = await ProjectFactory.createWithDefaults({
      actor: admin.params.account,
    });

    await contracts.projects.addproject(...project.getCreateActionParams(), {
      authorization: `${admin.params.account}@active`,
    });

    Object.assign(project.params, {
      status: 1,
      id: 0,
      builder: builder.params.account
    });

    const project2 = await ProjectFactory.createWithDefaults({
      actor: admin.params.account,
    });

    await contracts.projects.addproject(...project2.getCreateActionParams(), {
      authorization: `${admin.params.account}@active`,
    });

    await EnvironmentUtil.createAccount("builderuser2");
    Object.assign(project2.params, {
      status: 1,
      id: 1,
      builder: "builderuser2"
    });

    await contracts.projects.assignuser(
      admin.params.account,
      builder.params.account,
      project.params.id,
      { authorization: `${admin.params.account}@active` }
    );
    await contracts.projects.assignuser(
      admin.params.account,
      "builderuser2",
      project2.params.id,
      { authorization: `${admin.params.account}@active` }
    );

    const transaction = await TransactionFactory.createWithDefaults({});
    const transaction2 = await TransactionFactory.createWithDefaults({});
    await contracts.transactions.transacts(builder.params.account, project.params.id, drawdown_id, transaction.getCreateParams(), { authorization: `${builder.params.account}@active` });
  

    //Act
    try{
      await contracts.transactions.transacts(builder.params.account, project2.params.id, drawdown_id, transaction2.getCreateParams(), { authorization: `${builder.params.account}@active` });
      fail = false
    } catch (err) {
      //console.error(err)
      fail = true
    }
    
    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    //console.log("\n\n Projects table : ", projectsTable);

    const transactionsTable = await rpc.get_table_rows({
      code: transactions,
      scope: project.params.id,
      table: 'transactions',
      json: true
    });
    //console.log('transactions table is: ', transactionsTable)

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

  });



});
