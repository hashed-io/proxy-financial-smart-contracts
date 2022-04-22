const { assertError } = require('../../scripts/eosio-errors')
const { rpc } = require('../../scripts/eos')

class ProjectsUtil {

  // static tokenCode = 'BANK'
  // static tokenPrecision = 4

  static async addentity ({ actor, entity_name, description, type, contract }) {
    try {
      await contract.addentity(actor, entity_name, description, type, { authorization: `${actor}@active` })
    } catch (error) {
      assertError({
        error,
        textInside: 'entity already exists',
        verbose: false
      })
    }
  }
}

module.exports = {ProjectsUtil}
