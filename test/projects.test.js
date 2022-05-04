const { rpc, api, transact } = require('../scripts/eos')
const { getContracts, createRandomAccount, createRandomName } = require('../scripts/eosio-util')

const { assertError } = require('../scripts/eosio-errors')
const { contractNames, contracts: configContracts, isLocalNode, sleep } = require('../scripts/config')

const { updatePermissions } = require('../scripts/permissions')

const { EnvironmentUtil } = require('./util/EnvironmentUtil')
const { EntityFactory, EntityConstants } = require('./util/EntityUtil')
const { ProjectFactory, ProjectConstants, ProjectUtil } = require('./util/ProjectUtil')
const { UserFactory, Roles } = require('./util/UserUtil');


const { func } = require('promisify')
const assert = require('assert')

const expect = require('chai').expect

const { projects, accounts, budgets, permissions, transactions} = contractNames


describe('Tests for projects smart contract', async function () {

  let contracts, admin, builder, investor

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
    console.log('\n')

    await contracts.projects.init({ authorization: `${projects}@active` });

    admin = await UserFactory.createWithDefaults({ role: Roles.fund, account: 'proxyadmin11', user_name: 'Admin', entity_id: 1 });
    investor = await UserFactory.createWithDefaults({ role: Roles.investor, account: 'investoruser', user_name: 'Investor', entity_id: 2 });
    builder = await UserFactory.createWithDefaults({ role: Roles.builder, account: 'builderuser1', user_name: 'Builder', entity_id: 3 });

    await EnvironmentUtil.createAccount('proxyadmin11');
    await EnvironmentUtil.createAccount('investoruser');
    await EnvironmentUtil.createAccount('builderuser1');



  })

  afterEach(async function () {
    await EnvironmentUtil.killNode()

  })

  // it('Add test entities', async function () {

  //   // Arrange
  //   const developerEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.developer });
  //   const developerParams = developerEntity.getActionParams()

  //   const investorEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.investor });
  //   const investorParams = investorEntity.getActionParams()

  //   const fundEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.fund });
  //   const fundParams = fundEntity.getActionParams()


  //   console.log(developerEntity, investorEntity, fundEntity)
  //   //Act
  //   await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })

  //   await contracts.projects.addentity(...investorParams, { authorization: `${investorParams[0]}@active` })

  //   await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })

  //   const entitiesTable = await rpc.get_table_rows({
  //     code: projects,
  //     scope: projects,
  //     table: 'entities',
  //     json: true
  //   })
  //   console.table(entitiesTable.rows); 4

  //   // Assert
  //   assert.deepStrictEqual(entitiesTable.rows, [{
  //     entity_id: 1,
  //     entity_name: developerEntity.params.entity_name,
  //     description: developerEntity.params.description,
  //     role: developerEntity.params.type
  //   }, {
  //     entity_id: 2,
  //     entity_name: investorEntity.params.entity_name,
  //     description: investorEntity.params.description,
  //     role: investorEntity.params.type
  //   }, {
  //     entity_id: 3,
  //     entity_name: fundEntity.params.entity_name,
  //     description: fundEntity.params.description,
  //     role: fundEntity.params.type
  //   }])

  // })

  // it('Add test users', async function () {
  //   // Arrange
  //   const developerEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.developer });
  //   const developerParams = developerEntity.getActionParams()

  //   const investorEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.investor });
  //   const investorParams = investorEntity.getActionParams()

  //   const fundEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.fund });
  //   const fundParams = fundEntity.getActionParams()

  //   await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })

  //   await contracts.projects.addentity(...investorParams, { authorization: `${investorParams[0]}@active` })

  //   await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })

  //   //Act 
  //   await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active` })

  //   await contracts.projects.addtestuser(investorParams[0], investorParams[1], 2, { authorization: `${investorParams[0]}@active` })

  //   await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, { authorization: `${fundParams[0]}@active` })

  //   const entitiesTable = await rpc.get_table_rows({
  //     code: projects,
  //     scope: projects,
  //     table: 'entities',
  //     json: true
  //   })
  //   console.log('\n\n Entities table : ', entitiesTable)

  //   const usersTable = await rpc.get_table_rows({
  //     code: projects,
  //     scope: projects,
  //     table: 'users',
  //     json: true
  //   })
  //   console.log('\n\n Users table : ', usersTable)

  //   // Assert
  //   expect(usersTable.rows).to.deep.include.members([{
  //     account: developerParams[0],
  //     user_name: developerParams[1],
  //     entity_id: 1,
  //     type: EntityConstants.developer
  //   }, {
  //     account: investorParams[0],
  //     user_name: investorParams[1],
  //     entity_id: 2,
  //     type: EntityConstants.investor
  //   }, {
  //     account: fundParams[0],
  //     user_name: fundParams[1],
  //     entity_id: 3,
  //     type: EntityConstants.fund
  //   }]);
  // })


  it.only("Creates a project", async function () {

    //Arrange
    const user = await UserFactory.createWithDefaults({ role: Roles.fund });
    await contracts.projects.adduser(projects, ...user.getCreateParams(), { authorization: `${projects}@active` });

    const project = await ProjectFactory.createWithDefaults({ owner: user.params.account });

    Object.assign(project.params, {
      status: 1,
      builder: '',
      investors: [],
      fund_lp: '',
      total_fund_offering_amount: '0 ',
      total_number_fund_offering: 0,
      price_per_fund_unit: '0 '
    });


    console.log(project);

    //Act
    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${user.params.account}@active` });

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })

    console.log('\n\n Projects table : ', projectsTable)

    assert.deepStrictEqual(projectsTable.rows, [{
      project_id: project.params.id,
      developer_id: 0,
      owner: project.params.owner,
      project_class: project.params.project_class,
      project_name: project.params.project_name,
      description: project.params.description,
      created_date: projectsTable.rows[0].created_date,
      status: project.params.status,
      builder: project.params.builder,
      investors: project.params.investors,
      total_project_cost: project.params.total_project_cost,
      debt_financing: project.params.debt_financing,
      term: project.params.term,
      interest_rate: project.params.interest_rate,
      loan_agreement: project.params.loan_agreement,
      total_equity_financing: project.params.total_equity_financing,
      total_gp_equity: project.params.total_gp_equity,
      private_equity: project.params.private_equity,
      annual_return: project.params.annual_return,
      project_co_lp: project.params.project_co_lp,
      project_co_lp_date: project.params.project_co_lp_date,
      projected_completion_date: project.params.projected_completion_date,
      projected_stabilization_date: project.params.projected_stabilization_date,
      anticipated_year_sale_refinance: project.params.anticipated_year_sale_refinance,
      fund_lp: project.params.fund_lp,
      total_fund_offering_amount: project.params.total_fund_offering_amount,
      total_number_fund_offering: project.params.total_number_fund_offering,
      price_per_fund_unit: project.params.price_per_fund_unit,
      approved_date: 0,
      approved_by: ''
    }
    ])

  })

  it.only('Assign builder to a project', async () => {

    //Arrange
    const project = await ProjectFactory.createWithDefaults({ owner: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [],
      fund_lp: '',
      total_fund_offering_amount: '0 ',
      total_number_fund_offering: 0,
      price_per_fund_unit: '0 '
    });

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })

    console.log('\n\n Projects table : ', projectsTable)

    assert.deepStrictEqual(projectsTable.rows, [{
      project_id: project.params.id,
      developer_id: 0,
      owner: project.params.owner,
      project_class: project.params.project_class,
      project_name: project.params.project_name,
      description: project.params.description,
      created_date: projectsTable.rows[0].created_date,
      status: project.params.status,
      builder: project.params.builder,
      investors: project.params.investors,
      total_project_cost: project.params.total_project_cost,
      debt_financing: project.params.debt_financing,
      term: project.params.term,
      interest_rate: project.params.interest_rate,
      loan_agreement: project.params.loan_agreement,
      total_equity_financing: project.params.total_equity_financing,
      total_gp_equity: project.params.total_gp_equity,
      private_equity: project.params.private_equity,
      annual_return: project.params.annual_return,
      project_co_lp: project.params.project_co_lp,
      project_co_lp_date: project.params.project_co_lp_date,
      projected_completion_date: project.params.projected_completion_date,
      projected_stabilization_date: project.params.projected_stabilization_date,
      anticipated_year_sale_refinance: project.params.anticipated_year_sale_refinance,
      fund_lp: project.params.fund_lp,
      total_fund_offering_amount: project.params.total_fund_offering_amount,
      total_number_fund_offering: project.params.total_number_fund_offering,
      price_per_fund_unit: project.params.price_per_fund_unit,
      approved_date: 0,
      approved_by: ''
    }
    ])

  });


  it.only('Assign investor to a project', async () => {

    // console.log(admin);
    // console.log(investor);
    // console.log(builder);

    //Arrange
    const project = await ProjectFactory.createWithDefaults({ owner: admin.params.account });
    project.params.status = 1;
    project.params.builder = '';
    project.params.investors = [];
    project.params.fund_lp = '';
    project.params.total_fund_offering_amount = '0 ';
    project.params.total_number_fund_offering = 0;
    project.params.price_per_fund_unit = '0 ';

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: '',
      investors: [investor.params.account],
      fund_lp: '',
      total_fund_offering_amount: '0 ',
      total_number_fund_offering: 0,
      price_per_fund_unit: '0 '
    });

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })

    console.log('\n\n Projects table : ', projectsTable)

    assert.deepStrictEqual(projectsTable.rows, [{
      project_id: project.params.id,
      developer_id: 0,
      owner: project.params.owner,
      project_class: project.params.project_class,
      project_name: project.params.project_name,
      description: project.params.description,
      created_date: projectsTable.rows[0].created_date,
      status: project.params.status,
      builder: project.params.builder,
      investors: project.params.investors,
      total_project_cost: project.params.total_project_cost,
      debt_financing: project.params.debt_financing,
      term: project.params.term,
      interest_rate: project.params.interest_rate,
      loan_agreement: project.params.loan_agreement,
      total_equity_financing: project.params.total_equity_financing,
      total_gp_equity: project.params.total_gp_equity,
      private_equity: project.params.private_equity,
      annual_return: project.params.annual_return,
      project_co_lp: project.params.project_co_lp,
      project_co_lp_date: project.params.project_co_lp_date,
      projected_completion_date: project.params.projected_completion_date,
      projected_stabilization_date: project.params.projected_stabilization_date,
      anticipated_year_sale_refinance: project.params.anticipated_year_sale_refinance,
      fund_lp: project.params.fund_lp,
      total_fund_offering_amount: project.params.total_fund_offering_amount,
      total_number_fund_offering: project.params.total_number_fund_offering,
      price_per_fund_unit: project.params.price_per_fund_unit,
      approved_date: 0,
      approved_by: ''
    }
    ])

  });

  it.only('Approve project', async () => {

    //Arrange
    const project = await ProjectFactory.createWithDefaults({ owner: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })

    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD"
    });

    console.log(project)
    // Act

    /*
    *ACTION projects::approveprjct(name actor,
    *															uint64_t project_id,
    *															string fund_lp,
    *															asset total_fund_offering_amount,
    *															uint64_t total_number_fund_offering,
    *															asset price_per_fund_unit)
    */
    await contracts.projects.approveprjct(admin.params.account, ...project.getApproveActionParams(), { authorization: `${admin.params.account}@active` });

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })


    console.log('\n\n Projects table : ', projectsTable)

  });

  it('Approve a project', async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.developer });
    const developerParams = developerEntity.getActionParams()

    const fundEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.fund });
    const fundParams = fundEntity.getActionParams()

    await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 2, { authorization: `${fundParams[0]}@active` })

    const newProject = await ProjectFactory.createWithDefaults({ actor: developerParams[0] });
    const projectParams = newProject.getActionParams()

    await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active` })


    //Act
    await ProjectUtil.approveprjct({
      actor: fundParams[0],
      project_id: 0,
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD",
      contract: contracts.projects,
      account: fundParams[0]
    })


    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })
    console.log('\n\n Projects table is: ', projectsTable)

    assert.deepStrictEqual(projectsTable.rows, [{
      project_id: 0,
      developer_id: 0,
      owner: projectParams[0],
      project_class: 'NNN',
      project_name: projectParams[2],
      description: 'This is a default project',
      created_date: projectsTable.rows[0].created_date,
      status: 2,
      total_project_cost: '435000.00 USD',
      debt_financing: '2000.00 USD',
      term: 2,
      interest_rate: 25,
      loan_agreement: 'https://loan-agreement.com',
      total_equity_financing: '3000.00 USD',
      total_gp_equity: '2100.00 USD',
      private_equity: '5000.00 USD',
      annual_return: 600,
      project_co_lp: 'https://project-co-lp.com',
      project_co_lp_date: 1583864481,
      projected_completion_date: 1682400175,
      projected_stabilization_date: 1714022575,
      anticipated_year_sale_refinance: 2023,
      fund_lp: projectsTable.rows[0].fund_lp,
      total_fund_offering_amount: projectsTable.rows[0].total_fund_offering_amount,
      total_number_fund_offering: projectsTable.rows[0].total_number_fund_offering,
      price_per_fund_unit: projectsTable.rows[0].price_per_fund_unit,
      approved_date: projectsTable.rows[0].approved_date,
      approved_by: projectsTable.rows[0].approved_by
    }
    ])

  })


  it('Edits description of project with project_id: 0', async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.developer });
    const developerParams = developerEntity.getActionParams()

    const fundEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.fund });
    const fundParams = fundEntity.getActionParams()


    await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 2, { authorization: `${fundParams[0]}@active` })

    const newProject = await ProjectFactory.createWithDefaults({ actor: developerParams[0] });
    const projectParams = newProject.getActionParams()

    await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active` })

    //Act
    await ProjectUtil.editproject({
      actor: projectParams[0],
      project_id: 0,
      project_class: projectParams[1],
      project_name: projectParams[2],
      description: 'Description modified',
      total_project_cost: projectParams[4],
      debt_financing: projectParams[5],
      term: projectParams[6],
      interest_rate: projectParams[7],
      loan_agreement: projectParams[8],
      total_equity_financing: projectParams[9],
      total_gp_equity: projectParams[10],
      private_equity: projectParams[11],
      annual_return: projectParams[12],
      project_co_lp: projectParams[13],
      project_co_lp_date: projectParams[14],
      projected_completion_date: projectParams[15],
      projected_stabilization_date: projectParams[16],
      anticipated_year_sale_refinance: projectParams[17],
      contract: contracts.projects,
      account: projectParams[0]
    })

    await ProjectUtil.approveprjct({
      actor: fundParams[0],
      project_id: 0,
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD",
      contract: contracts.projects,
      account: fundParams[0]
    })

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })
    console.log('\n\n Projects table is: ', projectsTable)

    assert.deepStrictEqual(projectsTable.rows, [{
      project_id: 0,
      developer_id: 0,
      owner: projectParams[0],
      project_class: 'NNN',
      project_name: projectParams[2],
      description: 'Description modified',
      created_date: projectsTable.rows[0].created_date,
      status: 2,
      total_project_cost: '435000.00 USD',
      debt_financing: '2000.00 USD',
      term: 2,
      interest_rate: 25,
      loan_agreement: 'https://loan-agreement.com',
      total_equity_financing: '3000.00 USD',
      total_gp_equity: '2100.00 USD',
      private_equity: '5000.00 USD',
      annual_return: 600,
      project_co_lp: 'https://project-co-lp.com',
      project_co_lp_date: 1583864481,
      projected_completion_date: 1682400175,
      projected_stabilization_date: 1714022575,
      anticipated_year_sale_refinance: 2023,
      fund_lp: projectsTable.rows[0].fund_lp,
      total_fund_offering_amount: projectsTable.rows[0].total_fund_offering_amount,
      total_number_fund_offering: projectsTable.rows[0].total_number_fund_offering,
      price_per_fund_unit: projectsTable.rows[0].price_per_fund_unit,
      approved_date: projectsTable.rows[0].approved_date,
      approved_by: projectsTable.rows[0].approved_by
    }
    ])

  })

  it('Deletes a project', async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.developer });
    const developerParams = developerEntity.getActionParams()

    const fundEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.fund });
    const fundParams = fundEntity.getActionParams()

    await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 2, { authorization: `${fundParams[0]}@active` })

    const newProject = await ProjectFactory.createWithDefaults({ actor: developerParams[0] });
    const projectParams = newProject.getActionParams()

    await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active` })

    //Act
    await ProjectUtil.deleteprojct({
      actor: developerParams[0],
      project_id: 0,
      contract: contracts.projects,
      account: projectParams[0]
    })

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })
    console.log('\n\n Projects table is: ', projectsTable)

    assert.deepStrictEqual(projectsTable.rows, [])


  })

  it('Change status', async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.developer });
    const developerParams = developerEntity.getActionParams()

    const fundEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.fund });
    const fundParams = fundEntity.getActionParams()

    await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 2, { authorization: `${fundParams[0]}@active` })

    const newProject = await ProjectFactory.createWithDefaults({ actor: developerParams[0] });
    const projectParams = newProject.getActionParams()

    await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active` })

    //Act
    //change status to completed
    await ProjectUtil.changestatus({
      project_id: 0,
      status: ProjectConstants.status.completed,
      contract: contracts.projects,
      account: projects
    })
    //await contracts.projects.changestatus(0, ProjectConstants.status.completed, { authorization: `${projects}@active`})


    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })
    console.log('\n\n Projects table is: ', projectsTable)

    assert.deepStrictEqual(projectsTable.rows, [{
      project_id: 0,
      developer_id: 0,
      owner: projectParams[0],
      project_class: 'NNN',
      project_name: projectParams[2],
      description: 'This is a default project',
      created_date: projectsTable.rows[0].created_date,
      status: 4,
      total_project_cost: '435000.00 USD',
      debt_financing: '2000.00 USD',
      term: 2,
      interest_rate: 25,
      loan_agreement: 'https://loan-agreement.com',
      total_equity_financing: '3000.00 USD',
      total_gp_equity: '2100.00 USD',
      private_equity: '5000.00 USD',
      annual_return: 600,
      project_co_lp: 'https://project-co-lp.com',
      project_co_lp_date: 1583864481,
      projected_completion_date: 1682400175,
      projected_stabilization_date: 1714022575,
      anticipated_year_sale_refinance: 2023,
      fund_lp: '',
      total_fund_offering_amount: '0 ',
      total_number_fund_offering: 0,
      price_per_fund_unit: '0 ',
      approved_date: 0,
      approved_by: ''
    }])

  })


  it('Create an investment', async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.developer });
    const developerParams = developerEntity.getActionParams()

    const investorEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.investor });
    const investorParams = investorEntity.getActionParams()

    const fundEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.fund });
    const fundParams = fundEntity.getActionParams()

    await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addentity(...investorParams, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addtestuser(investorParams[0], investorParams[1], 2, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, { authorization: `${fundParams[0]}@active` })

    const newProject = await ProjectFactory.createWithDefaults({ actor: developerParams[0] });
    const projectParams = newProject.getActionParams()

    await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active` })
    await ProjectUtil.approveprjct({
      actor: fundParams[0],
      project_id: 0,
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD",
      contract: contracts.projects,
      account: fundParams[0]
    })

    //Act
    await ProjectUtil.invest({
      actor: investorParams[0],
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: 'subscription package',
      contract: contracts.projects,
      account: investorParams[0]
    })

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })
    console.log('\n\n Projects table is: ', projectsTable)

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n investments table is: ', investTable)

    assert.deepStrictEqual(investTable.rows, [{
      investment_id: 0,
      user: investorParams[0],
      project_id: 0,
      total_investment_amount: '5000000.00 USD',
      quantity_units_purchased: 20,
      annual_preferred_return: 500,
      signed_agreement_date: 1666675375,
      total_confirmed_transfered_amount: '0.00 USD',
      total_unconfirmed_transfered_amount: '0.00 USD',
      total_confirmed_transfers: 0,
      total_unconfirmed_transfers: 0,
      subscription_package: 'subscription package',
      status: ProjectConstants.investment.pending,
      approved_by: '',
      approved_date: 0,
      investment_date: investTable.rows[0].investment_date
    }])

  })

  it('Modify an investment', async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.developer });
    const developerParams = developerEntity.getActionParams()

    const investorEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.investor });
    const investorParams = investorEntity.getActionParams()

    const fundEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.fund });
    const fundParams = fundEntity.getActionParams()

    await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addentity(...investorParams, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addtestuser(investorParams[0], investorParams[1], 2, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, { authorization: `${fundParams[0]}@active` })

    const newProject = await ProjectFactory.createWithDefaults({ actor: developerParams[0] });
    const projectParams = newProject.getActionParams()

    await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active` })
    const approveParameters = [fundParams[0], 0, "https://fund-lp.com", "400000.00 USD", 40000, "300.00 USD"]
    await contracts.projects.approveprjct(...approveParameters, { authorization: `${fundParams[0]}@active` });

    const investParameters = [
      investorParams[0],
      0,
      "5000000.00 USD",
      "20",
      "500",
      1666675375,
      'subscription package'
    ]

    const editInvestParameters = [
      investorParams[0],
      0,
      "5000000.00 USD",
      "20",
      "500",
      1666675375,
      'subscription package modified'
    ]
    await contracts.projects.invest(...investParameters, { authorization: `${investorParams[0]}@active` })

    //Act 
    await contracts.projects.editinvest(...editInvestParameters, { authorization: `${investorParams[0]}@active` })


    //Assert
    // const projectsTable = await rpc.get_table_rows({
    //   code: projects,
    //   scope: projects,
    //   table: 'projects',
    //   json: true
    // })
    // console.log('\n\n Projects table is: ', projectsTable)

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n investments table is: ', investTable)

    assert.deepStrictEqual(investTable.rows, [{
      investment_id: 0,
      user: investParameters[0],
      project_id: 0,
      total_investment_amount: '5000000.00 USD',
      quantity_units_purchased: 20,
      annual_preferred_return: 500,
      signed_agreement_date: 1666675375,
      total_confirmed_transfered_amount: '0.00 USD',
      total_unconfirmed_transfered_amount: '0.00 USD',
      total_confirmed_transfers: 0,
      total_unconfirmed_transfers: 0,
      subscription_package: 'subscription package modified',
      status: ProjectConstants.investment.pending,
      approved_by: '',
      approved_date: 0,
      investment_date: investTable.rows[0].investment_date
    }])

  })

  it('Delete an investment', async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.developer });
    const developerParams = developerEntity.getActionParams()

    const investorEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.investor });
    const investorParams = investorEntity.getActionParams()

    const fundEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.fund });
    const fundParams = fundEntity.getActionParams()

    await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addentity(...investorParams, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addtestuser(investorParams[0], investorParams[1], 2, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, { authorization: `${fundParams[0]}@active` })

    const newProject = await ProjectFactory.createWithDefaults({ actor: developerParams[0] });
    const projectParams = newProject.getActionParams()

    await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active` })
    const approveParameters = [fundParams[0], 0, "https://fund-lp.com", "400000.00 USD", 40000, "300.00 USD"]
    await contracts.projects.approveprjct(...approveParameters, { authorization: `${fundParams[0]}@active` });

    const investParameters = [
      investorParams[0],
      0,
      "5000000.00 USD",
      "20",
      "500",
      1666675375,
      'subscription package'
    ]

    await contracts.projects.invest(...investParameters, { authorization: `${investorParams[0]}@active` })

    //Act 
    await contracts.projects.deleteinvest(investorParams[0], 0, { authorization: `${investorParams[0]}@active` })


    //Assert
    // const projectsTable = await rpc.get_table_rows({
    //   code: projects,
    //   scope: projects,
    //   table: 'projects',
    //   json: true
    // })
    // console.log('\n\n Projects table is: ', projectsTable)

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n investments table is: ', investTable)

    assert.deepStrictEqual(investTable.rows, [])

  })

  it('Approve an investment', async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.developer });
    const developerParams = developerEntity.getActionParams()

    const investorEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.investor });
    const investorParams = investorEntity.getActionParams()
    console.log('investor is:', investorParams[0])

    const fundEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.fund });
    const fundParams = fundEntity.getActionParams()

    await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addentity(...investorParams, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addtestuser(investorParams[0], investorParams[1], 2, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, { authorization: `${fundParams[0]}@active` })

    const newProject = await ProjectFactory.createWithDefaults({ actor: developerParams[0] });
    const projectParams = newProject.getActionParams()

    await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active` })
    const approveParameters = [fundParams[0], 0, "https://fund-lp.com", "400000.00 USD", 40000, "300.00 USD"]
    await contracts.projects.approveprjct(...approveParameters, { authorization: `${fundParams[0]}@active` });

    const investParameters = [
      investorParams[0],
      0,
      "5000000.00 USD",
      "20",
      "500",
      1666675375,
      'subscription package'
    ]
    await contracts.projects.invest(...investParameters, { authorization: `${investorParams[0]}@active` })

    //Act
    await contracts.projects.approveinvst(fundParams[0], 0, { authorization: `${fundParams[0]}@active` })

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })
    console.log('\n\n Projects table is: ', projectsTable)

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n investments table is: ', investTable)

    assert.deepStrictEqual(investTable.rows, [{
      investment_id: 0,
      user: investParameters[0],
      project_id: 0,
      total_investment_amount: '5000000.00 USD',
      quantity_units_purchased: 20,
      annual_preferred_return: 500,
      signed_agreement_date: 1666675375,
      total_confirmed_transfered_amount: '0.00 USD',
      total_unconfirmed_transfered_amount: '0.00 USD',
      total_confirmed_transfers: 0,
      total_unconfirmed_transfers: 0,
      subscription_package: 'subscription package',
      status: ProjectConstants.investment.funding,
      approved_by: fundParams[0],
      approved_date: investTable.rows[0].approved_date,
      investment_date: investTable.rows[0].investment_date
    }])

  })

  it('Make a transfer', async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.developer });
    const developerParams = developerEntity.getActionParams()

    const investorEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.investor });
    const investorParams = investorEntity.getActionParams()

    const fundEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.fund });
    const fundParams = fundEntity.getActionParams()

    await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addentity(...investorParams, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addtestuser(investorParams[0], investorParams[1], 2, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, { authorization: `${fundParams[0]}@active` })

    const newProject = await ProjectFactory.createWithDefaults({ actor: developerParams[0] });
    const projectParams = newProject.getActionParams()

    await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active` })
    const approveParameters = [fundParams[0], 0, "https://fund-lp.com", "400000.00 USD", 40000, "300.00 USD"]
    await contracts.projects.approveprjct(...approveParameters, { authorization: `${fundParams[0]}@active` });


    const investParameters = [
      investorParams[0],
      0,
      "5000000.00 USD",
      "20",
      "500",
      1666675375,
      'subscription package'
    ]
    await contracts.projects.invest(...investParameters, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.approveinvst(fundParams[0], 0, { authorization: `${fundParams[0]}@active` })

    //Act
    const transferParameters = [
      investorParams[0],
      "5000.00 USD",
      0,
      "Transfer done",
      Date.now()
    ]
    await contracts.projects.maketransfer(...transferParameters, { authorization: `${investorParams[0]}@active` })


    //Assert
    const transfersTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'transfers',
      json: true
    })
    console.log('\n\n transfers table is: ', transfersTable)

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n investments table is: ', investTable)

    assert.deepStrictEqual(transfersTable.rows, [{
      fund_transfer_id: 0,
      proof_of_transfer: transferParameters[3],
      amount: transferParameters[1],
      investment_id: 0,
      user: investorParams[0],
      status: 1,
      transfer_date: transfersTable.rows[0].transfer_date,
      updated_date: transfersTable.rows[0].updated_date,
      confirmed_date: 0,
      confirmed_by: ''
    }])

    assert.deepStrictEqual(investTable.rows, [{
      investment_id: 0,
      user: investParameters[0],
      project_id: 0,
      total_investment_amount: '5000000.00 USD',
      quantity_units_purchased: 20,
      annual_preferred_return: 500,
      signed_agreement_date: 1666675375,
      total_confirmed_transfered_amount: "0.00 USD",
      total_unconfirmed_transfered_amount: transferParameters[1],
      total_confirmed_transfers: 0,
      total_unconfirmed_transfers: 1,
      subscription_package: 'subscription package',
      status: ProjectConstants.investment.funding,
      approved_by: fundParams[0],
      approved_date: investTable.rows[0].approved_date,
      investment_date: investTable.rows[0].investment_date
    }])

  })

  it('Edit a transfer', async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.developer });
    const developerParams = developerEntity.getActionParams()

    const investorEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.investor });
    const investorParams = investorEntity.getActionParams()

    const fundEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.fund });
    const fundParams = fundEntity.getActionParams()

    await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addentity(...investorParams, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addtestuser(investorParams[0], investorParams[1], 2, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, { authorization: `${fundParams[0]}@active` })

    const newProject = await ProjectFactory.createWithDefaults({ actor: developerParams[0] });
    const projectParams = newProject.getActionParams()

    await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active` })
    const approveParameters = [fundParams[0], 0, "https://fund-lp.com", "400000.00 USD", 40000, "300.00 USD"]
    await contracts.projects.approveprjct(...approveParameters, { authorization: `${fundParams[0]}@active` });


    const investParameters = [
      investorParams[0],
      0,
      "5000000.00 USD",
      "20",
      "500",
      1666675375,
      'subscription package'
    ]
    await contracts.projects.invest(...investParameters, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.approveinvst(fundParams[0], 0, { authorization: `${fundParams[0]}@active` })


    const transferParameters = [
      investorParams[0],
      "5000.00 USD",
      0,
      "Transfer done",
      Date.now()
    ]
    await contracts.projects.maketransfer(...transferParameters, { authorization: `${investorParams[0]}@active` })

    //Act
    const editTransferParameters = [
      investorParams[0],
      0,
      "5000.00 USD",
      "Transfer done modified",
      Date.now() + 5000
    ]
    await contracts.projects.edittransfer(...editTransferParameters, { authorization: `${investorParams[0]}@active` })

    //Assert
    const transfersTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'transfers',
      json: true
    })
    console.log('\n\n transfers table is: ', transfersTable)

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n investments table is: ', investTable)

    assert.deepStrictEqual(transfersTable.rows, [{
      fund_transfer_id: 0,
      proof_of_transfer: editTransferParameters[3],
      amount: editTransferParameters[2],
      investment_id: 0,
      user: investorParams[0],
      status: 1,
      transfer_date: transfersTable.rows[0].transfer_date,
      updated_date: transfersTable.rows[0].updated_date,
      confirmed_date: 0,
      confirmed_by: ''
    }])

    assert.deepStrictEqual(investTable.rows, [{
      investment_id: 0,
      user: investParameters[0],
      project_id: 0,
      total_investment_amount: '5000000.00 USD',
      quantity_units_purchased: 20,
      annual_preferred_return: 500,
      signed_agreement_date: 1666675375,
      total_confirmed_transfered_amount: "0.00 USD",
      total_unconfirmed_transfered_amount: transferParameters[1],
      total_confirmed_transfers: 0,
      total_unconfirmed_transfers: 1,
      subscription_package: 'subscription package',
      status: ProjectConstants.investment.funding,
      approved_by: fundParams[0],
      approved_date: investTable.rows[0].approved_date,
      investment_date: investTable.rows[0].investment_date
    }])

  })

  it('Confirm a transfer', async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.developer });
    const developerParams = developerEntity.getActionParams()

    const investorEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.investor });
    const investorParams = investorEntity.getActionParams()

    const fundEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.fund });
    const fundParams = fundEntity.getActionParams()

    await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addentity(...investorParams, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addtestuser(investorParams[0], investorParams[1], 2, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, { authorization: `${fundParams[0]}@active` })

    const newProject = await ProjectFactory.createWithDefaults({ actor: developerParams[0] });
    const projectParams = newProject.getActionParams()

    await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active` })
    const approveParameters = [fundParams[0], 0, "https://fund-lp.com", "400000.00 USD", 40000, "300.00 USD"]
    await contracts.projects.approveprjct(...approveParameters, { authorization: `${fundParams[0]}@active` });


    const investParameters = [
      investorParams[0],
      0,
      "5000000.00 USD",
      "20",
      "500",
      1666675375,
      'subscription package'
    ]
    await contracts.projects.invest(...investParameters, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.approveinvst(fundParams[0], 0, { authorization: `${fundParams[0]}@active` })


    const transferParameters = [
      investorParams[0],
      "5000.00 USD",
      0,
      "Transfer done",
      Date.now()
    ]
    await contracts.projects.maketransfer(...transferParameters, { authorization: `${investorParams[0]}@active` })

    //Act
    const confirmTransferParameters = [
      fundParams[0],
      0,
      "Transfer confirmed",
    ]
    await contracts.projects.confrmtrnsfr(...confirmTransferParameters, { authorization: `${fundParams[0]}@active` })

    //Assert
    const transfersTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'transfers',
      json: true
    })
    console.log('\n\n transfers table is: ', transfersTable)

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n investments table is: ', investTable)

    assert.deepStrictEqual(transfersTable.rows, [{
      fund_transfer_id: 0,
      proof_of_transfer: confirmTransferParameters[2],
      amount: transferParameters[1],
      investment_id: 0,
      user: investorParams[0],
      status: ProjectConstants.transfer.confirmed,
      transfer_date: transfersTable.rows[0].transfer_date,
      updated_date: transfersTable.rows[0].updated_date,
      confirmed_date: transfersTable.rows[0].confirmed_date,
      confirmed_by: fundParams[0]
    }])

    assert.deepStrictEqual(investTable.rows, [{
      investment_id: 0,
      user: investParameters[0],
      project_id: 0,
      total_investment_amount: '5000000.00 USD',
      quantity_units_purchased: 20,
      annual_preferred_return: 500,
      signed_agreement_date: 1666675375,
      total_confirmed_transfered_amount: transferParameters[1],
      total_unconfirmed_transfered_amount: "0.00 USD",
      total_confirmed_transfers: 1,
      total_unconfirmed_transfers: 0,
      subscription_package: 'subscription package',
      status: ProjectConstants.investment.funding,
      approved_by: fundParams[0],
      approved_date: investTable.rows[0].approved_date,
      investment_date: investTable.rows[0].investment_date
    }])

  })

  it('Delete a transfer', async function () {
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.developer });
    const developerParams = developerEntity.getActionParams()

    const investorEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.investor });
    const investorParams = investorEntity.getActionParams()

    const fundEntity = await EntityFactory.createWithDefaults({ type: EntityConstants.fund });
    const fundParams = fundEntity.getActionParams()

    await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active` })
    await contracts.projects.addentity(...investorParams, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addtestuser(investorParams[0], investorParams[1], 2, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active` })
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, { authorization: `${fundParams[0]}@active` })

    const newProject = await ProjectFactory.createWithDefaults({ actor: developerParams[0] });
    const projectParams = newProject.getActionParams()

    await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active` })
    const approveParameters = [fundParams[0], 0, "https://fund-lp.com", "400000.00 USD", 40000, "300.00 USD"]
    await contracts.projects.approveprjct(...approveParameters, { authorization: `${fundParams[0]}@active` });


    const investParameters = [
      investorParams[0],
      0,
      "5000000.00 USD",
      "20",
      "500",
      1666675375,
      'subscription package'
    ]
    await contracts.projects.invest(...investParameters, { authorization: `${investorParams[0]}@active` })
    await contracts.projects.approveinvst(fundParams[0], 0, { authorization: `${fundParams[0]}@active` })


    const transferParameters = [
      investorParams[0],
      "5000.00 USD",
      0,
      "Transfer done",
      Date.now()
    ]
    await contracts.projects.maketransfer(...transferParameters, { authorization: `${investorParams[0]}@active` })

    //Act
    await contracts.projects.deletetrnsfr(investorParams[0], 0, { authorization: `${investorParams[0]}@active` })

    //Assert
    const transfersTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'transfers',
      json: true
    })
    console.log('\n\n transfers table is: ', transfersTable)

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n investments table is: ', investTable)

    assert.deepStrictEqual(transfersTable.rows, [])

    assert.deepStrictEqual(investTable.rows, [{
      investment_id: 0,
      user: investParameters[0],
      project_id: 0,
      total_investment_amount: '5000000.00 USD',
      quantity_units_purchased: 20,
      annual_preferred_return: 500,
      signed_agreement_date: 1666675375,
      total_confirmed_transfered_amount: "0.00 USD",
      total_unconfirmed_transfered_amount: "0.00 USD",
      total_confirmed_transfers: 0,
      total_unconfirmed_transfers: 0,
      subscription_package: 'subscription package',
      status: ProjectConstants.investment.funding,
      approved_by: fundParams[0],
      approved_date: investTable.rows[0].approved_date,
      investment_date: investTable.rows[0].investment_date
    }])

  })


})