const { createRandomAccount, createRandomName } = require('../../scripts/eosio-util')
const { generate_title, generate_description, generate_supporting_file, generate_long_text, generate_cid, generate_name } = require('./lorem')


const TransactionConstants = {
  flag: {
    remove: 0,
    create: 1,
    edit: 2
  },
  drawdownState: {
    daft: 0,
    submitted: 1,
    reviewed: 2,
    approved: 3
  },
  type_str: {
    devEquity: "Developer Equity",
    consLoan: "Construction Loan",
    eb5: "EB-5"
  },
  type: {
    devEquity: "devequity",
    consLoan: "constrcloan",
    eb5: "eb5"
  }
}

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
      supporting_files = [
        await generate_supporting_file()
      ]
    }

    if (flag == 0) {
      flag = Flag.remove
    } else if (!flag) {
      flag = Flag.create
    }

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

class bulkTransaction {
  constructor(
    supporting_files,
    description,
    date,
    amount,
    add_file
  ) {
    this.params = [{
      supporting_files,
      description,
      date,
      amount,
      add_file
    }]
  }
  getCreateParams() {
    return [{
      supporting_files: this.params.supporting_files,
      description: this.params.description,
      date: this.params.date,
      amount: this.params.amount,
      add_file: this.params.add_file
    }]
  }



}

class bulkTransactionFactory {
  static createEntry({
    supporting_files,
    description,
    date,
    amount,
    add_file
  }) {
    return new bulkTransaction(
      supporting_files,
      description,
      date,
      amount,
      add_file
    )
  }

  static async createWithDefaults({
    supporting_files,
    description,
    date,
    amount,
    add_file
  }) {

    if (!supporting_files) {
      supporting_files = [
        await generate_supporting_file(),
        await generate_supporting_file(),
        await generate_supporting_file()
      ]
    }

    if (!description) { description = await generate_description(5) }

    if (!date) { date = Date.now() }

    if (!amount) { amount = "200.00 USD" }


    if (add_file == 0) {
      add_file = Flag.remove
    } else if (!add_file) {
      add_file = Flag.create
    }

    return bulkTransactionFactory.createEntry({
      supporting_files,
      description,
      date,
      amount,
      add_file
    })
  }
}

module.exports = { TransactionConstants, bulkTransaction, bulkTransactionFactory, Transaction, TransactionFactory, Flag, DrawdownState, TransactionstUtil }
