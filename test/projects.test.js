const { rpc, api, transact } = require('../scripts/eos')
const { getContracts, createRandomAccount } = require('../scripts/eosio-util')
const { assertError } = require('../scripts/eosio-errors')
const { contractNames, contracts: configContracts, isLocalNode, sleep } = require('../scripts/config')

const { updatePermissions } = require('../scripts/permissions')

const { EnvironmentUtil } = require('./util/EnvironmentUtil')
const { ProjectsUtil } = require('./util/ProjectsUtil')
const { EntityFactory, EntityConstants } = require('./util/EntityUtil')

const expect = require('chai').expect

const { projects } = contractNames


describe('Tests for projects smart contract', async function () {

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

   contracts = await getContracts([projects])

    await updatePermissions()

  })

  afterEach(async function () {
    await EnvironmentUtil.killNode()

  })

  it('Add an identity', async function () {

    // Arrange
    const entity = await EntityFactory.createWithDefaults({actor:projects})
    const entityParams = entity.getActionParams()


    // const account = await rpc.get_account('proxyact');
    // console.log('account is: ', account)

    //Act
    // await ProjectsUtil.addentity({
    //   actor: entityParams[0],
    //   entity_name: entityParams[1],
    //   description: entityParams[2],
    //   type: entityParams[3],
    //   contract: contracts.projects
    // })
    //await contracts.projects.reset({authorization:'derp'})
    try{
      await contracts.projects.addentity(...entityParams, { authorization: `${projects}@active`})

      await contracts.projects.addentity(...entityParams)

    }catch(err){
      console.log('ERROR IS: ', JSON.stringify(err, null, ' '), '\n')
    }

    // await transact({
    //   actions: [
    //   {
    //     account: projects,
    //     name: 'reset',
    //     authorization: [{
    //       actor: projects,
    //       permission: 'active',
    //     }],
    //     data: {
    //     },
    //   }]
    // })
    
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'entities',
      json: true
    })

    // // Assert
    console.log(projectsTable)

  })


})