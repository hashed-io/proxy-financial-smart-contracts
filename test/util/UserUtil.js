const { createRandomAccount, createRandomName } = require('../../scripts/eosio-util')
const { generate_name, generate_description } = require('./lorem')

const Roles = {
  investor: "investor",
  developer: "developer",
  fund: "fund",
  issuer: "issuer",
  regional_center: "regionalcrt"
}

class User {
  constructor(
    account,
    user_name,
    entity_id,
    role,
    related_projects,
    description
  ) {
    this.params = {
      account,
      user_name,
      entity_id,
      role,
      related_projects,
      description
    }
  }
  getCreateParams() {
    return [
      this.params.account,
      this.params.user_name,
      this.params.role
    ]
  }



}

class UserFactory {
  static createEntry({
    account,
    user_name,
    entity_id,
    role,
    related_projects,
    description
  }) {
    return new User(
      account,
      user_name,
      entity_id,
      role,
      related_projects,
      description
    )
  }

  static async createWithDefaults({
    account,
    user_name,
    entity_id,
    role,
    related_projects,
    description
  }) {

    if (!account) {
      account = await createRandomAccount()
    }

    if (!user_name) {
      user_name = await generate_name()
    }

    if (!entity_id) {
      entity_id = 0
    }

    if (!role) {
      role = Roles.developer
    }

    if (!related_projects) {
      related_projects = []
    }

    if (!description) {
      description = await generate_description(3)
    }

    return UserFactory.createEntry({
      account,
      user_name,
      entity_id,
      role,
      related_projects,
      description
    })
  }
}


module.exports = { User, UserFactory, Roles }
