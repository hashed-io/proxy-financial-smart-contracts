const assert = require('assert');
const accounts = require('../scripts/accounts.json')
const { names } = require('../scripts/helper')

function getError (err) {
    return JSON.parse(err).error.details[0].message.replace('assertion failure with message: ', '')
}


describe("Proxy Capital Projects Contract", function (eoslime) {

    let firstuser = eoslime.Account.load(names.firstuser, accounts[names.firstuser].privateKey, 'active')
    let seconduser = eoslime.Account.load(names.seconduser, accounts[names.seconduser].privateKey, 'active')
    let projects = eoslime.Account.load(names.projects, accounts[names.projects].privateKey, 'active')
    let accountss = eoslime.Account.load(names.accounts, accounts[names.accounts].privateKey, 'active')

    let projectsContract;
    let firstuserContract;
    let seconduserContract;
    let accountssContract;

    before(async () => {

        projectsContract = await eoslime.Contract.at(names.projects, projects)
        firstuserContract = await eoslime.Contract.at(names.projects, firstuser)
        seconduserContract = await eoslime.Contract.at(names.projects, seconduser)
        accountssContract = await eoslime.Contract.at(names.accounts, accountss)

        console.log('reset projects contract')
        await projectsContract.reset()

        console.log('reset accounts contract')
        await accountssContract.reset()

    })

    it('Should create the projects properly', async () => {

        await firstuserContract.addproject(firstuser.name, 'test project', 'this is a test', '10.0000 USD')

        try {
            await seconduserContract.addproject(seconduser.name, 'test project', 'this is a test', '10.0000 USD')
        } catch(err) {
            assert.deepEqual(projects.name + ': there is already a project with that name.', getError(err))
        }

        const initialProjects = await projectsContract.projects.limit(10).find();

        const expected = [
            {
              project_id: 0,
              owner: firstuser.name,
              project_name: 'test project',
              description: 'this is a test',
              initial_goal: '10.0000 USD'
            }
        ]

        assert.deepEqual(expected, initialProjects, 'The initial projects are not right.')
          
    })
})


