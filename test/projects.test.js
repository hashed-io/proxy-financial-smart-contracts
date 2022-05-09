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

const { projects, accounts, budgets, permissions, transactions } = contractNames


describe('Tests for projects smart contract', async function () {

  let contracts, admin, builder, investor
  let fail

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
    await contracts.accounts.init({ authorization: `${accounts}@active` });

    admin = await UserFactory.createWithDefaults({ role: Roles.fund, account: 'proxyadmin11', user_name: 'Admin', entity_id: 1 });
    investor = await UserFactory.createWithDefaults({ role: Roles.investor, account: 'investoruser', user_name: 'Investor', entity_id: 2 });
    builder = await UserFactory.createWithDefaults({ role: Roles.builder, account: 'builderuser1', user_name: 'Builder', entity_id: 3 });
    issuer = await UserFactory.createWithDefaults({ role: Roles.issuer, account: 'issueruser1', user_name: 'Issuer', entity_id: 4 });
    regional = await UserFactory.createWithDefaults({ role: Roles.regional_center, account: 'regionalcntr', user_name: 'Regional Center', entity_id: 5 });

    await EnvironmentUtil.createAccount('proxyadmin11');
    await EnvironmentUtil.createAccount('investoruser');
    await EnvironmentUtil.createAccount('builderuser1');
    await EnvironmentUtil.createAccount('issueruser1');
    await EnvironmentUtil.createAccount('regionalcntr');


  })

  afterEach(async function () {
    await EnvironmentUtil.killNode()

  })


  


  it("Creates a project", async function () {

    //Arrange
    const user = await UserFactory.createWithDefaults({ role: Roles.fund });
    await contracts.projects.adduser(projects, ...user.getCreateParams(), { authorization: `${projects}@active` });

    const project = await ProjectFactory.createWithDefaults({ actor: user.params.account });
    //console.log(project);

    Object.assign(project.params, {
      status: 1,
      builder: '',
      investors: [],
      issuer: '',
      regional_center: '',
      fund_lp: '',
      total_fund_offering_amount: '0 ',
      total_number_fund_offering: 0,
      price_per_fund_unit: '0 '
    });


    //console.log(project);

    // //Act
    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${user.params.account}@active` });

    // //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })

    console.log('\n\n Projects  table : ', projectsTable.rows)
    console.log('params project is :', project.params )

    assert.deepStrictEqual(projectsTable.rows, [{
      project_id: projectsTable.rows[0].project_id,
      developer_id: 0,
      owner: project.params.actor,
      project_class: project.params.project_class,
      project_name: project.params.project_name,
      description: project.params.description,
      created_date: projectsTable.rows[0].created_date,
      status: project.params.status,
      builder: project.params.builder,
      investors: project.params.investors,
      issuer: project.params.issuer,
      regional_center: project.params.regional_center,
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

  it.only('Assign builder to a project', async () => {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })    

    Object.assign(project.params, {
      status: 1,
      builder: '',
      investors: [],
      issuer: '',
      regional_center:'',
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
      project_id: projectsTable.rows[0].project_id,
      developer_id: 0,
      owner: project.params.actor,
      project_class: project.params.project_class,
      project_name: project.params.project_name,
      description: project.params.description,
      created_date: projectsTable.rows[0].created_date,
      status: project.params.status,
      builder: builder.params.account,
      investors: project.params.investors,
      issuer: project.params.issuer,
      regional_center: project.params.regional_center,
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


  it('Assign one of each type (Investor, Builder, Regional Center, Issuer)', async () => {
    console.log('hello')
    // console.log(admin);
    // console.log(investor);
    // console.log(builder);
    // console.log(issuer)
    // console.log(regional)

    //Arrange
    const project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })

    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    await contracts.projects.assignuser(admin.params.account, issuer.params.account, 0, { authorization: `${admin.params.account}@active` })

    await contracts.projects.assignuser(admin.params.account, regional.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: issuer.params.account,
      regional_center: regional.params.account,
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

    console.log('\n\n Projects table : ' , projectsTable)

    assert.deepStrictEqual(projectsTable.rows, [{
      project_id: 0,
      developer_id: 0,
      owner: project.params.actor,
      project_class: project.params.project_class,
      project_name: project.params.project_name,
      description: project.params.description,
      created_date: projectsTable.rows[0].created_date,
      status: project.params.status,
      builder: project.params.builder,
      investors: project.params.investors,
      issuer: project.params.issuer,
      regional_center: project.params.regional_center,
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

  it('Approve project', async () => {

    //Arrange
    const project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })

    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: '',
      regional_center: '',
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD"
    });

    // Act

    /*
    *ACTION projects::approveprjct(name actor,
    *															uint64_t project_id,
    *															string fund_lp,
    *															asset total_fund_offering_amount,
    *															uint64_t total_number_fund_offering,
    *															asset price_per_fund_unit)
    */
    await contracts.projects.approveprjct(admin.params.account, 0, ...project.getApproveActionParams(), { authorization: `${admin.params.account}@active` });

    // //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })
    console.log('\n\n Projects table : ', projectsTable.rows)

    assert.deepStrictEqual(projectsTable.rows, [{
      project_id: 0,
      developer_id: 0,
      owner: project.params.actor,
      project_class: project.params.project_class,
      project_name: project.params.project_name,
      description: project.params.description,
      created_date: projectsTable.rows[0].created_date,
      status: ProjectConstants.status.ready,
      builder: project.params.builder,
      investors: project.params.investors,
      issuer: project.params.issuer,
      regional_center: project.params.regional_center,
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
      approved_date: projectsTable.rows[0].approved_date,
      approved_by: projectsTable.rows[0].approved_by
    }
    ])

  });


  it('Edits description of project with project_id: 0', async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })

    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: '',
      regional_center: '',
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD"
    });

    // Act
    Object.assign(project.params, {
      description: 'Desctiption edited'
    })
    await contracts.projects.editproject(admin.params.account, 0, ...project.getEditActionParams(), { authorization: `${admin.params.account}@active` });


    // //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })
    console.log('\n\n Projects table : ', projectsTable.rows)

    assert.deepStrictEqual(projectsTable.rows, [{
      project_id: 0,
      developer_id: 0,
      owner: project.params.actor,
      project_class: project.params.project_class,
      project_name: project.params.project_name,
      description: 'Desctiption edited',
      created_date: projectsTable.rows[0].created_date,
      status: ProjectConstants.status.awaiting,
      builder: project.params.builder,
      investors: project.params.investors,
      issuer: project.params.issuer,
      regional_center: project.params.regional_center,
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
      fund_lp: '',
      total_fund_offering_amount: projectsTable.rows[0].total_fund_offering_amount,
      total_number_fund_offering: projectsTable.rows[0].total_number_fund_offering,
      price_per_fund_unit: projectsTable.rows[0].price_per_fund_unit,
      approved_date: projectsTable.rows[0].approved_date,
      approved_by: projectsTable.rows[0].approved_by
    }
    ])
  });

  it('Cannot edit a project when has been approved', async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });

    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })

    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: '',
      regional_center: '',
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD"
    });

    await contracts.projects.approveprjct(admin.params.account, 0, ...project.getApproveActionParams(), { authorization: `${admin.params.account}@active` });

    // Act
    Object.assign(project.params, {
      description: 'Desctiption edited'
    })
    try { 
      await contracts.projects.editproject(admin.params.account, 0, ...project.getEditActionParams(), { authorization: `${admin.params.account}@active` });
      fail = false
    } catch (err) {
      fail = true
      console.log(err)
    }

    // //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })
    console.log('\n\n Projects table : ', projectsTable.rows)

    expect(fail).to.be.true

  });

  it('Cannot delete a project when has been approved', async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })
    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: '',
      regional_center: '',
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD"
    });

    await contracts.projects.approveprjct(admin.params.account, 0, ...project.getApproveActionParams(), { authorization: `${admin.params.account}@active` });

    // Act
    try { 
      await contracts.projects.deleteprojct(admin.params.account, 0, { authorization: `${admin.params.account}@active` });
      fail = false
    } catch (err) {
      fail = true
      console.log(err)
    }

    // //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })
    console.log('\n\n Projects table : ', projectsTable.rows)

    expect(fail).to.be.true

  });

  it('Change project status', async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })
    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: '',
      regional_center: '',
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD"
    });

    await contracts.projects.approveprjct(admin.params.account, 0, ...project.getApproveActionParams(), { authorization: `${admin.params.account}@active` });
    
    //Act
    await contracts.projects.changestatus(0, ProjectConstants.status.investment, { authorization: `${projects}@active` });


    // //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })
    console.log('\n\n Projects table : ', projectsTable.rows)

    assert.deepStrictEqual(projectsTable.rows, [{
      project_id: 0,
      developer_id: 0,
      owner: project.params.actor,
      project_class: project.params.project_class,
      project_name: project.params.project_name,
      description: project.params.description,
      created_date: projectsTable.rows[0].created_date,
      status: ProjectConstants.status.investment,
      builder: project.params.builder,
      investors: project.params.investors,
      issuer: project.params.issuer,
      regional_center: project.params.regional_center,
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
      approved_date: projectsTable.rows[0].approved_date,
      approved_by: projectsTable.rows[0].approved_by
    }
    ])

  });


  it('Create an investment', async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })
    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: '',
      regional_center: '',
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD"
    });

    await contracts.projects.approveprjct(admin.params.account, 0, ...project.getApproveActionParams(), { authorization: `${admin.params.account}@active` });
    
    //Act
    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: 'subscription package',
      contract: contracts.projects,
      account: investor.params.account
    })


    // //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })
    console.log('\n\n Projects table : ', projectsTable.rows)

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n investments table is: ', investTable)

    assert.deepStrictEqual(investTable.rows, [{
      investment_id: 0,
      user: investor.params.account,
      project_id: 0,
      total_investment_amount: '5000000.00 USD',
      quantity_units_purchased: 20,
      annual_preferred_return: 500,
      signed_agreement_date: 1666675375,
      total_confirmed_transferred_amount: "0.00 USD",
      total_unconfirmed_transferred_amount: "0.00 USD",
      total_confirmed_transfers: 0,
      total_unconfirmed_transfers: 0,
      subscription_package: 'subscription package',
      status: ProjectConstants.investment.pending,
      approved_by: '',
      approved_date: 0,
      investment_date: investTable.rows[0].investment_date
    }])


  });

  it('Modify an investment', async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })
    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: '',
      regional_center: '',
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD"
    });

    await contracts.projects.approveprjct(admin.params.account, 0, ...project.getApproveActionParams(), { authorization: `${admin.params.account}@active` });
    
    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: 'subscription package',
      contract: contracts.projects,
      account: investor.params.account
    })
    
    //Act
    await ProjectUtil.editinvest({
      actor: investor.params.account,
      investment_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: 'subscription package modified',
      contract: contracts.projects,
      account: investor.params.account
    })


    // //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })
    console.log('\n\n Projects table : ', projectsTable.rows)

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n investments table is: ', investTable)

    assert.deepStrictEqual(investTable.rows, [{
      investment_id: 0,
      user: investor.params.account,
      project_id: 0,
      total_investment_amount: '5000000.00 USD',
      quantity_units_purchased: 20,
      annual_preferred_return: 500,
      signed_agreement_date: 1666675375,
      total_confirmed_transferred_amount: "0.00 USD",
      total_unconfirmed_transferred_amount: "0.00 USD",
      total_confirmed_transfers: 0,
      total_unconfirmed_transfers: 0,
      subscription_package: 'subscription package modified',
      status: ProjectConstants.investment.pending,
      approved_by: '',
      approved_date: 0,
      investment_date: investTable.rows[0].investment_date
    }])

  });

  it('Delete an investment', async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })
    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: '',
      regional_center: '',
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD"
    });

    await contracts.projects.approveprjct(admin.params.account, 0, ...project.getApproveActionParams(), { authorization: `${admin.params.account}@active` });
    
    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: 'subscription package',
      contract: contracts.projects,
      account: investor.params.account
    })
    
    //Act
    await contracts.projects.deleteinvest(investor.params.account, 0, { authorization: `${investor.params.account}@active` })

    // //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })
    console.log('\n\n Projects table : ', projectsTable.rows)

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n investments table is: ', investTable)

    assert.deepStrictEqual(investTable.rows, [])

  });

  it('Approve an investment', async function () {

    //Arrange
    const project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })
    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: '',
      regional_center: '',
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD"
    });

    await contracts.projects.approveprjct(admin.params.account, 0, ...project.getApproveActionParams(), { authorization: `${admin.params.account}@active` });
    
    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: 'subscription package',
      contract: contracts.projects,
      account: investor.params.account
    })
    
    //Act
    await contracts.projects.approveinvst(admin.params.account, 0, { authorization: `${admin.params.account}@active` })

    // //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })
    console.log('\n\n Projects table : ', projectsTable.rows)

    const investTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n investments table is: ', investTable)

    assert.deepStrictEqual(investTable.rows, [{
      investment_id: 0,
      user: investor.params.account,
      project_id: 0,
      total_investment_amount: '5000000.00 USD',
      quantity_units_purchased: 20,
      annual_preferred_return: 500,
      signed_agreement_date: 1666675375,
      total_confirmed_transferred_amount: "0.00 USD",
      total_unconfirmed_transferred_amount: "0.00 USD",
      total_confirmed_transfers: 0,
      total_unconfirmed_transfers: 0,
      subscription_package: 'subscription package',
      status: ProjectConstants.investment.funding,
      approved_by: investTable.rows[0].approved_by,
      approved_date: investTable.rows[0].approved_date,
      investment_date: investTable.rows[0].investment_date
    }])

  });

  it('Make a transfer', async function () {

    //Arrange
    const project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })
    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: '',
      regional_center: '',
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD"
    });

    await contracts.projects.approveprjct(admin.params.account, 0, ...project.getApproveActionParams(), { authorization: `${admin.params.account}@active` });
    
    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: 'subscription package',
      contract: contracts.projects,
      account: investor.params.account
    })
    
    await contracts.projects.approveinvst(admin.params.account, 0, { authorization: `${admin.params.account}@active` })

    //Act
    await ProjectUtil.maketransfer({
      actor: investor.params.account,
      amount: "5000.00 USD",
      investment_id: 0,
      proof_of_transfer: "Transfer done",
      transfer_date: Date.now(),
      contract: contracts.projects,
      account: investor.params.account
    })

    // //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n Investments table : ', projectsTable.rows)

    const transferTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'transfers',
      json: true
    })
    console.log('\n\n transfer table is: ', transferTable)

    assert.deepStrictEqual(transferTable.rows, [{
      fund_transfer_id: 0,
      proof_of_transfer: 'Transfer done',
      amount: '5000.00 USD',
      investment_id: 0,
      user: investor.params.account,
      status: 1,
      transfer_date: transferTable.rows[0].transfer_date,
      updated_date: transferTable.rows[0].updated_date,
      confirmed_date: transferTable.rows[0].confirmed_date,
      confirmed_by: ''
    }])

  });

  it('Edit a transfer', async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })
    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: '',
      regional_center: '',
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD"
    });

    await contracts.projects.approveprjct(admin.params.account, 0, ...project.getApproveActionParams(), { authorization: `${admin.params.account}@active` });
    
    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: 'subscription package',
      contract: contracts.projects,
      account: investor.params.account
    })
    
    await contracts.projects.approveinvst(admin.params.account, 0, { authorization: `${admin.params.account}@active` })

    await ProjectUtil.maketransfer({
      actor: investor.params.account,
      amount: "5000.00 USD",
      investment_id: 0,
      proof_of_transfer: "Transfer done",
      transfer_date: Date.now(),
      contract: contracts.projects,
      account: investor.params.account
    })

    //Act
    await ProjectUtil.edittransfer({
      actor: investor.params.account,
      transfer_id: 0,
      amount: "5000.00 USD",
      proof_of_transfer: "Transfer edited",
      date: Date.now(),
      contract: contracts.projects,
      account: investor.params.account
    })

    // Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n Investments table : ', projectsTable.rows)

    const transferTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'transfers',
      json: true
    })
    console.log('\n\n transfer table is: ', transferTable)

    assert.deepStrictEqual(transferTable.rows, [{
      fund_transfer_id: 0,
      proof_of_transfer: 'Transfer edited',
      amount: '5000.00 USD',
      investment_id: 0,
      user: investor.params.account,
      status: 1,
      transfer_date: transferTable.rows[0].transfer_date,
      updated_date: transferTable.rows[0].updated_date,
      confirmed_date: transferTable.rows[0].confirmed_date,
      confirmed_by: ''
    }])

  });

  it('Confirm a transfer', async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })
    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: '',
      regional_center: '',
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD"
    });

    await contracts.projects.approveprjct(admin.params.account, 0, ...project.getApproveActionParams(), { authorization: `${admin.params.account}@active` });
    
    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: 'subscription package',
      contract: contracts.projects,
      account: investor.params.account
    })
    
    await contracts.projects.approveinvst(admin.params.account, 0, { authorization: `${admin.params.account}@active` })

    await ProjectUtil.maketransfer({
      actor: investor.params.account,
      amount: "5000.00 USD",
      investment_id: 0,
      proof_of_transfer: "Transfer done",
      transfer_date: Date.now(),
      contract: contracts.projects,
      account: investor.params.account
    })

    //Act
    await ProjectUtil.confrmtrnsfr({
      actor: admin.params.account,
      transfer_id: 0,
      proof_of_transfer: "Transfer confirmed",
      contract: contracts.projects,
      account: admin.params.account
    })

    // Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n Investments table : ', projectsTable.rows)

    const transferTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'transfers',
      json: true
    })
    console.log('\n\n transfer table is: ', transferTable)

    assert.deepStrictEqual(transferTable.rows, [{
      fund_transfer_id: 0,
      proof_of_transfer: 'Transfer confirmed',
      amount: '5000.00 USD',
      investment_id: 0,
      user: investor.params.account,
      status: ProjectConstants.transfer.confirmed,
      transfer_date: transferTable.rows[0].transfer_date,
      updated_date: transferTable.rows[0].updated_date,
      confirmed_date: transferTable.rows[0].confirmed_date,
      confirmed_by: admin.params.account
    }])
  });

  it('Delete a transfer', async function () {
    //Arrange
    const project = await ProjectFactory.createWithDefaults({ actor: admin.params.account });

    await contracts.projects.addproject(...project.getCreateActionParams(), { authorization: `${admin.params.account}@active` });
    await contracts.projects.assignuser(admin.params.account, builder.params.account, 0, { authorization: `${admin.params.account}@active` })
    await contracts.projects.assignuser(admin.params.account, investor.params.account, 0, { authorization: `${admin.params.account}@active` })

    Object.assign(project.params, {
      status: 1,
      builder: builder.params.account,
      investors: [investor.params.account],
      issuer: '',
      regional_center: '',
      fund_lp: "https://fund-lp.com",
      total_fund_offering_amount: "400000.00 USD",
      total_number_fund_offering: 40000,
      price_per_fund_unit: "300.00 USD"
    });

    await contracts.projects.approveprjct(admin.params.account, 0, ...project.getApproveActionParams(), { authorization: `${admin.params.account}@active` });
    
    await ProjectUtil.invest({
      actor: investor.params.account,
      project_id: 0,
      total_investment_amount: "5000000.00 USD",
      quantity_units_purchased: "20",
      annual_preferred_return: "500",
      signed_agreement_date: 1666675375,
      subscription_package: 'subscription package',
      contract: contracts.projects,
      account: investor.params.account
    })
    
    await contracts.projects.approveinvst(admin.params.account, 0, { authorization: `${admin.params.account}@active` })

    await ProjectUtil.maketransfer({
      actor: investor.params.account,
      amount: "5000.00 USD",
      investment_id: 0,
      proof_of_transfer: "Transfer done",
      transfer_date: Date.now(),
      contract: contracts.projects,
      account: investor.params.account
    })

    //Act
    await contracts.projects.deletetrnsfr(investor.params.account, 0, { authorization: `${investor.params.account}@active` })


    // Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'investments',
      json: true
    })
    console.log('\n\n Investments table : ', projectsTable.rows)

    const transferTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'transfers',
      json: true
    })
    console.log('\n\n transfer table is: ', transferTable)

    assert.deepStrictEqual(transferTable.rows, [])

  });


})