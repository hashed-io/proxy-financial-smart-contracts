const { rpc, api, transact } = require('../scripts/eos')
const { getContracts, createRandomAccount, createRandomName } = require('../scripts/eosio-util')
const { assertError } = require('../scripts/eosio-errors')
const { contractNames, contracts: configContracts, isLocalNode, sleep } = require('../scripts/config')

const { updatePermissions } = require('../scripts/permissions')

const { EnvironmentUtil } = require('./util/EnvironmentUtil')
const { BudgetFactory, BudgetConstants, BudgetUtil } = require('./util/BudgetUtil')
const { EntityFactory, EntityConstants } = require('./util/EntityUtil')
const { AccountFactory, AccountConstants, AccountUtil } = require('./util/AccountUtil')
const { ProjectFactory, ProjectConstants, ProjectUtil } = require('./util/ProjectUtil')
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

  it('Creates a new budget', async function(){
    //Arrange
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

    await contracts.projects.addproject(...projectParams, { authorization: `${projectParams[0]}@active`})

    const approveParameters = [fundParams[0], 0,"https://fund-lp.com", "400000.00 USD",40000,"300.00 USD"]

    await contracts.projects.approveprjct(...approveParameters,{ authorization: `${fundParams[0]}@active`});

    await contracts.accounts.initaccounts(0, {authorization: `${accounts}@active`})
    
    const newAccount =  await AccountFactory.createWithDefaults({
      actor: projectParams[0], 
      project_id: 0,
      parent_id: 1,
      account_category:1, 
      budget_amount: '0.00 USD'})
    const accountParams = newAccount.getActionParams()

    
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

    //Act
    const newBudget = await BudgetFactory.createWithDefaults({
      actor: developerParams[0]})
    
    const budgetParams = newBudget.getActionParams()
    console.log('budget params is: ', budgetParams)

    await BudgetUtil.addbudget({
      actor: developerParams[0],
      project_id: 0,
      account_id: 1,
      amount: budgetParams[3],
      budget_type_id:budgetParams[4],
      begin_date: budgetParams[5],
      end_date: budgetParams[6],
      modify_parents: budgetParams[7],
      contract: contracts.budgets, 
      contractAccount: developerParams[0]})
    
    //await BudgetUtil.addbudget({
      // actor: investorParams[0],
      // project_id: 0,
      // account_id: 1,
      // amount: budgetParams[3],
      // budget_type_id:budgetParams[4],
      // begin_date: budgetParams[5],
      // end_date: budgetParams[6],
      // modify_parents: budgetParams[7],
      // contract: contracts.budgets, 
      // contractAccount: investorParams[0]})
      
      // await BudgetUtil.addbudget({
      //   actor: fundParams[0],
      //   project_id: 0,
      //   account_id: 1,
      //   amount: budgetParams[3],
      //   budget_type_id:budgetParams[4],
      //   begin_date: budgetParams[5],
      //   end_date: budgetParams[6],
      //   modify_parents: budgetParams[7],
      //   contract: contracts.budgets, 
      //   contractAccount: fundParams[0]})
      
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



  })


})