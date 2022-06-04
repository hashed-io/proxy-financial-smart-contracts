const { dateToBlockTimestamp } = require('eosjs/dist/eosjs-serialize')
const { createRandomAccount, createRandomName } = require('../../scripts/eosio-util')
const { generate_title, generate_description, generate_long_text, generate_cid, generate_name } = require('./lorem')


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

  static async approveprjct({ actor, project_id, contract, account }) {
    await contract.approveprjct(actor, project_id, { authorization: `${account}@active` })
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
    account }) {
    await contract.confrmtrnsfr(
      actor,
      transfer_id,
      proof_of_transfer, { authorization: `${account}@active` })
  }


  static async editproject({
    actor,
    project_id,
    project_name,
    description,
    image,
    projected_starting_date,
    projected_completion_date }) {
    await contract.editproject(
      actor,
      project_id,
      project_name,
      description,
      image,
      projected_starting_date,
      projected_completion_date,
      { authorization: `${account}@active` })
  }

}

class Project {
  constructor(
    actor,
    project_name,
    description,
    image,
    projected_starting_date,
    projected_completion_date
  ) {
    this.params = {
      actor,
      project_name,
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
      this.params.description,
      this.params.image,
      this.params.projected_starting_date,
      this.params.projected_completion_date
    ]
  }

  getEditActionParams() {

    return [
      this.params.project_name,
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

  getApproveActionParams() {
    return [
    ]
  }

}

class ProjectFactory {
  static createEntry({
    actor,
    project_name,
    description,
    image,
    projected_starting_date,
    projected_completion_date
  }) {
    return new Project(
      actor,
      project_name,
      description,
      image,
      projected_starting_date,
      projected_completion_date
    )
  }

  static async createWithDefaults({
    actor,
    project_name,
    description,
    image,
    projected_starting_date,
    projected_completion_date
  }) {

    if (!actor) {
      actor = await createRandomAccount()
    }

    if (!project_name) {
      project_name = await generate_title(3);
    }

    if (!description) {
      description = await generate_description(5);
    }

    if (!image) {
      image = await generate_cid();
    }

    if (!projected_starting_date) {
      projected_starting_date = Date.now();
    }

    if (!projected_completion_date) {
      projected_completion_date = 1714022575;
    }

    return ProjectFactory.createEntry({
      actor,
      project_name,
      description,
      image,
      projected_starting_date,
      projected_completion_date
    })
  }
}


module.exports = { Project, ProjectUtil, ProjectFactory, ProjectConstants }

