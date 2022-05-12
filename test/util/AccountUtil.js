const { dateToBlockTimestamp } = require('eosjs/dist/eosjs-serialize')
const { contractNames } = require('../../scripts/config')
const { createRandomAccount, createRandomName } = require('../../scripts/eosio-util')


const AccountConstants = {
  category: {
    none: 1,
    hard_cost: 2,
    soft_cost: 3,
  },
  type: {
    debit: "Debit",
    credit: "Credit"
  },
  name:{
    none:"None",
    hard: "Hard Cost",
    soft: "Soft_cost",
  },
  subtype: {
    assets: "Assets",
    equity: "Equity",
    expenses: "Expenses",
    income: "Income",
    liabilities: "Liabilities"
  },
  hard_cost: {
    construction: "Construction",
    furniture_fixtures_allowance: "Furniture, Fixtures & Allowance",
    hard_cost_contingency_allowance: "Hard Cost contingency & Allowance",
  }, 
  soft_cost: {
    architect_design: "Architect & Design",
    building_permits_impact_fees: "Building Permits & Impact Fees",
    developer_reimbursable: "Developer Reimbursable",
    builder_risk_insurance: "Builder Risk Insurance",
    environment_soils_survey: "Environment / Soils / Survey",
    testing_inspections: "Testing & Inspections",
    legal_professional: "Legal & Professional",
    real_estate_taxes_owners_liability_insurance: "Real Estate Taxes & Owner's Liability Insurance",
    predevelopment_fee: "Pre - Development Fee",
    equity_management_fee: "Equity Management Fee",
    bank_origination_fee: "Bank Origination Fee",
    lender_debt_placement_fee: "Lender Debt Placement Fee",
    title_appraisal_feasibility_plan_review_closing: "Title, Appraisal, Feasibility, Plan Review & Closing",
    interest_carry_during_construction: "Interest Carry during Construction",
    ops_stabilization_interest_carry_reserve: "Ops Stabilization & Interest Carry Reserve",
    sales_marketing: "Sales & Marketing",
    preopening_expenses: "Pre - Opening Expenses",
    contingency: "Contingency",


  }
}


class AccountUtil {
  static tokenSymbol = '2,USD'

  static async addledger({ project_id, entity_id, contract, contractAccount }) {
    await contract.addledger(project_id, entity_id, { authorization: `${contractAccount}@active` })
  }

  static async editaccount({
    actor,
    project_id,
    account_id,
    account_name,
    description,
    account_category,
    budget_amount,
    naics_code,
    jobs_multiplier,
    contract,
    contractAccount}) {
    await contract.editaccount(
      actor,
      project_id,
      account_id,
      account_name,
      description,
      account_category,
      budget_amount,
      naics_code,
      jobs_multiplier, { authorization: `${contractAccount}@active` })
  }

  static async deleteaccnt({
    actor,
    project_id,
    account_id,
    contract,
    contractAccount }) {
    await contract.deleteaccnt(
      actor,
      project_id,
      account_id, { authorization: `${contractAccount}@active` })
  }

  static async addbalance({
    project_id,
    account_id,
    amount,
    contract,
    contractAccount }) {
    await contract.addbalance(
      project_id,
      account_id,
      amount, { authorization: `${contractAccount}@active` })
  }

  static async subbalance({
    project_id,
    account_id,
    amount,
    contract,
    contractAccount }) {
    await contract.subbalance(
      project_id,
      account_id,
      amount, { authorization: `${contractAccount}@active` })
  }

  static async canceladd({
    project_id,
    account_id,
    amount,
    contract,
    contractAccount }) {
    await contract.canceladd(
      project_id,
      account_id,
      amount, { authorization: `${contractAccount}@active` })
  }

  static async cancelsub({
    project_id,
    account_id,
    amount,
    contract,
    contractAccount }) {
    await contract.cancelsub(
      project_id,
      account_id,
      amount, { authorization: `${contractAccount}@active` })
  }

  static async deleteaccnts({
    project_id,
    contract,
    contractAccount }) {
    await contract.deleteaccnts(
      project_id, { authorization: `${contractAccount}@active` })
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
    budget_amount,
    naics_code,
    jobs_multiplier
  ) {
    this.params = {
      actor,
      project_id,
      account_name,
      parent_id,
      account_currency,
      description,
      account_category,
      budget_amount,
      naics_code,
      jobs_multiplier
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


  getCreateActionParams() {
    return [
      this.params.actor,
      this.params.project_id,
      this.params.account_name,
      this.params.parent_id,
      this.params.account_currency,
      this.params.description,
      this.params.account_category,
      this.params.budget_amount,
      this.params.naics_code,
      this.params.jobs_multiplier
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
    budget_amount,
    naics_code,
    jobs_multiplier
  }) {
    return new Account(
      actor,
      project_id,
      account_name,
      parent_id,
      account_currency,
      description,
      account_category,
      budget_amount,
      naics_code,
      jobs_multiplier
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
    budget_amount,
    naics_code,
    jobs_multiplier

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
      parent_id = 1
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
      budget_amount = '0.00 USD'
    }

    if (!naics_code) {
      naics_code = 44122 // NAICS Industry
    }

    if (!jobs_multiplier) {
      jobs_multiplier = 68321
    }

    return AccountFactory.createEntry({
      actor,
      project_id,
      account_name,
      parent_id,
      account_currency,
      description,
      account_category,
      budget_amount,
      naics_code,
      jobs_multiplier
    })
  }
}




module.exports = { Account, AccountUtil, AccountFactory, AccountConstants }

