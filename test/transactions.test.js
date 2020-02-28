const assert = require('assert');
const accounts = require('../scripts/accounts.json')

const DEBIT = 0
const CREDIT = 1

function getError (err) {
    return JSON.parse(err).error.details[0].message.replace('assertion failure with message: ', '')
}

describe("EOSIO Token", function (eoslime) {

    // Increase mocha(testing framework) time, otherwise tests fails
    this.timeout(15000);

    let firstuser = eoslime.Account.load('firstuser', accounts['firstuser'].privateKey, 'active')
    let seconduser = eoslime.Account.load('seconduser', accounts['seconduser'].privateKey, 'active')
    let transactions = eoslime.Account.load('transactions', accounts['transactions'].privateKey, 'active')

    let transactionsContract;
    let firstuserContract;
    let seconduserContract;

    before(async () => {

        transactionsContract = await eoslime.Contract.at('transactions', transactions)
        firstuserContract = await eoslime.Contract.at('transactions', firstuser)
        seconduserContract = await eoslime.Contract.at('transactions', seconduser)

        console.log('reset transactions contract')
        await transactionsContract.reset();

    })

    it('Should create the projects properly', async () => {

        await firstuserContract.addproject(firstuser.name, 'test project', 'this is a test', '10.0000 USD');

        try {
            await seconduserContract.addproject(seconduser.name, 'test project', 'this is a test', '10.0000 USD');
        } catch(err) {
            assert.deepEqual('proxycap: there is a project with that name.', getError(err))
        }

        const initialProjects = await transactionsContract.projects.limit(10).find();

        const expected = [
            {
              project_id: 0,
              owner: 'firstuser',
              project_name: 'test project',
              description: 'this is a test',
              initial_goal: '10.0000 USD'
            }
        ]

        assert.deepEqual(expected, initialProjects, 'The initial projects are not right.')
          
    })

    it('Should create accounts properly', async () => {

        await seconduserContract.addaccount(seconduser.name, 0, 'Assets', 0, DEBIT, '4,USD')

        try {
            await firstuserContract.addaccount(firstuser.name, 0, 'Assets', 0, DEBIT, '4,USD')
        } catch (err) {
            assert.deepEqual('proxycap: the name of the account already exists.', getError(err))
        }

        await seconduserContract.addaccount(seconduser.name, 0, 'Equity', 0, CREDIT, '4,USD')

    })
   
});





