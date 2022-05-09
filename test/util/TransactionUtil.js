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
    if (!amounts) { amounts = [{ account_id: 6, amount: 10 }] }
    if (!description) { description = 'descrip' }
    if (!supporting_files) {
      supporting_files = [{
        filename: 'lorem_ipsum',
        address: 'bafk...'
      }]
    }
    // debido a esata conddicion, si mandamos flag.remove = 0, lo tomarà como falso
    // y devolverà uno. 
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


module.exports = { Transaction, TransactionFactory, Flag }
