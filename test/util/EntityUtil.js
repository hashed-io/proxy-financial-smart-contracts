const { createRandomAccount, createRandomName } = require('../../scripts/eosio-util')

const Roles = {
  investor: "investor",
  developer: "developer",
  fund: "fund"
}

class Entity {
  constructor(
    actor,
    entity_name,
    description,
    type
  ) {
    this.params = {
      actor,
      entity_name,
      description,
      type
    }
  }

  getActionParams() {

    return [
      this.params.actor,
      this.params.entity_name,
      this.params.description,
      this.params.type
    ]
  }

}

class EntityFactory {
  static createEntry({
    actor,
    entity_name,
    description,
    type
  }) {
    return new Entity(
      actor,
      entity_name,
      description,
      type
    )
  }

  static async createWithDefaults({
    actor,
    entity_name,
    description,
    type
  }) {

    if (!actor) {
      actor = await createRandomAccount()
    }

    if (!entity_name) { 
      entity_name = createRandomName() 
    }

    if (!description) {
      description = "A test entity for " + type.toString()
    }

    if (!type) {
      type = Roles.developer
    }

    return EntityFactory.createEntry({
      actor,
      entity_name,
      description,
      type
    })
  }
}


module.exports = { Entity, EntityFactory, EntityConstants: Roles }
