const assert = require('assert');
const accounts = require('../scripts/accounts.json')
const { names, DEBIT, CREDIT, CURRENCY } = require('../scripts/helper')

function getError (err) {
    return JSON.parse(err).error.details[0].message.replace('assertion failure with message: ', '')
}


describe("EOSIO Token", function (eoslime) {

    let firstuser = eoslime.Account.load(names.firstuser, accounts[names.firstuser].privateKey, 'active')
    let seconduser = eoslime.Account.load(names.seconduser, accounts[names.seconduser].privateKey, 'active')
    let projects = eoslime.Account.load(names.projects, accounts[names.projects].privateKey, 'active')

    let projectsContract;
    let firstuserContract;
    let seconduserContract;

    before(async () => {

        projectsContract = await eoslime.Contract.at(names.projects, projects)
        firstuserContract = await eoslime.Contract.at(names.projects, firstuser)
        seconduserContract = await eoslime.Contract.at(names.projects, seconduser)

        console.log('reset projects contract')
        await projectsContract.reset();

    })

    it('Should create the projects properly', async () => {

        await firstuserContract.addproject(firstuser.name, 'test project', 'this is a test', '10.0000 USD');

        try {
            await seconduserContract.addproject(seconduser.name, 'test project', 'this is a test', '10.0000 USD');
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


