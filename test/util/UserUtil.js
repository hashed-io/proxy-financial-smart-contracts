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
    role
  ) {
    this.params = {
      account,
      user_name,
      role
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
    role
  }) {
    return new User(
      account,
      user_name,
      role
    )
  }

  static async createWithDefaults({
    account,
    user_name,
    role
  }) {

    if (!account) {
      account = await createRandomAccount()
    }
    if (!user_name) {
      user_name = await generate_name()
    }
    if (!role) {
      role = Roles.developer
    }


    return UserFactory.createEntry({
      account,
      user_name,
      role
    })
  }
}


module.exports = { User, UserFactory, Roles }
