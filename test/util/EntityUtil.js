const { createRandomAccount, createRandomName } = require('../../scripts/eosio-util')

const Roles = {
  investor: "investor",
  developer: "developer",
  fund: "fund",
  issuer: 'issuer',
  regional:'regionalcrt'
}

class Entity {
  constructor(
    actor,
    entity_name,
    description,
    role
  ) {
    this.params = {
      actor,
      entity_name,
      description,
      role
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

class EntityFactory {
  static createEntry({
    actor,
    entity_name,
    description,
    role
  }) {
    return new Entity(
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
      description = `A test entity for ${role.toString()}`
    }

    if (!role) {
      role = Roles.developer
    }

    return EntityFactory.createEntry({
      actor,
      entity_name,
      description,
      role
    })
  }
}


module.exports = { Entity, EntityFactory, EntityConstants: Roles }
