const { rpc, api, transact } = require('../scripts/eos')
const { getContracts, createRandomAccount, createRandomName } = require('../scripts/eosio-util')
const { assertError } = require('../scripts/eosio-errors')
const { contractNames, contracts: configContracts, isLocalNode, sleep } = require('../scripts/config')

const { updatePermissions } = require('../scripts/permissions')

const { EnvironmentUtil } = require('./util/EnvironmentUtil')
const { BudgetFactory, BudgetConstants } = require('./util/BudgetUtil')
const { EntityFactory, EntityConstants } = require('./util/EntityUtil')
const { ProjectFactory, ProjectConstants } = require('./util/ProjectUtil')
const { func } = require('promisify')
const assert = require('assert')
const { Console } = require('console')

const expect = require('chai').expect

const { budgets, projects } = contractNames

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

   contracts = await getContracts([budgets, projects])

   await updatePermissions()
   console.log('\n')

  })

  afterEach(async function () {
    await EnvironmentUtil.killNode()

  })

  it('Creates a new budget', async function(){
    //Arrange
    const developerEntity = await EntityFactory.createWithDefaults({type: EntityConstants.developer});
    const developerParams = developerEntity.getActionParams()

    const investorEntity = await EntityFactory.createWithDefaults({type: EntityConstants.investor});
    const investorParams = investorEntity.getActionParams()

    const fundEntity = await EntityFactory.createWithDefaults({type: EntityConstants.fund});
    const fundParams = fundEntity.getActionParams()

    await contracts.projects.addentity(...developerParams, { authorization: `${developerParams[0]}@active`})
    await contracts.projects.addtestuser(developerParams[0], developerParams[1], 1, { authorization: `${developerParams[0]}@active`})
    await contracts.projects.addentity(...investorParams, { authorization: `${investorParams[0]}@active`})
    await contracts.projects.addtestuser(investorParams[0], investorParams[1], 2, { authorization: `${investorParams[0]}@active`})
    await contracts.projects.addentity(...fundParams, { authorization: `${fundParams[0]}@active`})
    await contracts.projects.addtestuser(fundParams[0], fundParams[1], 3, { authorization: `${fundParams[0]}@active`})

    const newProject = await ProjectFactory.createWithDefaults({actor: developerParams[0]});
    const projectParams = newProject.getActionParams()

    await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active`})
    const approveParameters = [fundParams[0],0,"https://fund-lp.com", "400000.00 USD",40000,"300.00 USD"]
    await contracts.projects.approveprjct(...approveParameters,{ authorization: `${fundParams[0]}@active`});


    const newBudget = [
      developerParams[0],
      0,
      89,
      "60000.00 USD",
      0,
      Date.now(),
      Date.now() + 6.048e+8,
      false
    ]
    console.log('new budget is: ', newBudget)


    //Act
    await contracts.budgets.addbudget(...newBudget, { authorization: `${developerParams[0]}@active`})

    //Assert
    const usersTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'users',
      json: true
    })
    console.log('\n\n Users table : ', usersTable)

    const entitiesTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'entities',
      json: true
    })
    console.log('\n\n Entities table : ', entitiesTable)



  })


})