const assert = require('assert');
const accounts = require('../scripts/accounts.json')
const { names, DEBIT, CREDIT, CURRENCY } = require('../scripts/helper')

function getError (err) {
    return JSON.parse(err).error.details[0].message.replace('assertion failure with message: ', '')
}

describe("EOSIO Token", function (eoslime) {

    // Increase mocha(testing framework) time, otherwise tests fails
    this.timeout(15000);

    let firstuser = eoslime.Account.load(names.firstuser, accounts[names.firstuser].privateKey, 'active')
    let seconduser = eoslime.Account.load(names.seconduser, accounts[names.seconduser].privateKey, 'active')
    let transactions = eoslime.Account.load(names.transactions, accounts[names.transactions].privateKey, 'active')

    let transactionsContract;
    let firstuserContract;
    let seconduserContract;

    before(async () => {

        transactionsContract = await eoslime.Contract.at(names.transactions, transactions)
        firstuserContract = await eoslime.Contract.at(names.transactions, firstuser)
        seconduserContract = await eoslime.Contract.at(names.transactions, seconduser)

        console.log('reset transactions contract')
        await transactionsContract.reset();

    })

    // it('Should create accounts properly', async () => {

    //     await seconduserContract.addaccount(seconduser.name, 0, 'Assets', 0, DEBIT, CURRENCY)

    //     try {
    //         await firstuserContract.addaccount(firstuser.name, 0, 'Assets', 0, DEBIT, CURRENCY)
    //     } catch (err) {
    //         assert.deepEqual(transactions.name + ': the name of the account already exists.', getError(err))
    //     }

    //     await seconduserContract.addaccount(seconduser.name, 0, 'Liquid Primary', 1, DEBIT, CURRENCY)
    //     await seconduserContract.addaccount(seconduser.name, 0, 'Reserve Account', 1, DEBIT, CURRENCY)

    //     try {
    //         await firstuserContract.addaccount(firstuser.name, 0, 'Distinct account type', 1, CREDIT, CURRENCY)
    //     } catch (err) {
    //         assert.deepEqual(transactions.name + ': the child account must have the same type as its parent\'s.', getError(err))
    //     }

    //     try {
    //         await firstuserContract.addaccount(firstuser.name, 0, 'Not existing parent account', 10, CREDIT, CURRENCY)
    //     } catch (err) {
    //         assert.deepEqual(transactions.name + ': the parent does not exist.', getError(err))
    //     }

    //     try {
    //         await firstuserContract.addaccount(firstuser.name, 10, 'Not existing project', 0, CREDIT, CURRENCY)
    //     } catch (err) {
    //         assert.deepEqual(transactions.name + ': the project where the account is trying to be placed does not exist.', getError(err))
    //     }

    //     await seconduserContract.addaccount(seconduser.name, 0, 'Equity', 0, CREDIT, CURRENCY)
    //     await seconduserContract.addaccount(seconduser.name, 0, 'Investments', 4, CREDIT, CURRENCY)
    //     await seconduserContract.addaccount(seconduser.name, 0, 'Franklin Johnson', 5, CREDIT, CURRENCY)
    //     await seconduserContract.addaccount(seconduser.name, 0, 'Michelle Wu', 5, CREDIT, CURRENCY)

    // })

    // it('Should create transactions properly', async () => {

    //     await firstuserContract.transact(firstuser.name, '')

    // })
   
});





