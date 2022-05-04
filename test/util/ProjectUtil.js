const { dateToBlockTimestamp } = require('eosjs/dist/eosjs-serialize')
const { createRandomAccount, createRandomName } = require('../../scripts/eosio-util')

const ProjectConstants = {
  type: {
    nnn: "NNN",
    multifamily: "MULTIFAMILY",
    office: "OFFICE",
    industrial: "INDUSTRIAL",
    master_planned_community: "MASTER PLANNED COMMUNITY",
    medical: "MEDICAL",
    hotel: "HOTEL"
  },
  status: {
    awaiting: 1,
    ready: 2,
    investment: 3,
    completed: 4
  },
  entity: {
    investor: "investor",
    developer: "developer",
    fund: "fund"
  },
  investment: {
    pending: 1,
    funding: 2,
    funded: 3
  },
  transfer: {
    awaiting: 1,
    confirmed: 2
  }
}

class ProjectUtil {
  static tokenSymbol = '2,USD'

  static async approveprjct({ owner, project_id, fund_lp, total_fund_offering_amount, total_number_fund_offering, price_per_fund_unit, contract, account }) {
    await contract.approveprjct(owner, project_id, fund_lp, total_fund_offering_amount, total_number_fund_offering, price_per_fund_unit, { authorization: `${account}@active` })
  }

  static async deleteprojct({ owner, project_id, contract, account }) {
    await contract.deleteprojct(owner, project_id, { authorization: `${account}@active` })
  }

  static async changestatus({ project_id, status, contract, account }) {
    await contract.changestatus(project_id, status, { authorization: `${account}@active` })
  }

  static async invest({
    owner,
    project_id,
    total_investment_amount,
    quantity_units_purchased,
    annual_preferred_return,
    signed_agreement_date,
    subscription_package,
    contract,
    account }) {
    await contract.invest(
      owner,
      project_id,
      total_investment_amount,
      quantity_units_purchased,
      annual_preferred_return,
      signed_agreement_date,
      subscription_package, { authorization: `${account}@active` })
  }

  static async editproject({
    owner,
    project_id,
    project_class,
    project_name,
    description,
    total_project_cost,
    debt_financing,
    term,
    interest_rate,
    loan_agreement,
    total_equity_financing,
    total_gp_equity,
    private_equity,
    annual_return,
    project_co_lp,
    project_co_lp_date,
    projected_completion_date,
    projected_stabilization_date,
    anticipated_year_sale_refinance,
    contract,
    account }) {
    await contract.editproject(
      owner,
      project_id,
      project_class,
      project_name,
      description,
      total_project_cost,
      debt_financing,
      term,
      interest_rate,
      loan_agreement,
      total_equity_financing,
      total_gp_equity,
      private_equity,
      annual_return,
      project_co_lp,
      project_co_lp_date,
      projected_completion_date,
      projected_stabilization_date,
      anticipated_year_sale_refinance,
      { authorization: `${account}@active` })
  }

}

class Project {
  constructor(
    owner,
    id,
    project_class,
    project_name,
    description,
    total_project_cost,
    debt_financing,
    term,
    interest_rate,
    loan_agreement,
    total_equity_financing,
    total_gp_equity,
    private_equity,
    annual_return,
    project_co_lp,
    project_co_lp_date,
    projected_completion_date,
    projected_stabilization_date,
    anticipated_year_sale_refinance
  ) {
    this.params = {
      owner,
      id,
      project_class,
      project_name,
      description,
      total_project_cost,
      debt_financing,
      term,
      interest_rate,
      loan_agreement,
      total_equity_financing,
      total_gp_equity,
      private_equity,
      annual_return,
      project_co_lp,
      project_co_lp_date,
      projected_completion_date,
      projected_stabilization_date,
      anticipated_year_sale_refinance
    }
  }

  getCreateActionParams() {

    return [
      this.params.owner,
      this.params.project_class,
      this.params.project_name,
      this.params.description,
      this.params.total_project_cost, // asset
      this.params.debt_financing, // asset
      this.params.term,
      this.params.interest_rate,
      this.params.loan_agreement,
      this.params.total_equity_financing, // asset
      this.params.total_gp_equity, // asset
      this.params.private_equity, // asset
      this.params.annual_return,
      this.params.project_co_lp,
      this.params.project_co_lp_date,
      this.params.projected_completion_date,
      this.params.projected_stabilization_date,
      this.params.anticipated_year_sale_refinance
    ]
  }

  getEditActionParams() {

    return [
      this.params.owner,
      this.params.id,
      this.params.project_class,
      this.params.project_name,
      this.params.description,
      this.params.total_project_cost,
      this.params.debt_financing,
      this.params.term,
      this.params.interest_rate,
      this.params.loan_agreement,
      this.params.total_equity_financing,
      this.params.total_gp_equity,
      this.params.private_equity,
      this.params.annual_return,
      this.params.project_co_lp,
      this.params.project_co_lp_date,
      this.params.projected_completion_date,
      this.params.projected_stabilization_date,
      this.params.anticipated_year_sale_refinance
    ]
  }

  getDeleteActionParams() {

    return [
      this.params.owner,
      this.params.id
    ]
  }

  /**
  *getApproveActionParams() uint64_t project_id,
  *	 string fund_lp,
  *	 asset total_fund_offering_amount,
  *	 uint64_t total_number_fund_offering,
  *	 asset price_per_fund_unit
   */
  getApproveActionParams() {
    return [
      this.params.id,
      this.params.fund_lp,
      this.params.total_fund_offering_amount,
      this.params.total_number_fund_offering,
      this.params.price_per_fund_unit

    ]
  }

}

class ProjectFactory {
  static createEntry({
    owner,
    id,
    project_class,
    project_name,
    description,
    total_project_cost,
    debt_financing,
    term,
    interest_rate,
    loan_agreement,
    total_equity_financing,
    total_gp_equity,
    private_equity,
    annual_return,
    project_co_lp,
    project_co_lp_date,
    projected_completion_date,
    projected_stabilization_date,
    anticipated_year_sale_refinance
  }) {
    return new Project(
      owner,
      id,
      project_class,
      project_name,
      description,
      total_project_cost,
      debt_financing,
      term,
      interest_rate,
      loan_agreement,
      total_equity_financing,
      total_gp_equity,
      private_equity,
      annual_return,
      project_co_lp,
      project_co_lp_date,
      projected_completion_date,
      projected_stabilization_date,
      anticipated_year_sale_refinance
    )
  }

  static async createWithDefaults({
    owner,
    id,
    project_class,
    project_name,
    description,
    total_project_cost,
    debt_financing,
    term,
    interest_rate,
    loan_agreement,
    total_equity_financing,
    total_gp_equity,
    private_equity,
    annual_return,
    project_co_lp,
    project_co_lp_date,
    projected_completion_date,
    projected_stabilization_date,
    anticipated_year_sale_refinance
  }) {

    if (!owner) {
      owner = await createRandomAccount()
    }

    if (!id) {
      id = 0;
    }

    if (!project_class) {
      project_class = "NNN";
    }

    if (!project_name) {
      project_name = createRandomName();
    }

    if (!description) {
      description = "This is a default project";
    }

    if (!total_project_cost) {
      total_project_cost = "435000.00 USD";
    }

    if (!debt_financing) {
      debt_financing = "2000.00 USD";
    }

    if (!term) {
      term = 2;
    }

    if (!interest_rate) {
      interest_rate = 25;
    }

    if (!loan_agreement) {
      loan_agreement = "https://loan-agreement.com";
    }

    if (!total_equity_financing) {
      total_equity_financing = "3000.00 USD";
    }

    if (!total_gp_equity) {
      total_gp_equity = "2100.00 USD";
    }

    if (!private_equity) {
      private_equity = "5000.00 USD";
    }

    if (!annual_return) {
      annual_return = 600;
    }

    if (!project_co_lp) {
      project_co_lp = "https://project-co-lp.com";
    }

    if (!project_co_lp_date) {
      project_co_lp_date = 1583864481;
    }

    if (!projected_completion_date) {
      //ajustar estas fechas con entradas a futuro el lugar de hardcodear
      const completitionDate = Date.now();
      projected_completion_date = 1682400175;
    }

    if (!projected_stabilization_date) {
      //ajustar estas fechas con entradas a futuro el lugar de hardcodear
      projected_stabilization_date = 1714022575;
    }

    if (!anticipated_year_sale_refinance) {
      anticipated_year_sale_refinance = 2023;
    }



    return ProjectFactory.createEntry({
      owner,
      id,
      project_class,
      project_name,
      description,
      total_project_cost,
      debt_financing,
      term,
      interest_rate,
      loan_agreement,
      total_equity_financing,
      total_gp_equity,
      private_equity,
      annual_return,
      project_co_lp,
      project_co_lp_date,
      projected_completion_date,
      projected_stabilization_date,
      anticipated_year_sale_refinance
    })
  }
}


module.exports = { Project, ProjectUtil, ProjectFactory, ProjectConstants }

