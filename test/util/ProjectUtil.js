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

  static async approveprjct({ actor, project_id, fund_lp, total_fund_offering_amount, total_number_fund_offering, price_per_fund_unit, contract, account }) {
    await contract.approveprjct(actor, project_id, fund_lp, total_fund_offering_amount, total_number_fund_offering, price_per_fund_unit, { authorization: `${account}@active` })
  }

  static async deleteprojct({ actor, project_id, contract, account }) {
    await contract.deleteprojct(actor, project_id, { authorization: `${account}@active` })
  }

  static async changestatus({ project_id, status, contract, account }) {
    await contract.changestatus(project_id, status, { authorization: `${account}@active` })
  }

  static async invest({
    actor,
    project_id,
    total_investment_amount,
    quantity_units_purchased,
    annual_preferred_return,
    signed_agreement_date,
    subscription_package,
    contract,
    account }) {
    await contract.invest(
      actor,
      project_id,
      total_investment_amount,
      quantity_units_purchased,
      annual_preferred_return,
      signed_agreement_date,
      subscription_package, { authorization: `${account}@active` })
  }

  static async editinvest({
    actor,
    investment_id,
    total_investment_amount,
    quantity_units_purchased,
    annual_preferred_return,
    signed_agreement_date,
    subscription_package,
    contract,
    account }) {
    await contract.editinvest(
      actor,
      investment_id,
      total_investment_amount,
      quantity_units_purchased,
      annual_preferred_return,
      signed_agreement_date,
      subscription_package, { authorization: `${account}@active` })
  }

  static async maketransfer({
    actor,
    amount,  
    investment_id,  
    proof_of_transfer,  
    transfer_date,
    contract,
    account }) {
    await contract.maketransfer(
      actor,
      amount,  
      investment_id,  
      proof_of_transfer,  
      transfer_date, { authorization: `${account}@active` })
  }

  static async edittransfer({
    actor,
    transfer_id,
    amount,   
    proof_of_transfer,  
    date,
    contract,
    account }) {
    await contract.edittransfer(
      actor,
      transfer_id,
      amount,    
      proof_of_transfer,  
      date, { authorization: `${account}@active` })
  }

  static async confrmtrnsfr({
    actor,
    transfer_id,
    proof_of_transfer,
    contract,
    account}) {
    await contract.confrmtrnsfr(
      actor,
      transfer_id,
      proof_of_transfer, { authorization: `${account}@active` })
  }

  static async editproject({
    actor,
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
      actor,
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
    actor,
    project_name,
    ipfs,
    description,
    image,
    projected_starting_date,
    projected_completion_date
  ) {
    this.params = {
      actor,
      project_name,
      ipfs,
      description,
      image,
      projected_starting_date,
      projected_completion_date
    }
  }

  getCreateActionParams() {

    return [
      this.params.actor,
      this.params.project_name,
      this.params.ipfs,
      this.params.description,
      this.params.image,
      this.params.projected_starting_date,
      this.params.projected_completion_date
    ]
  }

  getEditActionParams() {

    return [
      this.params.actor,
      this.params.project_name,
      this.params.ipfs,
      this.params.description,
      this.params.image,
      this.params.projected_starting_date,
      this.params.projected_completion_date
    ]
  }

  getDeleteActionParams() {
    return [
      this.params.actor,
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
      this.params.fund_lp,
      this.params.total_fund_offering_amount,
      this.params.total_number_fund_offering,
      this.params.price_per_fund_unit

    ]
  }

}

class ProjectFactory {
  static createEntry({
    actor,
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
      actor,
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
    actor,
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

    if (!actor) {
      actor = await createRandomAccount()
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
      actor,
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

