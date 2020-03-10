const assert = require('assert');
const accounts = require('../scripts/accounts.json')
const { names } = require('../scripts/helper')
const projectConfig = require('./config/new_project.json')

function getError (err) {
    return JSON.parse(err).error.details[0].message.replace('assertion failure with message: ', '')
}


describe("Proxy Capital Projects Contract", function (eoslime) {

    let firstuser = eoslime.Account.load(names.firstuser, accounts[names.firstuser].privateKey, 'active')
    let seconduser = eoslime.Account.load(names.seconduser, accounts[names.seconduser].privateKey, 'active')
    let thirduser = eoslime.Account.load(names.thirduser, accounts[names.thirduser].privateKey, 'active')
    let projects = eoslime.Account.load(names.projects, accounts[names.projects].privateKey, 'active')
    let accountss = eoslime.Account.load(names.accounts, accounts[names.accounts].privateKey, 'active')
    let permissions = eoslime.Account.load(names.permissions, accounts[names.permissions].privateKey, 'active')

    let projectsContract
    let firstuserContract
    let seconduserContract
    let thirduserContract
    let accountssContract
    let permissionsContract

    before(async () => {

        projectsContract = await eoslime.Contract.at(names.projects, projects)
        firstuserContract = await eoslime.Contract.at(names.projects, firstuser)
        seconduserContract = await eoslime.Contract.at(names.projects, seconduser)
        thirduserContract = await eoslime.Contract.at(names.projects, thirduser)
        accountssContract = await eoslime.Contract.at(names.accounts, accountss)
        permissionsContract = await eoslime.Contract.at(names.permissions, permissions)

        console.log('reset permissions contract')
        await permissionsContract.reset()

        console.log('reset projects contract')
        await projectsContract.reset()

        console.log('reset accounts contract')
        await accountssContract.reset()

    })

    it('Should create the project', async () => {
        
        await seconduserContract.addproject(
            seconduser.name, 
            projectConfig.project_name, 
            projectConfig.description, 
            projectConfig.total_project_cost,
            projectConfig.debt_financing,
            projectConfig.term,
            projectConfig.interest_rate,
            projectConfig.loan_agreement,
            projectConfig.total_equity_financing,
            projectConfig.total_gp_equity,
            projectConfig.private_equity,
            projectConfig.annual_return,
            projectConfig.project_co_lp,
            projectConfig.project_co_lp_date,
            projectConfig.projected_completion_date,
            projectConfig.projected_stabilization_date,
            projectConfig.anticipated_year_sale
        )

        const projectsTableBeforeApproval = await projectsContract.projects.limit(10).find()
        const usersTable = await projectsContract.users.limit(10).find()
        
        console.log(usersTable)
        console.log(projectsTableBeforeApproval)
        
    })

    it('Should approve the project', async () => {

        await thirduserContract.approveprjct(
            thirduser.name,
            0,
            projectConfig.fund_lp,
            projectConfig.total_fund_offering_amount,
            projectConfig.total_number_fund_offering,
            projectConfig.price_per_fund_unit
        )

        const projectsTableAfterApproval = await projectsContract.projects.limit(10).find()

        console.log(projectsTableAfterApproval)

    })

    it('Should make an investment', async () => {



    })
})


