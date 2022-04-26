const { dateToBlockTimestamp } = require('eosjs/dist/eosjs-serialize')
const { contractNames } = require('../../scripts/config')
const { createRandomAccount, createRandomName } = require('../../scripts/eosio-util')

 
const AccountConstants ={
  category:{
    none: 1,
    hard_cost: 2,
    soft_cost: 3,
  },
  type:{
    debit: "Debit",
    credit: "Credit"
  },
  subtype:{
    assets: "Assets",
    equity: "Equity",
    expenses: "Expenses",
    income: "Income",
    liabilities: "Liabilities" 
  }
}

class AccountUtil{
  static tokenSymbol = '2,USD'

  static async addledger({project_id, entity_id, contract, contractAccount}){
    await contract.addledger(project_id, entity_id, { authorization: `${contractAccount}@active` })
  }

  static async addaccount({
    actor,
    project_id,
    account_name,
    parent_id,
    account_currency,
    description,
    account_category,
    budget_amount, 
    contract, 
    contractAccount}){
    await contract.addaccount(
      actor,
      project_id,
      account_name,
      parent_id,
      account_currency,
      description,
      account_category,
      budget_amount, { authorization: `${contractAccount}@active` })
  }




}



class Account {
  constructor(
    actor,
    project_id,
    account_name,
    parent_id,
    account_currency,
    description,
    account_category,
    budget_amount 
  ) {
    this.params = {
      actor,
      project_id,
      account_name,
      parent_id,
      account_currency,
      description,
      account_category,
      budget_amount 
    }
  }

  getActionParams() {

    return [
      this.params.actor,
      this.params.project_id,
      this.params.account_name,
      this.params.parent_id,
      this.params.account_currency,
      this.params.description,
      this.params.account_category,
      this.params.budget_amount 
    ]
  }

}

class AccountFactory {
  static createEntry({
    actor,
    project_id,
    account_name,
    parent_id,
    account_currency,
    description,
    account_category,
    budget_amount 
  }) {
    return new Account (
      actor,
      project_id,
      account_name,
      parent_id,
      account_currency,
      description,
      account_category,
      budget_amount 
    )
  }

  static async createWithDefaults({
    actor,
    project_id,
    account_name,
    parent_id,
    account_currency,
    description,
    account_category,
    budget_amount 
  }) {

    if (!actor) {
      actor = await createRandomAccount()
    }

    if (!project_id) { 
      project_id = isFinite(project_id) ? project_id : 0
    }

    if (!account_name) { 
      account_name = createRandomName()
    }

    if (!parent_id) {
      parent_id = isFinite(parent_id) ? parent_id : 0
    }

    if (!account_currency) {
      account_currency = '2,USD'
    }

    if (!description) {
      description = "Basic account to test"
    }

    if (!account_category) {
      account_category = AccountConstants.category.none
    }

    if (!budget_amount) {
      budget_amount = '0.00 USD';
    }

    return AccountFactory.createEntry({
      actor,
      project_id,
      account_name,
      parent_id,
      account_currency,
      description,
      account_category,
      budget_amount 
    })
  }
}




module.exports = { Account, AccountUtil, AccountFactory, AccountConstants }

