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

const expect = require('chai').expect;

const { projects, transactions } = contractNames;

const createRolesCases = (() => {
  return [
    {
      testName: 'Create an Admin account',
      role: Roles.fund
    },
    {
      testName: 'Create a Builder account',
      role: Roles.developer
    },
    {
      testName: 'Create an Investor account',
      role: Roles.investor
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

    contracts = await getContracts([projects, transactions]);

    await updatePermissions();
    console.log('\n');

  })

  afterEach(async function () {
    await EnvironmentUtil.killNode();

  });

  createRolesCases.forEach(({ testName, role }) => {
    it.only(testName, async () => {

      // Arrange
      const user = await UserFactory.createWithDefaults({ role: role });
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

      // console.table(usersTable.rows);

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

  it.only('Test reset action', async () => {
    // Arrange

    // Act
    await contracts.projects.reset({ authorization: `${projects}@active` })
    // Assert

    const usersTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'users',
      json: true
    });

    console.table(usersTable.rows);

  });


  it('Add test entities', async function () {

    // Arrange
    const developerEntity = await EntityFactory.createWithDefaults({ role: EntityConstants.developer });
    const developerParams = developerEntity.getActionParams()

    const investorEntity = await EntityFactory.createWithDefaults({ role: EntityConstants.investor });
    const investorParams = investorEntity.getActionParams()

    const fundEntity = await EntityFactory.createWithDefaults({ role: EntityConstants.fund });
    const fundParams = fundEntity.getActionParams()


    console.log(developerEntity, investorEntity, fundEntity)
    //Act
    await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })

    await contracts.projects.addentity(...investorParams, { authorization: `${investorParams[0]}@active` })

    await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })

    const entitiesTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'entities',
      json: true
    })
    console.table(entitiesTable.rows); 4

    // Assert
    assert.deepStrictEqual(entitiesTable.rows, [{
      entity_id: 1,
      entity_name: developerEntity.params.entity_name,
      description: developerEntity.params.description,
      role: developerEntity.params.role
    }, {
      entity_id: 2,
      entity_name: investorEntity.params.entity_name,
      description: investorEntity.params.description,
      role: investorEntity.params.role
    }, {
      entity_id: 3,
      entity_name: fundEntity.params.entity_name,
      description: fundEntity.params.description,
      role: fundEntity.params.role
    }])

  });

  it('Create an user', async function () {

    // Arrange
    const developerEntity = await EntityFactory.createWithDefaults({ role: EntityConstants.developer });

    const investorEntity = await EntityFactory.createWithDefaults({ role: EntityConstants.investor });

    const fundEntity = await EntityFactory.createWithDefaults({ role: EntityConstants.fund });


    await contracts.projects.addentity(...developerEntity.getActionParams(), { authorization: `${developerEntity.params.actor}@active` });

    await contracts.projects.addentity(...investorEntity.getActionParams(), { authorization: `${investorEntity.params.actor}@active` });

    await contracts.projects.addentity(...fundEntity.getActionParams(), { authorization: `${fundEntity.params.actor}@active` });

    //Act  name user, string user_name, uint64_t entity_id
    await contracts.projects.addtestuser(developerEntity.params.actor, developerEntity.params.entity_name, 1, { authorization: `${developerEntity.params.actor}@active` });

    await contracts.projects.addtestuser(investorEntity.params.actor, investorEntity.params.entity_name, 2, { authorization: `${investorEntity.params.actor}@active` });

    await contracts.projects.addtestuser(fundEntity.params.actor, fundEntity.params.entity_name, 3, { authorization: `${fundEntity.params.actor}@active` });

    const entitiesTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'entities',
      json: true
    });

    console.table(entitiesTable.rows);

    const usersTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'users',
      json: true
    });

    console.table(usersTable.rows);

    // Assert
    expect(usersTable.rows).to.deep.include.members([{
      account: developerEntity.params.actor,
      user_name: developerEntity.params.entity_name,
      entity_id: 1,
      related_projects: [],
      role: EntityConstants.developer
    }, {
      account: investorEntity.params.actor,
      user_name: investorEntity.params.entity_name,
      entity_id: 2,
      related_projects: [],
      role: EntityConstants.investor
    }, {
      account: fundEntity.params.actor,
      user_name: fundEntity.params.entity_name,
      entity_id: 3,
      related_projects: [],
      role: EntityConstants.fund
    }]);

  });

});