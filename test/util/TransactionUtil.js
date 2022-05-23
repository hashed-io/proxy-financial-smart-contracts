const { createRandomAccount, createRandomName } = require('../../scripts/eosio-util')
const { generate_title, generate_description, generate_long_text, generate_cid, generate_name } = require('./lorem')


const Flag = {
  remove: 0,
  create: 1,
  edit: 2
}

const DrawdownState = {
  daft: 0,
  submitted: 1,
  reviewed: 2,
  approved: 3
}

/*
struct transaction_param
    {
      uint64_t id;
      uint64_t date;
      std::vector<transaction_amount> amounts;
      std::string description;
      std::vector<transaction_subtypes> accounting;
      std::vector<url_information> supporting_files;
      uint64_t flag;
    };

*/
class TransactionstUtil {
  static tokenSymbol = '2,USD'

  static async delete_transaction({ 
    actor, 
    project_id, 
    transaction_id }) {
    await contract.delete_transaction(
      actor, 
      project_id, 
      transaction_id, 
      { authorization: `${account}@active` })
  }
}

class Transaction {
  constructor(
    id,
    date,
    amounts,
    description,
    supporting_files,
    flag
  ) {
    this.params = {
      id,
      date,
      amounts,
      description,
      supporting_files,
      flag
    }
  }
  getCreateParams() {
    return [{
      id: this.params.id,
      date: this.params.date,
      amounts: this.params.amounts,
      description: this.params.description,
      supporting_files: this.params.supporting_files,
      flag: this.params.flag
    }]
  }
  


}

class TransactionFactory {
  static createEntry({
    id,
    date,
    amounts,
    description,
    supporting_files,
    flag
  }) {
    return new Transaction(
      id,
      date,
      amounts,
      description,
      supporting_files,
      flag
    )
  }

  static async createWithDefaults({
    id,
    date,
    amounts,
    description,
    supporting_files,
    flag
  }) {

    if (!id) { id = 0 }
    if (!date) { date = 1636610400 }
    // ! note, make sure the amount is a number greater than 100, otherwise tests will fail
    if (!amounts) { amounts = [{ account_id: 6, amount: 1000 }] }
    if (!description) { description = await generate_description(5) }
    if (!supporting_files) {
      supporting_files = [{
        filename: await generate_title(3),
        address: await generate_cid()
      }]
    }

    if (!flag) { flag = Flag.create }

    return TransactionFactory.createEntry({
      id,
      date,
      amounts,
      description,
      supporting_files,
      flag
    })
  }
}


module.exports = { Transaction, TransactionFactory, Flag, DrawdownState, TransactionstUtil}
