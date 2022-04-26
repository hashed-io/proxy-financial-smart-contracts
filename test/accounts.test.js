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

    contracts = await getContracts([accounts, projects, budgets, permissions, transactions])
    await contracts.permissions.reset({ authorization: `${permissions}@active` })
    await contracts.transactions.reset({ authorization: `${transactions}@active` })
    await contracts.accounts.reset({ authorization: `${accounts}@active` })
    await contracts.budgets.reset({ authorization: `${budgets}@active` })
    await contracts.projects.reset({ authorization: `${projects}@active` })
    await updatePermissions()
    console.log('\n')

  })

  afterEach(async function () {
    await EnvironmentUtil.killNode()

  })

  it('Add a ledger to a new project', async function(){
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

    const newAccount =  await AccountFactory.createWithDefaults({actor: investorParams[0]})
    const accountParams = newAccount.getActionParams()
    console.log('newAccount is: ', accountParams)


    //Act
    await AccountUtil.addledger({
      project_id: 0,
      entity_id: 2,
      contract: contracts.accounts,
      contractAccount: accounts
    })
    //await contracts.accounts.addledger(0, 2, {authorization: `${accounts}@active`})
    //await contracts.accounts.addaccount(...accountParams, {authorization: `${accountParams[0]}@active`})

    //Assert

    const entitiesTable = await rpc.get_table_rows({
      code: projects,
      scope: projects,
      table: 'entities',
      json: true
    })
    console.log('\n\n Entities table : ', entitiesTable.rows)

    const ledgerTable = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'ledgers',
      json: true
    })
    console.log('\n\n Ledgers table : ', ledgerTable.rows)

    assert.deepStrictEqual(ledgerTable.rows,[{
      ledger_id: 1,
      entity_id: 2,
      description: 'Ledger for the ' + EntityConstants.investor +' '+ investorParams[1]
    }])

  })

  it('Add an account', async function () {
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

    const newAccount = await AccountFactory.createWithDefaults({
      actor: projectParams[0],
      project_id: 0,
      parent_id: 1,
      account_category: 1,
      budget_amount: '0.00 USD'
    })
    const accountParams = newAccount.getActionParams()


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

    //Assert

    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'accounts',
      json: true,
      limit: 20
    })
    console.log('\n\n Accounts table : ', accountsTable.rows)

    assert.deepStrictEqual(accountsTable.rows, [
      {
        account_id: 1,
        parent_id: 0,
        num_children: 1,
        account_name: 'Assets',
        account_subtype: 'Assets',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Assets',
        account_category: 1
      },
      {
        account_id: 2,
        parent_id: 0,
        num_children: 0,
        account_name: 'Equity',
        account_subtype: 'Equity',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Equity',
        account_category: 1
      },
      {
        account_id: 3,
        parent_id: 0,
        num_children: 0,
        account_name: 'Expenses',
        account_subtype: 'Expenses',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Expenses',
        account_category: 1
      },
      {
        account_id: 4,
        parent_id: 0,
        num_children: 0,
        account_name: 'Income',
        account_subtype: 'Income',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Income',
        account_category: 1
      },
      {
        account_id: 5,
        parent_id: 0,
        num_children: 0,
        account_name: 'Liabilities',
        account_subtype: 'Liabilities',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Liabilities',
        account_category: 1
      },
      {
        account_id: 6,
        parent_id: 0,
        num_children: 0,
        account_name: 'Assets',
        account_subtype: 'Assets',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Assets',
        account_category: 1
      },
      {
        account_id: 7,
        parent_id: 0,
        num_children: 0,
        account_name: 'Equity',
        account_subtype: 'Equity',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Equity',
        account_category: 1
      },
      {
        account_id: 8,
        parent_id: 0,
        num_children: 0,
        account_name: 'Expenses',
        account_subtype: 'Expenses',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Expenses',
        account_category: 1
      },
      {
        account_id: 9,
        parent_id: 0,
        num_children: 0,
        account_name: 'Income',
        account_subtype: 'Income',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Income',
        account_category: 1
      },
      {
        account_id: 10,
        parent_id: 0,
        num_children: 0,
        account_name: 'Liabilities',
        account_subtype: 'Liabilities',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Liabilities',
        account_category: 1
      },
      {
        account_id: 11,
        parent_id: 1,
        num_children: 0,
        account_name: accountParams[2],
        account_subtype: 'Assets',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Basic account to test',
        account_category: 1
      }
    ])

  })

  it('Edit an account', async function () {
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

    const newAccount = await AccountFactory.createWithDefaults({
      actor: projectParams[0],
      project_id: 0,
      parent_id: 1,
      account_category: 1,
      budget_amount: '0.00 USD'
    })
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
    await AccountUtil.editaccount({
      actor: accountParams[0],
      project_id: 0,
      account_id: 11,
      account_name: accountParams[2],
      description: 'Description edited',
      account_category: accountParams[6],
      budget_amount: accountParams[7],
      contract: contracts.accounts,
      contractAccount: accountParams[0]
    })

    //Assert

    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'accounts',
      json: true,
      limit: 20
    })
    console.log('\n\n Accounts table : ', accountsTable.rows)

    assert.deepStrictEqual(accountsTable.rows, [
      {
        account_id: 1,
        parent_id: 0,
        num_children: 1,
        account_name: 'Assets',
        account_subtype: 'Assets',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Assets',
        account_category: 1
      },
      {
        account_id: 2,
        parent_id: 0,
        num_children: 0,
        account_name: 'Equity',
        account_subtype: 'Equity',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Equity',
        account_category: 1
      },
      {
        account_id: 3,
        parent_id: 0,
        num_children: 0,
        account_name: 'Expenses',
        account_subtype: 'Expenses',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Expenses',
        account_category: 1
      },
      {
        account_id: 4,
        parent_id: 0,
        num_children: 0,
        account_name: 'Income',
        account_subtype: 'Income',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Income',
        account_category: 1
      },
      {
        account_id: 5,
        parent_id: 0,
        num_children: 0,
        account_name: 'Liabilities',
        account_subtype: 'Liabilities',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Liabilities',
        account_category: 1
      },
      {
        account_id: 6,
        parent_id: 0,
        num_children: 0,
        account_name: 'Assets',
        account_subtype: 'Assets',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Assets',
        account_category: 1
      },
      {
        account_id: 7,
        parent_id: 0,
        num_children: 0,
        account_name: 'Equity',
        account_subtype: 'Equity',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Equity',
        account_category: 1
      },
      {
        account_id: 8,
        parent_id: 0,
        num_children: 0,
        account_name: 'Expenses',
        account_subtype: 'Expenses',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Expenses',
        account_category: 1
      },
      {
        account_id: 9,
        parent_id: 0,
        num_children: 0,
        account_name: 'Income',
        account_subtype: 'Income',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Income',
        account_category: 1
      },
      {
        account_id: 10,
        parent_id: 0,
        num_children: 0,
        account_name: 'Liabilities',
        account_subtype: 'Liabilities',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Liabilities',
        account_category: 1
      },
      {
        account_id: 11,
        parent_id: 1,
        num_children: 0,
        account_name: accountParams[2],
        account_subtype: 'Assets',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Description edited',
        account_category: 1
      }
    ])

  })

  it('Delete an account', async function () {
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

    const newAccount = await AccountFactory.createWithDefaults({
      actor: projectParams[0],
      project_id: 0,
      parent_id: 1,
      account_category: 1,
      budget_amount: '0.00 USD'
    })
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
    await AccountUtil.deleteaccnt({
      actor: accountParams[0],
      project_id: 0,
      account_id: 11,
      contract: contracts.accounts,
      contractAccount: accountParams[0]
    })

    //Assert

    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'accounts',
      json: true,
      limit: 20
    })
    console.log('\n\n Accounts table : ', accountsTable.rows)

    assert.deepStrictEqual(accountsTable.rows, [
      {
        account_id: 1,
        parent_id: 0,
        num_children: 0,
        account_name: 'Assets',
        account_subtype: 'Assets',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Assets',
        account_category: 1
      },
      {
        account_id: 2,
        parent_id: 0,
        num_children: 0,
        account_name: 'Equity',
        account_subtype: 'Equity',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Equity',
        account_category: 1
      },
      {
        account_id: 3,
        parent_id: 0,
        num_children: 0,
        account_name: 'Expenses',
        account_subtype: 'Expenses',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Expenses',
        account_category: 1
      },
      {
        account_id: 4,
        parent_id: 0,
        num_children: 0,
        account_name: 'Income',
        account_subtype: 'Income',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Income',
        account_category: 1
      },
      {
        account_id: 5,
        parent_id: 0,
        num_children: 0,
        account_name: 'Liabilities',
        account_subtype: 'Liabilities',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Liabilities',
        account_category: 1
      },
      {
        account_id: 6,
        parent_id: 0,
        num_children: 0,
        account_name: 'Assets',
        account_subtype: 'Assets',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Assets',
        account_category: 1
      },
      {
        account_id: 7,
        parent_id: 0,
        num_children: 0,
        account_name: 'Equity',
        account_subtype: 'Equity',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Equity',
        account_category: 1
      },
      {
        account_id: 8,
        parent_id: 0,
        num_children: 0,
        account_name: 'Expenses',
        account_subtype: 'Expenses',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Expenses',
        account_category: 1
      },
      {
        account_id: 9,
        parent_id: 0,
        num_children: 0,
        account_name: 'Income',
        account_subtype: 'Income',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Income',
        account_category: 1
      },
      {
        account_id: 10,
        parent_id: 0,
        num_children: 0,
        account_name: 'Liabilities',
        account_subtype: 'Liabilities',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Liabilities',
        account_category: 1
      }
    ])

  })

  it('Add balance', async function () {
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

    const newAccount = await AccountFactory.createWithDefaults({
      actor: projectParams[0],
      project_id: 0,
      parent_id: 1,
      account_category: 1,
      budget_amount: '0.00 USD'
    })
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

    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'accounts',
      json: true,
      limit: 20
    })
    console.log('\n\n Before addbalace accounts table : ', accountsTable.rows)

    //Act
    await AccountUtil.addbalance({
      project_id: 0,
      account_id: 11,
      amount: '1000.00 USD',
      contract: contracts.accounts,
      contractAccount: accounts
    })


    //Assert

    const accountsTable2 = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'accounts',
      json: true,
      limit: 20
    })
    console.log('\n\n After addbalace accounts table : ', accountsTable2.rows)

    assert.deepStrictEqual(accountsTable2.rows, [
      {
        account_id: 1,
        parent_id: 0,
        num_children: 1,
        account_name: 'Assets',
        account_subtype: 'Assets',
        increase_balance: '1000.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Assets',
        account_category: 1
      },
      {
        account_id: 2,
        parent_id: 0,
        num_children: 0,
        account_name: 'Equity',
        account_subtype: 'Equity',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Equity',
        account_category: 1
      },
      {
        account_id: 3,
        parent_id: 0,
        num_children: 0,
        account_name: 'Expenses',
        account_subtype: 'Expenses',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Expenses',
        account_category: 1
      },
      {
        account_id: 4,
        parent_id: 0,
        num_children: 0,
        account_name: 'Income',
        account_subtype: 'Income',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Income',
        account_category: 1
      },
      {
        account_id: 5,
        parent_id: 0,
        num_children: 0,
        account_name: 'Liabilities',
        account_subtype: 'Liabilities',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Liabilities',
        account_category: 1
      },
      {
        account_id: 6,
        parent_id: 0,
        num_children: 0,
        account_name: 'Assets',
        account_subtype: 'Assets',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Assets',
        account_category: 1
      },
      {
        account_id: 7,
        parent_id: 0,
        num_children: 0,
        account_name: 'Equity',
        account_subtype: 'Equity',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Equity',
        account_category: 1
      },
      {
        account_id: 8,
        parent_id: 0,
        num_children: 0,
        account_name: 'Expenses',
        account_subtype: 'Expenses',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Expenses',
        account_category: 1
      },
      {
        account_id: 9,
        parent_id: 0,
        num_children: 0,
        account_name: 'Income',
        account_subtype: 'Income',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Income',
        account_category: 1
      },
      {
        account_id: 10,
        parent_id: 0,
        num_children: 0,
        account_name: 'Liabilities',
        account_subtype: 'Liabilities',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Liabilities',
        account_category: 1
      },
      {
        account_id: 11,
        parent_id: 1,
        num_children: 0,
        account_name: accountParams[2],
        account_subtype: 'Assets',
        increase_balance: '1000.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Basic account to test',
        account_category: 1
      }

    ])

  })

  it('Sub balance', async function () {
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

    const newAccount = await AccountFactory.createWithDefaults({
      actor: projectParams[0],
      project_id: 0,
      parent_id: 1,
      account_category: 1,
      budget_amount: '0.00 USD'
    })
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

    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'accounts',
      json: true,
      limit: 20
    })
    console.log('\n\n Before  accounts table : ', accountsTable.rows)

    await AccountUtil.addbalance({
      project_id: 0,
      account_id: 11,
      amount: '1000.00 USD',
      contract: contracts.accounts,
      contractAccount: accounts
    })

    //Act
    await AccountUtil.subbalance({
      project_id: 0,
      account_id: 11,
      amount: '200.00 USD',
      contract: contracts.accounts,
      contractAccount: accounts
    })


    //Assert

    const accountsTable2 = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'accounts',
      json: true,
      limit: 20
    })
    console.log('\n\n After  accounts table : ', accountsTable2.rows)

    assert.deepStrictEqual(accountsTable2.rows, [
      {
        account_id: 1,
        parent_id: 0,
        num_children: 1,
        account_name: 'Assets',
        account_subtype: 'Assets',
        increase_balance: '1000.00 USD',
        decrease_balance: '200.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Assets',
        account_category: 1
      },
      {
        account_id: 2,
        parent_id: 0,
        num_children: 0,
        account_name: 'Equity',
        account_subtype: 'Equity',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Equity',
        account_category: 1
      },
      {
        account_id: 3,
        parent_id: 0,
        num_children: 0,
        account_name: 'Expenses',
        account_subtype: 'Expenses',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Expenses',
        account_category: 1
      },
      {
        account_id: 4,
        parent_id: 0,
        num_children: 0,
        account_name: 'Income',
        account_subtype: 'Income',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Income',
        account_category: 1
      },
      {
        account_id: 5,
        parent_id: 0,
        num_children: 0,
        account_name: 'Liabilities',
        account_subtype: 'Liabilities',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Liabilities',
        account_category: 1
      },
      {
        account_id: 6,
        parent_id: 0,
        num_children: 0,
        account_name: 'Assets',
        account_subtype: 'Assets',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Assets',
        account_category: 1
      },
      {
        account_id: 7,
        parent_id: 0,
        num_children: 0,
        account_name: 'Equity',
        account_subtype: 'Equity',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Equity',
        account_category: 1
      },
      {
        account_id: 8,
        parent_id: 0,
        num_children: 0,
        account_name: 'Expenses',
        account_subtype: 'Expenses',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Expenses',
        account_category: 1
      },
      {
        account_id: 9,
        parent_id: 0,
        num_children: 0,
        account_name: 'Income',
        account_subtype: 'Income',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Income',
        account_category: 1
      },
      {
        account_id: 10,
        parent_id: 0,
        num_children: 0,
        account_name: 'Liabilities',
        account_subtype: 'Liabilities',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Liabilities',
        account_category: 1
      },
      {
        account_id: 11,
        parent_id: 1,
        num_children: 0,
        account_name: accountParams[2],
        account_subtype: 'Assets',
        increase_balance: '1000.00 USD',
        decrease_balance: '200.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Basic account to test',
        account_category: 1
      }

    ])

  })

  it('canceladd', async function () {
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

    const newAccount = await AccountFactory.createWithDefaults({
      actor: projectParams[0],
      project_id: 0,
      parent_id: 1,
      account_category: 1,
      budget_amount: '0.00 USD'
    })
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

    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'accounts',
      json: true,
      limit: 20
    })
    console.log('\n\n Before accounts table : ', accountsTable.rows)

    await AccountUtil.addbalance({
      project_id: 0,
      account_id: 11,
      amount: '1000.00 USD',
      contract: contracts.accounts,
      contractAccount: accounts
    })

    //Act
    await AccountUtil.canceladd({
      project_id: 0,
      account_id: 11,
      amount: '200.00 USD',
      contract: contracts.accounts,
      contractAccount: accounts
    })


    //Assert

    const accountsTable2 = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'accounts',
      json: true,
      limit: 20
    })
    console.log('\n\n After accounts table : ', accountsTable2.rows)

    assert.deepStrictEqual(accountsTable2.rows, [
      {
        account_id: 1,
        parent_id: 0,
        num_children: 1,
        account_name: 'Assets',
        account_subtype: 'Assets',
        increase_balance: '800.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Assets',
        account_category: 1
      },
      {
        account_id: 2,
        parent_id: 0,
        num_children: 0,
        account_name: 'Equity',
        account_subtype: 'Equity',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Equity',
        account_category: 1
      },
      {
        account_id: 3,
        parent_id: 0,
        num_children: 0,
        account_name: 'Expenses',
        account_subtype: 'Expenses',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Expenses',
        account_category: 1
      },
      {
        account_id: 4,
        parent_id: 0,
        num_children: 0,
        account_name: 'Income',
        account_subtype: 'Income',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Income',
        account_category: 1
      },
      {
        account_id: 5,
        parent_id: 0,
        num_children: 0,
        account_name: 'Liabilities',
        account_subtype: 'Liabilities',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Liabilities',
        account_category: 1
      },
      {
        account_id: 6,
        parent_id: 0,
        num_children: 0,
        account_name: 'Assets',
        account_subtype: 'Assets',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Assets',
        account_category: 1
      },
      {
        account_id: 7,
        parent_id: 0,
        num_children: 0,
        account_name: 'Equity',
        account_subtype: 'Equity',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Equity',
        account_category: 1
      },
      {
        account_id: 8,
        parent_id: 0,
        num_children: 0,
        account_name: 'Expenses',
        account_subtype: 'Expenses',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Expenses',
        account_category: 1
      },
      {
        account_id: 9,
        parent_id: 0,
        num_children: 0,
        account_name: 'Income',
        account_subtype: 'Income',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Income',
        account_category: 1
      },
      {
        account_id: 10,
        parent_id: 0,
        num_children: 0,
        account_name: 'Liabilities',
        account_subtype: 'Liabilities',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Liabilities',
        account_category: 1
      },
      {
        account_id: 11,
        parent_id: 1,
        num_children: 0,
        account_name: accountParams[2],
        account_subtype: 'Assets',
        increase_balance: '800.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Basic account to test',
        account_category: 1
      }

    ])

  })


  it('cancelsub', async function () {
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

    const newAccount = await AccountFactory.createWithDefaults({
      actor: projectParams[0],
      project_id: 0,
      parent_id: 1,
      account_category: 1,
      budget_amount: '0.00 USD'
    })
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

    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'accounts',
      json: true,
      limit: 20
    })
    console.log('\n\n Before  accounts table : ', accountsTable.rows)

    await AccountUtil.addbalance({
      project_id: 0,
      account_id: 11,
      amount: '1000.00 USD',
      contract: contracts.accounts,
      contractAccount: accounts
    })

    await AccountUtil.subbalance({
      project_id: 0,
      account_id: 11,
      amount: '200.00 USD',
      contract: contracts.accounts,
      contractAccount: accounts
    })

    //Act
    await AccountUtil.cancelsub({
      project_id: 0,
      account_id: 11,
      amount: '100.00 USD',
      contract: contracts.accounts,
      contractAccount: accounts
    })


    //Assert

    const accountsTable2 = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'accounts',
      json: true,
      limit: 20
    })
    console.log('\n\n After accounts table : ', accountsTable2.rows)

    assert.deepStrictEqual(accountsTable2.rows, [
      {
        account_id: 1,
        parent_id: 0,
        num_children: 1,
        account_name: 'Assets',
        account_subtype: 'Assets',
        increase_balance: '1000.00 USD',
        decrease_balance: '100.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Assets',
        account_category: 1
      },
      {
        account_id: 2,
        parent_id: 0,
        num_children: 0,
        account_name: 'Equity',
        account_subtype: 'Equity',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Equity',
        account_category: 1
      },
      {
        account_id: 3,
        parent_id: 0,
        num_children: 0,
        account_name: 'Expenses',
        account_subtype: 'Expenses',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Expenses',
        account_category: 1
      },
      {
        account_id: 4,
        parent_id: 0,
        num_children: 0,
        account_name: 'Income',
        account_subtype: 'Income',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Income',
        account_category: 1
      },
      {
        account_id: 5,
        parent_id: 0,
        num_children: 0,
        account_name: 'Liabilities',
        account_subtype: 'Liabilities',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Liabilities',
        account_category: 1
      },
      {
        account_id: 6,
        parent_id: 0,
        num_children: 0,
        account_name: 'Assets',
        account_subtype: 'Assets',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Assets',
        account_category: 1
      },
      {
        account_id: 7,
        parent_id: 0,
        num_children: 0,
        account_name: 'Equity',
        account_subtype: 'Equity',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Equity',
        account_category: 1
      },
      {
        account_id: 8,
        parent_id: 0,
        num_children: 0,
        account_name: 'Expenses',
        account_subtype: 'Expenses',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Expenses',
        account_category: 1
      },
      {
        account_id: 9,
        parent_id: 0,
        num_children: 0,
        account_name: 'Income',
        account_subtype: 'Income',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Income',
        account_category: 1
      },
      {
        account_id: 10,
        parent_id: 0,
        num_children: 0,
        account_name: 'Liabilities',
        account_subtype: 'Liabilities',
        increase_balance: '0.00 USD',
        decrease_balance: '0.00 USD',
        account_symbol: '2,USD',
        ledger_id: 2,
        description: 'Liabilities',
        account_category: 1
      },
      {
        account_id: 11,
        parent_id: 1,
        num_children: 0,
        account_name: accountParams[2],
        account_subtype: 'Assets',
        increase_balance: '1000.00 USD',
        decrease_balance: '100.00 USD',
        account_symbol: '2,USD',
        ledger_id: 1,
        description: 'Basic account to test',
        account_category: 1
      }

    ])

  })


  it('Admin can delete ALL accounts', async function () {
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

    const newAccount = await AccountFactory.createWithDefaults({
      actor: projectParams[0],
      project_id: 0,
      parent_id: 1,
      account_category: 1,
      budget_amount: '0.00 USD'
    })
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

    const accountsTable = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'accounts',
      json: true,
      limit: 20
    })
    console.log('\n\n Before  accounts table : ', accountsTable.rows)

    await AccountUtil.addbalance({
      project_id: 0,
      account_id: 11,
      amount: '1000.00 USD',
      contract: contracts.accounts,
      contractAccount: accounts
    })

    //Act
    await AccountUtil.deleteaccnts({
      project_id: 0,
      contract: contracts.accounts,
      contractAccount: accounts
    })



    //Assert

    const accountsTable2 = await rpc.get_table_rows({
      code: accounts,
      scope: 0,
      table: 'accounts',
      json: true,
      limit: 20
    })
    console.log('\n\n After  accounts table : ', accountsTable2.rows)

    assert.deepStrictEqual(accountsTable2.rows, [])

  })


})