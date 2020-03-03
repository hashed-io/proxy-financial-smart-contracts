const assert = require('assert');
const accounts = require('../scripts/accounts.json')
const { names, currency } = require('../scripts/helper')


describe("Proxy Capital Accounts Contract", function (eoslime) {

    let firstuser = eoslime.Account.load(names.firstuser, accounts[names.firstuser].privateKey, 'active')
    let seconduser = eoslime.Account.load(names.seconduser, accounts[names.seconduser].privateKey, 'active')
    let accountss = eoslime.Account.load(names.accounts, accounts[names.accounts].privateKey, 'active')
    let projects = eoslime.Account.load(names.projects, accounts[names.projects].privateKey, 'active') 

    let firstuserContract;
    let seconduserContract;
    let accountssContract;
    let projectsContract;

    before(async () => {

        firstuserContract = await eoslime.Contract.at(names.accounts, firstuser)
        seconduserContract = await eoslime.Contract.at(names.accounts, seconduser)
        accountssContract = await eoslime.Contract.at(names.accounts, accountss)
        projectsContract = await eoslime.Contract.at(names.projects, projects)

        console.log('reset accounts contract')
        await accountssContract.reset()

        console.log('reset projects contract')
        await projectsContract.reset()

    })

    it('Should create new accounts properly', async () => {

        firstuserContractProjects = await eoslime.Contract.at(names.projects, firstuser)
        await firstuserContractProjects.addproject(firstuser.name, 'test project', 'this is a test', '10.0000 USD')

        // Assets children
        await firstuserContract.addaccount(firstuser.name, 0, 'Liquid Primary', 1, 0, currency)
        await firstuserContract.addaccount(firstuser.name, 0, 'Reserve Account', 1, 0, currency)

        // Equity children
        await firstuserContract.addaccount(firstuser.name, 0, 'Investments', 2, 1, currency)
        await firstuserContract.addaccount(firstuser.name, 0, 'Franklin Johnson', 8, 1, currency)
        await firstuserContract.addaccount(firstuser.name, 0, 'Michelle Wu', 8, 1, currency)

        // Expenses children
        await firstuserContract.addaccount(firstuser.name, 0, 'Development', 3, 2, currency)
        await firstuserContract.addaccount(firstuser.name, 0, 'Marketing', 3, 2, currency)
        await firstuserContract.addaccount(firstuser.name, 0, 'Tech Infrastructure', 3, 2, currency)
        await firstuserContract.addaccount(firstuser.name, 0, 'Travel', 3, 2, currency)

        const expected = [
            {
              account_id: 1,
              parent_id: 0,
              account_name: 'Assets',
              type: 0,
              increase_balance: '0.0000 USD',
              decrease_balance: '0.0000 USD',
              account_symbol: '4,USD'
            },
            {
              account_id: 2,
              parent_id: 0,
              account_name: 'Equity',
              type: 1,
              increase_balance: '0.0000 USD',
              decrease_balance: '0.0000 USD',
              account_symbol: '4,USD'
            },
            {
              account_id: 3,
              parent_id: 0,
              account_name: 'Expenses',
              type: 2,
              increase_balance: '0.0000 USD',
              decrease_balance: '0.0000 USD',
              account_symbol: '4,USD'
            },
            {
              account_id: 4,
              parent_id: 0,
              account_name: 'Income',
              type: 3,
              increase_balance: '0.0000 USD',
              decrease_balance: '0.0000 USD',
              account_symbol: '4,USD'
            },
            {
              account_id: 5,
              parent_id: 0,
              account_name: 'Liabilities',
              type: 4,
              increase_balance: '0.0000 USD',
              decrease_balance: '0.0000 USD',
              account_symbol: '4,USD'
            },
            {
              account_id: 6,
              parent_id: 1,
              account_name: 'Liquid Primary',
              type: 0,
              increase_balance: '0.0000 USD',
              decrease_balance: '0.0000 USD',
              account_symbol: '4,USD'
            },
            {
              account_id: 7,
              parent_id: 1,
              account_name: 'Reserve Account',
              type: 0,
              increase_balance: '0.0000 USD',
              decrease_balance: '0.0000 USD',
              account_symbol: '4,USD'
            },
            {
              account_id: 8,
              parent_id: 2,
              account_name: 'Investments',
              type: 1,
              increase_balance: '0.0000 USD',
              decrease_balance: '0.0000 USD',
              account_symbol: '4,USD'
            },
            {
              account_id: 9,
              parent_id: 8,
              account_name: 'Franklin Johnson',
              type: 1,
              increase_balance: '0.0000 USD',
              decrease_balance: '0.0000 USD',
              account_symbol: '4,USD'
            },
            {
              account_id: 10,
              parent_id: 8,
              account_name: 'Michelle Wu',
              type: 1,
              increase_balance: '0.0000 USD',
              decrease_balance: '0.0000 USD',
              account_symbol: '4,USD'
            },
            {
              account_id: 11,
              parent_id: 3,
              account_name: 'Development',
              type: 2,
              increase_balance: '0.0000 USD',
              decrease_balance: '0.0000 USD',
              account_symbol: '4,USD'
            },
            {
              account_id: 12,
              parent_id: 3,
              account_name: 'Marketing',
              type: 2,
              increase_balance: '0.0000 USD',
              decrease_balance: '0.0000 USD',
              account_symbol: '4,USD'
            },
            {
              account_id: 13,
              parent_id: 3,
              account_name: 'Tech Infrastructure',
              type: 2,
              increase_balance: '0.0000 USD',
              decrease_balance: '0.0000 USD',
              account_symbol: '4,USD'
            },
            {
              account_id: 14,
              parent_id: 3,
              account_name: 'Travel',
              type: 2,
              increase_balance: '0.0000 USD',
              decrease_balance: '0.0000 USD',
              account_symbol: '4,USD'
            }
          ]          

        const provider = eoslime.Provider
        const accountsTable = await provider.select('accounts').from(names.accounts).scope('0').limit(20).find()

        assert.deepEqual(expected, accountsTable, 'The accounts are not right.')

    })

})


