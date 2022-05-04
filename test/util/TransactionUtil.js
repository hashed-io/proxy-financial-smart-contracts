const { createRandomAccount, createRandomName } = require('../../scripts/eosio-util')

const Flag = {
  remove: 0,
  create: 1,
  edit: 2
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
class Transaction {
  constructor(
    id,
    date,
    amounts,
    description,
    accounting,
    supporting_files,
    flag
  ) {
    this.params = {
      id,
      date,
      amounts,
      description,
      accounting,
      supporting_files,
      flag
    }
  }
  getCreateParams() {
    return [
      this.params.id,
      this.params.date,
      this.params.amounts,
      this.params.description,
      this.params.accounting,
      this.params.supporting_files,
      this.params.flag
    ]
  }



}

class TransactionFactory {
  static createEntry({
    id,
    date,
    amounts,
    description,
    accounting,
    supporting_files,
    flag
  }) {
    return new Transaction(
      id,
      date,
      amounts,
      description,
      accounting,
      supporting_files,
      flag
    )
  }

  static async createWithDefaults({
    id,
    date,
    amounts,
    description,
    accounting,
    supporting_files,
    flag
  }) {

    if (!id) { id = -1 }
    if (!date) { date = 1714022575 }
    if (!amounts) { amounts = [{ account_id: -1, amount: "200.00" }] }
    if (!description) { description = createRandomName() }
    if (!accounting) { accounting = [{ account_id: -1, amount: "200.00" }] }
    if (!supporting_files) {
      supporting_files = [{
        filename: 'lorem_ipsum',
        address: 'bafk...'
      }]
    }
    if (!flag) { flag = Flag.create }

    return TransactionFactory.createEntry({
      id,
      date,
      amounts,
      description,
      accounting,
      supporting_files,
      flag
    })
  }
}


module.exports = { Transaction, TransactionFactory, Flag }
