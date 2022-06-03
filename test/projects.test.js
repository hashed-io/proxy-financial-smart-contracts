const { rpc } = require('../scripts/eos')
const { getContracts, createRandomAccount } = require('../scripts/eosio-util')
const { assertError } = require('../scripts/eosio-errors')
const { contractNames, contracts: configContracts, isLocalNode, sleep } = require('../scripts/config')

const { updatePermissions } = require('../scripts/permissions')

const { EnvironmentUtil } = require('./util/EnvironmentUtil')
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
    // await EnvironmentUtil.initNode()
    await sleep(4000)
    // await EnvironmentUtil.deployContracts(configContracts)

    contracts = await getContracts([projects])

    await updatePermissions()

  })

  afterEach(async function () {
    // await EnvironmentUtil.killNode()

  })

  it('Add an identity', async function () {

    // Arrange
    const entity = await EntityFactory.createWithDefaults({})
    console.log(contracts.projects)

    // Act
    await contracts.projects.addentity(...entity.getActionParams(), { authorization: `${projects}@active` })
    
    const projectsTable = await rpc.get_table_rows({
      code: projects,
      scope: 1,
      table: 'projects',
      json: true
    })

    // Assert
    //console.log(projectsTable)

  })


})