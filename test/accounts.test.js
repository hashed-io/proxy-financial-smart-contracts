const { rpc, api, transact } = require('../scripts/eos')
const { getContracts, createRandomAccount, createRandomName } = require('../scripts/eosio-util')
const { assertError } = require('../scripts/eosio-errors')
const { contractNames, contracts: configContracts, isLocalNode, sleep } = require('../scripts/config')

const { updatePermissions } = require('../scripts/permissions')

const { EnvironmentUtil } = require('./util/EnvironmentUtil')
const { BudgetFactory, BudgetConstants } = require('./util/BudgetUtil')
const { EntityFactory, EntityConstants } = require('./util/EntityUtil')
const { ProjectFactory, ProjectConstants, ProjectUtil } = require('./util/ProjectUtil')
const { AccountFactory, AccountConstants, AccountUtil } = require('./util/AccountUtil')
const { func } = require('promisify')
const assert = require('assert')
const { Console } = require('console')

const expect = require('chai').expect

const { accounts, projects, budgets, permissions, transactions } = contractNames

describe('Tests for budgets smart contract', async function () {

  let contracts

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

   contracts = await getContracts([accounts, projects, budgets, permissions, transactions ])
   await contracts.permissions.reset({authorization: `${permissions}@active`})
   await contracts.transactions.reset({authorization: `${transactions}@active`})
   await contracts.accounts.reset({authorization: `${accounts}@active`})
   await contracts.budgets.reset({authorization: `${budgets}@active`})
   await contracts.projects.reset({authorization: `${projects}@active`})
   await updatePermissions()
   console.log('\n')

  })

  afterEach(async function () {
    await EnvironmentUtil.killNode()

  })

  // it('Add a ledger to a new project', async function(){
  //   //Arrange
  //   const developerEntity = await EntityFactory.createWithDefaults({type: EntityConstants.developer});
  //   const developerParams = developerEntity.getActionParams()

  //   const investorEntity = await EntityFactory.createWithDefaults({type: EntityConstants.investor});
  //   const investorParams = investorEntity.getActionParams()

  //   const fundEntity = await EntityFactory.createWithDefaults({type: EntityConstants.fund});
  //   const fundParams = fundEntity.getActionParams()

  //   await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active`})
  //   await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active`})
  //   await contracts.projects.addentity(...investorParams, { authorization: `${investorParams[0]}@active`})
  //   await contracts.projects.addtestuser(investorParams[0], investorParams[1], 2, { authorization: `${investorParams[0]}@active`})
  //   await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active`})
  //   await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, { authorization: `${fundParams[0]}@active`})

  //   const newProject = await ProjectFactory.createWithDefaults({actor: developerParams[0]});
  //   const projectParams = newProject.getActionParams()

  //   await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active`})

  //   const newAccount =  await AccountFactory.createWithDefaults({actor: investorParams[0]})
  //   const accountParams = newAccount.getActionParams()
  //   console.log('newAccount is: ', accountParams)


  //   //Act
  //   await AccountUtil.addledger({
  //     project_id: 0,
  //     entity_id: 2,
  //     contract: contracts.accounts,
  //     contractAccount: accounts
  //   })
  //   //await contracts.accounts.addledger(0, 2, {authorization: `${accounts}@active`})
  //   //await contracts.accounts.addaccount(...accountParams, {authorization: `${accountParams[0]}@active`})

  //   //Assert

  //   const entitiesTable = await rpc.get_table_rows({
  //     code: projects,
  //     scope: projects,
  //     table: 'entities',
  //     json: true
  //   })
  //   console.log('\n\n Entities table : ', entitiesTable.rows)

  //   const ledgerTable = await rpc.get_table_rows({
  //     code: accounts,
  //     scope: 0,
  //     table: 'ledgers',
  //     json: true
  //   })
  //   console.log('\n\n Ledgers table : ', ledgerTable.rows)

  //   assert.deepStrictEqual(ledgerTable.rows,[{
  //     ledger_id: 1,
  //     entity_id: 2,
  //     description: 'Ledger for the ' + EntityConstants.investor +' '+ investorParams[1]
  //   }])

  // })

  it('Add an account', async function(){
    //Arrange
    //await contracts.accounts.reset({authorization: `${accounts}@active`})
    const developerEntity = await EntityFactory.createWithDefaults({type: EntityConstants.developer});
    const developerParams = developerEntity.getActionParams()

    const investorEntity = await EntityFactory.createWithDefaults({type: EntityConstants.investor});
    const investorParams = investorEntity.getActionParams()

    const fundEntity = await EntityFactory.createWithDefaults({type: EntityConstants.fund});
    const fundParams = fundEntity.getActionParams()
    console.log('developer is: ', developerParams[0])
    console.log('investor is: ', investorParams[0])
    console.log('fund is: ', fundParams[0])


    await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active`})
    await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active`})
    await contracts.projects.addentity(...investorParams, { authorization: `${investorParams[0]}@active`})
    await contracts.projects.addtestuser(investorParams[0], investorParams[1], 2, { authorization: `${investorParams[0]}@active`})
    await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active`})
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, { authorization: `${fundParams[0]}@active`})

    const newProject = await ProjectFactory.createWithDefaults({actor: developerParams[0]});
    const projectParams = newProject.getActionParams()

    const newProject2 = await ProjectFactory.createWithDefaults({actor: developerParams[0]});
    const projectParams2 = newProject2.getActionParams()

    const newProject3 = await ProjectFactory.createWithDefaults({actor: developerParams[0]});
    const projectParams3 = newProject3.getActionParams()

    const newProject4 = await ProjectFactory.createWithDefaults({actor: developerParams[0]});
    const projectParams4 = newProject4.getActionParams()

    await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active`})
    await contracts.projects.addproject(...projectParams2, { authorization: `${projectParams[0]}@active`})
    await contracts.projects.addproject(...projectParams3, { authorization: `${projectParams[0]}@active`})
    await contracts.projects.addproject(...projectParams4, { authorization: `${projectParams[0]}@active`})

    const approveParameters = [fundParams[0], 0,"https://fund-lp.com", "400000.00 USD",40000,"300.00 USD"]
    const approveParameters2 = [fundParams[0], 1,"https://fund-lp.com", "400000.00 USD",40000,"300.00 USD"]
    const approveParameters3 = [fundParams[0], 2,"https://fund-lp.com", "400000.00 USD",40000,"300.00 USD"]
    const approveParameters4 = [fundParams[0], 3,"https://fund-lp.com", "400000.00 USD",40000,"300.00 USD"]

    await contracts.projects.approveprjct(...approveParameters,{ authorization: `${fundParams[0]}@active`});
    // await contracts.projects.approveprjct(...approveParameters2,{ authorization: `${fundParams[0]}@active`});
    // await contracts.projects.approveprjct(...approveParameters3,{ authorization: `${fundParams[0]}@active`});
    // await contracts.projects.approveprjct(...approveParameters4,{ authorization: `${fundParams[0]}@active`});


    // await contracts.projects.changestatus(3, ProjectConstants.status.investment, { authorization: `${projects}@active`})
    // await contracts.projects.changestatus(3, ProjectConstants.status.completed,  { authorization: `${projects}@active`})

    //await contracts.accounts.initaccounts(0, {authorization: `${accounts}@active`})
    // await contracts.accounts.initaccounts(1, {authorization: `${accounts}@active`})
    // await contracts.accounts.initaccounts(2, {authorization: `${accounts}@active`})
    // await contracts.accounts.initaccounts(3, {authorization: `${accounts}@active`})


    // try{ 
    //   await contracts.accounts.initaccounts(5,{ authorization: `${accounts}@active`})
    // }catch(err){
    //   console.error(err)
    // }
    const newAccount =  await AccountFactory.createWithDefaults({
      actor: projectParams[0], 
      project_id: 0,
      parent_id: 1,
      account_category:1, 
     budget_amount: '0.00 USD'})
    const accountParams = newAccount.getActionParams()

    const newAccount2 =  await AccountFactory.createWithDefaults({
      actor: projectParams[0]})
    const accountParams2 = newAccount2.getActionParams()

    //console.log('accountParams is: ', accountParams)

    //Act
    
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
      contractAccount: accountParams[0]
    })

    await AccountUtil.addaccount({
      actor: accountParams2[0],
      project_id: 0,
      account_name: 'Liquid Primary',
      parent_id: 1,
      account_currency: accountParams2[4],
      description: accountParams2[5],
      account_category: accountParams2[6],
      budget_amount: '100.00 USD', 
      contract: contracts.accounts, 
      contractAccount: accountParams2[0]
    })

    //Assert
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'projects',
      json: true
    })

    console.log('\n\n Projects table : ', projectsTable)



    const entitiesTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'entities',
      json: true
    })
    console.log('\n\n Entities table : ', entitiesTable.rows)
        
    const usersTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'users',
      json: true
    })
    console.log('\n\n Users table : ', usersTable)

    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'accounts',
      json: true,
      limit: 20
    })
    console.log('\n\n Accounts table : ', accountsTable.rows)

    const ledgerTable = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'ledgers',
      json: true
    })
    console.log('\n\n Ledgers table : ', ledgerTable.rows)

    const typesTable = await rpc.get_table_rows({
      code: accounts, 
      scope: accounts,
      table: 'accnttypes',
      json: true
    })
    console.log('\n\n types table : ', typesTable.rows)

    const budgetsTable = await rpc.get_table_rows({
      code: budgets, 
      scope: 0,
      table: 'budgets',
      json: true
    })
    console.log('\n\n budgets table : ', budgetsTable.rows)


  //   assert.deepStrictEqual(ledgerTable.rows,[{
  //     ledger_id: 1,
  //     entity_id: 2,
  //     description: 'Ledger for the ' + EntityConstants.investor +' '+ investorParams[1]
  //   }])

  })

  


})