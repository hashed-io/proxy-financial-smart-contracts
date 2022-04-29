const { createRandomAccount, createRandomName } = require('../../scripts/eosio-util')

const Roles = {
  investor: "investor",
  developer: "developer",
  fund: "fund"
}

class User {
  constructor(
    actor,
    user_name,
    entity_id,
    role,
    related_projects
  ) {
    this.params = {
      actor,
      user_name,
      entity_id,
      role,
      related_projects
    }
  }

  getActionParams() {

    return [
      this.params.actor,
      this.params.entity_name,
      this.params.description,
      this.params.role  
    ]
  }

}

class UserFactory {
  static createEntry({
    actor,
    entity_name,
    description,
    role
  }) {
    return new User(
      actor,
      entity_name,
      description,
      role
    )
  }

  static async createWithDefaults({
    actor,
    entity_name,
    description,
    role
  }) {

    if (!actor) {
      actor = await createRandomAccount()
    }

    if (!entity_name) { 
      entity_name = createRandomName() 
    }

    if (!description) {
      description = `A test entity for ${role.toString()} role`
    }

    if (!role) {
      role = Roles.developer
    }

    return UserFactory.createEntry({
      actor,
      entity_name,
      description,
      role
    })
  }
}


module.exports = { User, UserFactory, Roles }
