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

describe.only("Tests for migrations of the smart contract", async function () {
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

    await EnvironmentUtil.createAccount("proxyadmin11");
    await EnvironmentUtil.createAccount("investoruser");
    await EnvironmentUtil.createAccount("builderuser1");
    await EnvironmentUtil.createAccount("issueruser11");
    await EnvironmentUtil.createAccount("regionalcntr");


  });

  afterEach(async function () {
    await EnvironmentUtil.killNode();
  });

  it("Test creation of projects in production", async function () {

    //Arrange
    const admin = "proxy.gm"
    await EnvironmentUtil.createAccount(admin);
    await EnvironmentUtil.createAccount("mrcolemel212");
    await EnvironmentUtil.createAccount("awongmrc2123");

    //Act
    await contracts.projects.migration({ authorization: `${projects}@active` });

    await contracts.accounts.editaccount(
      admin, 0 , 4,
      "Furniture, Fixtures & Equipment Purchases", "Children account",
      2, "16002474.00 USD", 4232, 59169 , { authorization: `${accounts}@active` }
    );
    await contracts.accounts.editaccount(
      admin, 0 , 3,
      "Construction", "Children account",
      2, "136210049.00 USD", 2362, 138432 , { authorization: `${accounts}@active` }
    );
    await contracts.accounts.editaccount(
      admin, 0 , 6,
      "Architectural, Engineering and Related Services", "Children account",
      3, "16002474.00 USD", 5413, 133179 , { authorization: `${accounts}@active` }
    );

    await contracts.accounts.deleteaccnt(admin, 0, 16, { authorization: `${accounts}@active` });
    await contracts.accounts.deleteaccnt(admin, 0, 21, { authorization: `${accounts}@active` });
    await contracts.accounts.deleteaccnt(admin, 0, 9, { authorization: `${accounts}@active` });
    await contracts.accounts.deleteaccnt(admin, 0, 17, { authorization: `${accounts}@active` });
    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: "projects",
      json: true,
    });
    console.log(projectsTable.rows);

    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'accounts',
      json: true,
      limit: 100
    });
    console.log(accountsTable.rows);

    const transactionsTable = await rpc.get_table_rows({
      code: transactions,
      scope: 0,
      table: 'transactions',
      json: true
    });
    console.log(transactionsTable.rows);

  });
});