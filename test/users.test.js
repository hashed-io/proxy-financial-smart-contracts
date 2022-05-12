const { rpc, api, transact } = require('../scripts/eos');
const { getContracts, createRandomAccount, createRandomName } = require('../scripts/eosio-util');
const { assertError } = require('../scripts/eosio-errors');
const { contractNames, contracts: configContracts, isLocalNode, sleep } = require('../scripts/config');

const { updatePermissions } = require('../scripts/permissions');

const { EnvironmentUtil } = require('./util/EnvironmentUtil');
const { EntityFactory, EntityConstants } = require('./util/EntityUtil');
const { ProjectFactory, ProjectConstants, ProjectUtil } = require('./util/ProjectUtil');
const { UserFactory, Roles } = require('./util/UserUtil');

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
      entity_id: 1
    },
    {
      testName: 'Create an Investor account',
      role: Roles.investor,
      entity_id: 2
    },
    {
      testName: 'Create a Builder account',
      role: Roles.developer,
      entity_id: 3
    },
    {
      testName: 'Create an Issuer account',
      role: Roles.issuer,
      entity_id: 4
    },
    {
      testName: 'Create a Regional center account',
      role: Roles.regional_center,
      entity_id: 5
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
    console.log('\n');
  })

  afterEach(async function () {
    await EnvironmentUtil.killNode();

  });

  createRolesCases.forEach(({ testName, role, entity_id }) => {
    it(testName, async () => {

      // Arrange
      const user = await UserFactory.createWithDefaults({ role: role });

      user.params.entity_id = entity_id;
      console.log('user paramas is: ', user.params)
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

      console.table(usersTable.rows);

      expect(usersTable.rows).to.deep.include.members([{
        account: user.params.account,
        description: "description",
        user_name: user.params.user_name,
        entity_id: user.params.entity_id,
        related_projects: [],
        role: role
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

    const entitiesTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'entities',
      json: true
    });

    console.table(usersTable.rows);
    console.table(entitiesTable.rows);

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

    console.table(usersTable.rows);
    console.table(entitiesTable.rows);

  });

  const addEntitiesCases = [
    {testName: 'Add admin entity', userRole: EntityConstants.fund},
    {testName: 'Add developer entity', userRole: EntityConstants.developer},
    {testName: 'Add investor', userRole: EntityConstants.investor},
    {testName: 'Add issuer entity', userRole: EntityConstants.issuer},
    {testName: 'Add regional center entity', userRole: EntityConstants.regional},
  ]

  addEntitiesCases.forEach(({testName, userRole}) => {
    it(testName, async () => {
      //Arrange
      const user = await EntityFactory.createWithDefaults({ role: userRole});
      const userParams = user.getActionParams()
      console.log(userParams)

      //Act
      await contracts.projects.addentity(...user.getActionParams(), { authorization: `${userParams[0]}@active` })

      // Assert
      const entitiesTable = await rpc.get_table_rows({
        code: projects,
        scope: projects,
        table: 'entities',
        json: true
      })
      console.table(entitiesTable.rows); 
      console.log(userParams[0])

      assert.deepStrictEqual(entitiesTable.rows, [{
        entity_id: 1,
        entity_name: userParams[1],
        description: userParams[2],
        role: userParams[3]
      }])
    });
  });


});

