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
    // TODO: Sole this test
    // Arrange
    // const developerEntity = await EntityFactory.createWithDefaults({ role: EntityConstants.developer });

    // const investorEntity = await EntityFactory.createWithDefaults({ role: EntityConstants.investor });

    // const fundEntity = await EntityFactory.createWithDefaults({ role: EntityConstants.fund });


    // await contracts.projects.addentity(...developerEntity.getActionParams(), { authorization: `${developerEntity.params.actor}@active` });

    // await contracts.projects.addentity(...investorEntity.getActionParams(), { authorization: `${investorEntity.params.actor}@active` });

    // await contracts.projects.addentity(...fundEntity.getActionParams(), { authorization: `${fundEntity.params.actor}@active` });

    // //Act  name user, string user_name, uint64_t entity_id
    // await contracts.projects.addtestuser(developerEntity.params.actor, developerEntity.params.entity_name, 1, { authorization: `${developerEntity.params.actor}@active` });

    // await contracts.projects.addtestuser(investorEntity.params.actor, investorEntity.params.entity_name, 2, { authorization: `${investorEntity.params.actor}@active` });

    // await contracts.projects.addtestuser(fundEntity.params.actor, fundEntity.params.entity_name, 3, { authorization: `${fundEntity.params.actor}@active` });

    // const entitiesTable = await rpc.get_table_rows({
    //   code: projects,
    //   scope: projects,
    //   table: 'entities',
    //   json: true
    // });

    // console.table(entitiesTable.rows);

    // const usersTable = await rpc.get_table_rows({
    //   code: projects,
    //   scope: projects,
    //   table: 'users',
    //   json: true
    // });

    // console.table(usersTable.rows);

    // // Assert
    // expect(usersTable.rows).to.deep.include.members([{
    //   account: developerEntity.params.actor,
    //   user_name: developerEntity.params.entity_name,
    //   entity_id: 1,
    //   related_projects: [],
    //   role: EntityConstants.developer
    // }, {
    //   account: investorEntity.params.actor,
    //   user_name: investorEntity.params.entity_name,
    //   entity_id: 2,
    //   related_projects: [],
    //   role: EntityConstants.investor
    // }, {
    //   account: fundEntity.params.actor,
    //   user_name: fundEntity.params.entity_name,
    //   entity_id: 3,
    //   related_projects: [],
    //   role: EntityConstants.fund
    // }]);

  });

});


// const { rpc, api, transact } = require('../scripts/eos');
// const { getContracts, createRandomAccount, createRandomName } = require('../scripts/eosio-util');
// const { assertError } = require('../scripts/eosio-errors');
// const { contractNames, contracts: configContracts, isLocalNode, sleep } = require('../scripts/config');

// const { updatePermissions } = require('../scripts/permissions');

// const { EnvironmentUtil } = require('./util/EnvironmentUtil')
// const { BudgetFactory, BudgetConstants } = require('./util/BudgetUtil')
// const { EntityFactory, EntityConstants } = require('./util/EntityUtil')
// const { ProjectFactory, ProjectConstants, ProjectUtil } = require('./util/ProjectUtil')
// const { UserFactory, Roles } = require('./util/UserUtil');
// const { TransactionFactory, Flag, DrawdownState } = require('./util/TransactionUtil');
// const { AccountFactory, AccountConstants, AccountUtil } = require('./util/AccountUtil');


// const { func } = require('promisify');
// const assert = require('assert');
// const { Console } = require('console');

// const expect = require('chai').expect;

// const { projects, accounts, budgets, permissions, transactions } =
//   contractNames;


// describe('Tests for the users on projects smart contract', async function () {

//   let contracts;

//   before(async function () {
//     if (!isLocalNode()) {
//       console.log('These tests should only be run on a local node');
//       process.exit(1);
//     }
//   })

//   beforeEach(async function () {
//     await EnvironmentUtil.initNode();
//     await sleep(4000);
//     await EnvironmentUtil.deployContracts(configContracts);

//     contracts = await getContracts([projects, accounts, budgets, permissions, transactions])

//     await updatePermissions();
//     console.log('\n');

//     // await contracts.projects.init({ authorization: `${projects}@active` });
//     // await contracts.accounts.init({ authorization: `${accounts}@active` });

//     // admin = await UserFactory.createWithDefaults({ role: Roles.fund, account: 'proxyadmin11', user_name: 'Admin', entity_id: 1 });
//     // investor = await UserFactory.createWithDefaults({ role: Roles.investor, account: 'investoruser', user_name: 'Investor', entity_id: 2 });
//     // builder = await UserFactory.createWithDefaults({ role: Roles.builder, account: 'builderuser1', user_name: 'Builder', entity_id: 3 });

//     // await EnvironmentUtil.createAccount('proxyadmin11');
//     // await EnvironmentUtil.createAccount('investoruser');
//     // await EnvironmentUtil.createAccount('builderuser1');

//     // project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

//     // await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

//     // await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })
//     // await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

//     // Object.assign(project.params, {
//     //   status: 1,
//     //   id: 0,
//     //   builder: builder.params.account,
//     //   investors: [investor.params.account],
//     // });

//     const projectsTable = await rpc.get_table_rows({
//       code: projects,
//       scope: projects,
//       table: 'projects',
//       json: true
//     })

//     //console.log('\n\n Projects table : ', projectsTable)

//   })

//   afterEach(async function () {
//     await EnvironmentUtil.killNode();

//   });

//   const createRolesCases = [
//     {
//       testName: 'Create an Admin account',
//       role: Roles.fund,
//       entity_id: 1
//     },
//     {
//       testName: 'Create an Investor account',
//       role: Roles.investor,
//       entity_id: 2
//     },
//     {
//       testName: 'Create a Builder account',
//       role: Roles.developer,
//       entity_id: 3
//     }]

//   createRolesCases.forEach(({ testName, role, entity_id }) => {
//     it.only(testName, async () => {
//       // Arrange
//       const user = await UserFactory.createWithDefaults({ role: role });

//       user.params.entity_id = entity_id;
//       console.table(user);

//       // Act
//       try{
//         await contracts.projects.adduser(admin.params.account, ...user.getCreateParams(), { authorization: `${admin.params.account}@active` })

//       } catch( err){
//         console.error(err)
//       }
//       // Assert
//       const usersTable = await rpc.get_table_rows({
//         code: projects,
//         scope: projects,
//         table: 'users',
//         json: true
//       });

//       console.table(usersTable.rows);

//       expect(usersTable.rows).to.deep.include.members([{
//         account: user.params.account,
//         description: "description",
//         user_name: user.params.user_name,
//         entity_id: user.params.entity_id,
//         related_projects: [],
//         role: role
//       }]);

//     });

//   })

//   it('Test init action', async () => {
//     // Arrange

//     // Act
//     await contracts.projects.init({ authorization: `${projects}@active` })

//     // Assert
//     const usersTable = await rpc.get_table_rows({
//       code: projects,
//       scope: projects,
//       table: 'users',
//       json: true
//     });

//     const entitiesTable = await rpc.get_table_rows({
//       code: projects,
//       scope: projects,
//       table: 'entities',
//       json: true
//     });

//     console.table(usersTable.rows);
//     console.table(entitiesTable.rows);

//   });


//   it('Add test entities', async function () {

//     // Arrange
//     const developerEntity = await EntityFactory.createWithDefaults({ role: EntityConstants.developer });
//     const developerParams = developerEntity.getActionParams()

//     const investorEntity = await EntityFactory.createWithDefaults({ role: EntityConstants.investor });
//     const investorParams = investorEntity.getActionParams()

//     const fundEntity = await EntityFactory.createWithDefaults({ role: EntityConstants.fund });
//     const fundParams = fundEntity.getActionParams()


//     console.log(developerEntity, investorEntity, fundEntity)
//     //Act
//     await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })

//     await contracts.projects.addentity(...investorParams, { authorization: `${investorParams[0]}@active` })

//     await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })

//     const entitiesTable = await rpc.get_table_rows({
//       code: projects,
//       scope: projects,
//       table: 'entities',
//       json: true
//     })
//     console.table(entitiesTable.rows); 4

//     // Assert
//     assert.deepStrictEqual(entitiesTable.rows, [{
//       entity_id: 1,
//       entity_name: developerEntity.params.entity_name,
//       description: developerEntity.params.description,
//       role: developerEntity.params.role
//     }, {
//       entity_id: 2,
//       entity_name: investorEntity.params.entity_name,
//       description: investorEntity.params.description,
//       role: investorEntity.params.role
//     }, {
//       entity_id: 3,
//       entity_name: fundEntity.params.entity_name,
//       description: fundEntity.params.description,
//       role: fundEntity.params.role
//     }])

//   });

//   it('Create an user', async function () {
//     // TODO: Sole this test
//     // Arrange
//     // const developerEntity = await EntityFactory.createWithDefaults({ role: EntityConstants.developer });

//     // const investorEntity = await EntityFactory.createWithDefaults({ role: EntityConstants.investor });

//     // const fundEntity = await EntityFactory.createWithDefaults({ role: EntityConstants.fund });


//     // await contracts.projects.addentity(...developerEntity.getActionParams(), { authorization: `${developerEntity.params.actor}@active` });

//     // await contracts.projects.addentity(...investorEntity.getActionParams(), { authorization: `${investorEntity.params.actor}@active` });

//     // await contracts.projects.addentity(...fundEntity.getActionParams(), { authorization: `${fundEntity.params.actor}@active` });

//     // //Act  name user, string user_name, uint64_t entity_id
//     // await contracts.projects.addtestuser(developerEntity.params.actor, developerEntity.params.entity_name, 1, { authorization: `${developerEntity.params.actor}@active` });

//     // await contracts.projects.addtestuser(investorEntity.params.actor, investorEntity.params.entity_name, 2, { authorization: `${investorEntity.params.actor}@active` });

//     // await contracts.projects.addtestuser(fundEntity.params.actor, fundEntity.params.entity_name, 3, { authorization: `${fundEntity.params.actor}@active` });

//     // const entitiesTable = await rpc.get_table_rows({
//     //   code: projects,
//     //   scope: projects,
//     //   table: 'entities',
//     //   json: true
//     // });

//     // console.table(entitiesTable.rows);

//     // const usersTable = await rpc.get_table_rows({
//     //   code: projects,
//     //   scope: projects,
//     //   table: 'users',
//     //   json: true
//     // });

//     // console.table(usersTable.rows);

//     // // Assert
//     // expect(usersTable.rows).to.deep.include.members([{
//     //   account: developerEntity.params.actor,
//     //   user_name: developerEntity.params.entity_name,
//     //   entity_id: 1,
//     //   related_projects: [],
//     //   role: EntityConstants.developer
//     // }, {
//     //   account: investorEntity.params.actor,
//     //   user_name: investorEntity.params.entity_name,
//     //   entity_id: 2,
//     //   related_projects: [],
//     //   role: EntityConstants.investor
//     // }, {
//     //   account: fundEntity.params.actor,
//     //   user_name: fundEntity.params.entity_name,
//     //   entity_id: 3,
//     //   related_projects: [],
//     //   role: EntityConstants.fund
//     // }]);

//   });

//   /*
//    it.only("Remove (builder, issuer, regional center) from project", async () => {
//     //Arrange
//     let fail
//     const project = await ProjectFactory.createWithDefaults({
//       actor: admin.params.account,
//     });

//     await contracts.projects.addproject(...project.getCreateActionParams(), {
//       authorization: `${admin.params.account}@active`,
//     });
//     console.log('assigned users: \n', 
//     admin.params.account, '\n',
//     investor.params.account, '\n',
//     issuer.params.account, '\n',
//     builder.params.account, '\n',
//     regional.params.account, '\n',)

//     await contracts.projects.assignuser(
//       admin.params.account,
//       builder.params.account,
//       0,
//       { authorization: `${admin.params.account}@active` }
//     );

//     await contracts.projects.assignuser(
//       admin.params.account,
//       investor.params.account,
//       0,
//       { authorization: `${admin.params.account}@active` }
//     );

//     await contracts.projects.assignuser(
//       admin.params.account,
//       issuer.params.account,
//       0,
//       { authorization: `${admin.params.account}@active` }
//     );

//     await contracts.projects.assignuser(
//       admin.params.account,
//       regional.params.account,
//       0,
//       { authorization: `${admin.params.account}@active` }
//     );

//     Object.assign(project.params, {
//       status: 1,
//       builder: builder.params.account,
//       investors: [investor.params.account],
//       issuer: "",
//       regional_center: "",
//       fund_lp: "https://fund-lp.com",
//       total_fund_offering_amount: "400000.00 USD",
//       total_number_fund_offering: 40000,
//       price_per_fund_unit: "300.00 USD",
//     });

//     await contracts.projects.approveprjct(
//       admin.params.account,
//       0,
//       ...project.getApproveActionParams(),
//       { authorization: `${admin.params.account}@active` }
//     );
    
//     // Act
//     try {
//       await contracts.projects.removeuser(
//         admin.params.account,
//         'issueruser1',
//         0,
//         { authorization: `${admin.params.account}@active` }
//       );
      
//       await contracts.projects.removeuser(
//         admin.params.account,
//         'investoruser',
//         0,
//         { authorization: `${admin.params.account}@active` }
//       );

//       await contracts.projects.removeuser(
//         admin.params.account,
//         'builderuser1',
//         0,
//         { authorization: `${admin.params.account}@active` }
//       );

//       await contracts.projects.removeuser(
//         admin.params.account,
//         'regionalcntr',
//         0,
//         { authorization: `${admin.params.account}@active` }
//       );
//       fail = false
//     } catch (err) {
//       fail = true
//       //console.error(err)
//     }

//     //Assert
//     const projectsTable = await rpc.get_table_rows({
//       code: projects,
//       scope: projects,
//       table: "projects",
//       json: true,
//     });
//     //console.log("\n\n Projects table : ", projectsTable.rows);

//     const UserTable = await rpc.get_table_rows({
//       code: projects,
//       scope: projects,
//       table: "users",
//       json: true,
//     });
//     //console.log('users table : ', UserTable.rows);

//     // expect(fail).to.be.true

//     // assert.deepStrictEqual(projectsTable.rows, [
//     //   {
//     //     project_id: 0,
//     //     developer_id: 0,
//     //     owner: project.params.actor,
//     //     project_class: project.params.project_class,
//     //     project_name: project.params.project_name,
//     //     description: project.params.description,
//     //     created_date: projectsTable.rows[0].created_date,
//     //     status: ProjectConstants.status.ready,
//     //     builder: '',
//     //     investors: [],
//     //     issuer: '',
//     //     regional_center: '',
//     //     total_project_cost: project.params.total_project_cost,
//     //     debt_financing: project.params.debt_financing,
//     //     term: project.params.term,
//     //     interest_rate: project.params.interest_rate,
//     //     loan_agreement: project.params.loan_agreement,
//     //     total_equity_financing: project.params.total_equity_financing,
//     //     total_gp_equity: project.params.total_gp_equity,
//     //     private_equity: project.params.private_equity,
//     //     annual_return: project.params.annual_return,
//     //     project_co_lp: project.params.project_co_lp,
//     //     project_co_lp_date: project.params.project_co_lp_date,
//     //     projected_completion_date: project.params.projected_completion_date,
//     //     projected_stabilization_date:
//     //       project.params.projected_stabilization_date,
//     //     anticipated_year_sale_refinance:
//     //       project.params.anticipated_year_sale_refinance,
//     //     fund_lp: project.params.fund_lp,
//     //     total_fund_offering_amount: project.params.total_fund_offering_amount,
//     //     total_number_fund_offering: project.params.total_number_fund_offering,
//     //     price_per_fund_unit: project.params.price_per_fund_unit,
//     //     approved_date: projectsTable.rows[0].approved_date,
//     //     approved_by: projectsTable.rows[0].approved_by,
//     //   },
//     // ]);

//   });
//   */

// });