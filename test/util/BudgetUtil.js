const { dateToBlockTimestamp } = require('eosjs/dist/eosjs-serialize')
const { createRandomAccount, createRandomName } = require('../../scripts/eosio-util')

const BudgetConstants ={
  type:{
    total: "Total",
    annually: "Annually",
    monthly: "Monthly",
    weekly: "Weekly",
    daily: "Daily",
    custom: "Custom"
  }
}

class Budget {
  constructor(
    actor,
    project_id,
    account_id,
    amount,
    budget_type_id,
    begin_date,
    end_date,
    modify_parents
  ) {
    this.params = {
      actor,
      project_id,
      account_id,
      amount,
      budget_type_id,
      begin_date,
      end_date,
      modify_parents
    }
  }

  getActionParams() {

    return [
      this.params.actor,
      this.params.project_id,
      this.params.account_id,
      this.params.amount,
      this.params.budget_type_id,
      this.params.begin_date,
      this.params.end_date,
      this.params.modify_parents
    ]
  }

}

class BudgetFactory {
  static createEntry({
    actor,
    project_id,
    account_id,
    amount,
    budget_type_id,
    begin_date,
    end_date,
    modify_parents
  }) {
    return new Budget(
      actor,
      project_id,
      account_id,
      amount,
      budget_type_id,
      begin_date,
      end_date,
      modify_parents
    )
  }

  static async createWithDefaults({
    actor,
    project_id,
    account_id,
    amount,
    budget_type_id,
    begin_date,
    end_date,
    modify_parents
  }) {

    if (!actor) {
      actor = await createRandomAccount()
    }

    if (!project_id) { 
      project_id = isFinite(project_id) ? project_id : 0
    }

    if (!account_id) { 
      account_id = isFinite(account_id) ? account_id : 0
    }

    if (!amount) {
      amount = "10000.00 USD";
    }

    if (!budget_type_id) {
      budget_type_id = 2;
    }

    if (!begin_date) {
      begin_date = Date.now();
    }

    if (!end_date) {
      //1 week later = 6.048e+8 ms
      const oneWeekLater = 6.048e+8
      end_date = Date.now() + oneWeekLater;
    }

    if (!modify_parents) {
      modify_parents = false;
    }

    return BudgetFactory.createEntry({
      actor,
      project_id,
      account_id,
      amount,
      budget_type_id,
      begin_date,
      end_date,
      modify_parents
    })
  }
}


module.exports = { Budget, BudgetFactory, BudgetConstants }

