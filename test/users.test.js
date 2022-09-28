const { rpc, api, transact } = require('../scripts/eos');
const { getContracts, createRandomAccount, createRandomName } = require('../scripts/eosio-util');
const { assertError } = require('../scripts/eosio-errors');
const { contractNames, contracts: configContracts, isLocalNode, sleep } = require('../scripts/config');

const { updatePermissions } = require('../scripts/permissions');

const { EnvironmentUtil } = require('./util/EnvironmentUtil');
const { EntityFactory, EntityConstants } = require('./util/EntityUtil');
const { ProjectFactory, ProjectConstants, ProjectUtil } = require('./util/ProjectUtil');
const { UserFactory, Roles } = require('./util/UserUtil');

const { generate_public_key } = require('./util/lorem');

const { func } = require('promisify');
const assert = require('assert');
const { Console } = require('console');
const { hasUncaughtExceptionCaptureCallback } = require('process');

const expect = require('chai').expect;

const { accounts, projects, budgets, permissions, transactions } = contractNames


const createRolesCases = (() => {
  return [
    {
      testName: 'Create an Admin account',
      role: Roles.fund,
      entityID: 1
    },
    {
      testName: 'Create an Investor account',
      role: Roles.investor,
      entityID: 2
    },
    {
      testName: 'Create a Builder account',
      role: Roles.developer,
      entityID: 3
    },
    {
      testName: 'Create an Issuer account',
      role: Roles.issuer,
      entityID: 4
    },
    {
      testName: 'Create a Regional center account',
      role: Roles.regional_center,
      entityID: 5
    }
  ]
})()


describe('Tests for the users on projects smart contract', async function () {

  let contracts;

  before(async function () {
    if (!isLocalNode()) {
      console.log('These tests should only be run on a local node');
      process.exit(1);
    }
  })

  beforeEach(async function () {
    await EnvironmentUtil.initNode();
    await sleep(4000);
    await EnvironmentUtil.deployContracts(configContracts);

    contracts = await getContracts([projects, accounts, budgets, permissions, transactions])

    await updatePermissions();

    // clear old data
    await contracts.projects.reset({ authorization: `${projects}@active` });
    await contracts.accounts.reset({ authorization: `${accounts}@active` });
    await contracts.budgets.reset({ authorization: `${budgets}@active` });
    await contracts.permissions.reset({ authorization: `${permissions}@active` });
    await contracts.transactions.reset({ authorization: `${transactions}@active` });

    admin = await UserFactory.createWithDefaults({
      role: Roles.fund,
      account: "proxyadmin11",
      user_name: "Admin",
      entity_id: 1,
    });
    builder = await UserFactory.createWithDefaults({
      role: Roles.builder,
      account: "builderuser1",
      user_name: "Builder",
      entity_id: 3,
    });

    await EnvironmentUtil.createAccount("proxyadmin11");
    await EnvironmentUtil.createAccount("builderuser1");



  })

  afterEach(async function () {
    await EnvironmentUtil.killNode();

  });

  createRolesCases.forEach(({ testName, role, entityID }) => {
    it(testName, async () => {

      // Arrange
      const user = await UserFactory.createWithDefaults({ role: role });


      Object.assign(user.params, {
        entity_id: entityID,
        description: 'description',
        related_projects: [],
        public_key: ''
      });

      //console.log('user params is: ', user.params)
      // console.table(user);

      // Act
      await contracts.projects.adduser(projects, ...user.getCreateParams(), { authorization: `${projects}@active` })

      // Assert
      const usersTable = await rpc.get_table_rows({
        code: projects,
        scope: projects,
        table: 'users',
        json: true
      });

      //console.log(usersTable.rows);

      expect(usersTable.rows).to.deep.include.members([{
        account: user.params.account,
        user_name: user.params.user_name,
        entity_id: user.params.entity_id,
        related_projects: user.params.related_projects,
        role: role,
        description: user.params.description,
        public_key: user.params.public_key
      }]);

    });

  })

  it('Test init action', async () => {
    // Arrange

    // Act
    await contracts.projects.init({ authorization: `${projects}@active` })

    // Assert
    const usersTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'users',
      json: true
    });
    //console.log(usersTable)

    const entitiesTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'entities',
      json: true
    });
    //console.log(entitiesTable)

  });

  it('Cannot init action twice', async () => {
    // Arrange
    let fail
    await contracts.projects.init({ authorization: `${projects}@active` })

    // Act
    try {
      await contracts.projects.init({ authorization: `${projects}@active` })
      fail = false;
    } catch (err) {
      fail = true
    }

    // Assert
    const usersTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'users',
      json: true
    });

    const entitiesTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'entities',
      json: true
    });

    expect(fail).to.be.true

    // console.table(usersTable.rows);
    // console.table(entitiesTable.rows);

  });

  const addEntitiesCases = [
    { testName: 'Add admin entity', userRole: Roles.fund },
    { testName: 'Add developer entity', userRole: Roles.developer },
    { testName: 'Add investor entity', userRole: Roles.investor },
    { testName: 'Add issuer entity', userRole: Roles.issuer },
    { testName: 'Add regional center entity', userRole: Roles.regional_center },
  ]

  addEntitiesCases.forEach(({ testName, userRole }) => {
    it(testName, async () => {
      //Arrange
      const entity = await EntityFactory.createWithDefaults({ role: userRole });
      const entityParams = entity.getActionParams()

      //Act
      await contracts.projects.addentity(...entity.getActionParams(), { authorization: `${entityParams[0]}@active` })

      // Assert
      const entitiesTable = await rpc.get_table_rows({
        code: projects,
        scope: projects,
        table: 'entities',
        json: true
      })
      // console.table(entitiesTable.rows); 
      // console.log(entityParams[0])

      assert.deepStrictEqual(entitiesTable.rows, [{
        entity_id: 1,
        entity_name: entityParams[1],
        description: entityParams[2],
        role: entityParams[3]
      }])
    });
  });

  const addUserwithRolCases = [
    { testName: 'Add admin account', userRole: Roles.fund, entityID: 1 },
    { testName: 'Add investor account', userRole: Roles.investor, entityID: 2 },
    { testName: 'Add developer account', userRole: Roles.developer, entityID: 3 },
    { testName: 'Add issuer account', userRole: Roles.issuer, entityID: 4 },
    { testName: 'Add regional center account', userRole: Roles.regional_center, entityID: 5 },
  ]

  addUserwithRolCases.forEach(({ testName, userRole, entityID }) => {
    itly(testName, async () => {
      //Arrange
      const user = await UserFactory.createWithDefaults({ role: userRole });
      Object.assign(user.params, {
        description: 'description',
        entity_id: entityID,
        related_projects: [],
        public_key: ''
      });

      //Act
      await contracts.projects.adduser(projects, ...user.getCreateParams(), {
        authorization: `${projects}@active`,
      });

      // Assert
      const usersTable = await rpc.get_table_rows({
        code: projects,
        scope: projects,
        table: 'users',
        json: true
      });
      //console.log("Users table is: ", usersTable.rows)

      assert.deepStrictEqual(usersTable.rows, [{
        account: user.params.account,
        user_name: user.params.user_name,
        entity_id: user.params.entity_id,
        role: user.params.role,
        related_projects: user.params.related_projects,
        description: user.params.description,
        public_key: user.params.public_key
      }])
    });
  });

  it("Admin cannot add a user twice", async () => {
    //Arrange
    let fail
    const user = await UserFactory.createWithDefaults({ role: Roles.developer, entity_id: 3 });

    Object.assign(user.params, {
      description: 'description',
      entity_id: 3,
      related_projects: [],
      public_key: ''
    });

    await contracts.projects.adduser(projects, ...user.getCreateParams(), {
      authorization: `${projects}@active`,
    });


    //Act
    try {
      await contracts.projects.adduser(projects, ...user.getCreateParams(), {
        authorization: `${projects}@active`,
      });
      fail = false
    } catch (err) {
      fail = true
      //console.error(err)
    }

    //Assert
    const usersTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'users',
      json: true
    });
    //console.log("Users table is: ", usersTable.rows)

    expect(fail).to.be.true

    assert.deepStrictEqual(usersTable.rows, [{
      account: user.params.account,
      user_name: user.params.user_name,
      entity_id: user.params.entity_id,
      role: user.params.role,
      related_projects: user.params.related_projects,
      description: user.params.description,
      public_key: user.params.public_key,
    }])

  });

  it("An user cannot have more than one role", async () => {
    //Arrange
    let fail
    const user = await UserFactory.createWithDefaults({ role: Roles.developer, entity_id: 3 });
    Object.assign(user.params, {
      description: 'description',
      entity_id: 3,
      related_projects: [],
      public_key: ''
    });

    await contracts.projects.adduser(projects, ...user.getCreateParams(), {
      authorization: `${projects}@active`,
    });

    Object.assign(user.params, {
      role: Roles.issuer
    });

    //Act
    try {
      await contracts.projects.adduser(projects, ...user.getCreateParams(), {
        authorization: `${projects}@active`,
      });
      fail = false
    } catch (err) {
      fail = true
      //console.error(err)
    }

    //Assert
    const usersTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'users',
      json: true
    });
    //console.log("Users table is: ", usersTable.rows)

    expect(fail).to.be.true

    assert.deepStrictEqual(usersTable.rows, [{
      account: user.params.account,
      user_name: user.params.user_name,
      entity_id: user.params.entity_id,
      role: Roles.developer,
      related_projects: user.params.related_projects,
      description: user.params.description,
      public_key: user.params.public_key,
    }])
  });



  it("Only admin role can add new users", async () => {
    //TODO, depends on requirements, if not, delete this unit test
  });

  const createUserAndAddPublicKey = [
    {
      testName: 'Create an Admin account and public key',
      role: Roles.fund,
      entityID: 1
    },
    {
      testName: 'Create an Investor account and public key',
      role: Roles.investor,
      entityID: 2
    },
    {
      testName: 'Create a Builder account and public key',
      role: Roles.developer,
      entityID: 3
    },
    {
      testName: 'Create an Issuer account and public key',
      role: Roles.issuer,
      entityID: 4
    },
    {
      testName: 'Create a Regional center account and public key',
      role: Roles.regional_center,
      entityID: 5
    }
  ]

  createUserAndAddPublicKey.forEach(({ testName, role, entityID }) => {
    it(testName, async () => {

      // Arrange
      const user = await UserFactory.createWithDefaults({ role: role });

      const public_key = await generate_public_key();

      Object.assign(user.params, {
        entity_id: entityID,
        description: 'description',
        related_projects: [],
        public_key: public_key

      });

      await contracts.projects.adduser(projects, ...user.getCreateParams(), { authorization: `${projects}@active` })

      await contracts.projects.signup(user.params.account, public_key)
      // Assert
      const usersTable = await rpc.get_table_rows({
        code: projects,
        scope: projects,
        table: 'users',
        json: true
      });

      //console.log(usersTable.rows);
      expect(usersTable.rows).to.deep.include.members([{
        account: user.params.account,
        user_name: user.params.user_name,
        entity_id: user.params.entity_id,
        related_projects: user.params.related_projects,
        role: role,
        description: user.params.description,
        public_key: user.params.public_key
      }]);

    });

  })


});

