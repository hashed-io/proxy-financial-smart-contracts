const assert = require('assert');
const accounts = require('../scripts/accounts.json')
const { names } = require('../scripts/helper')
const projectConfig = require('./config/new_project.json')

function getError (err) {
    return JSON.parse(err).error.details[0].message.replace('assertion failure with message: ', '')
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe("Proxy Capital Projects Contract", function (eoslime) {

    let firstuser = eoslime.Account.load(names.firstuser, accounts[names.firstuser].privateKey, 'active')
    let seconduser = eoslime.Account.load(names.seconduser, accounts[names.seconduser].privateKey, 'active')
    let thirduser = eoslime.Account.load(names.thirduser, accounts[names.thirduser].privateKey, 'active')
    let fourthuser = eoslime.Account.load(names.fourthuser, accounts[names.fourthuser].privateKey, 'active')
    let projects = eoslime.Account.load(names.projects, accounts[names.projects].privateKey, 'active')
    let accountss = eoslime.Account.load(names.accounts, accounts[names.accounts].privateKey, 'active')
    let permissions = eoslime.Account.load(names.permissions, accounts[names.permissions].privateKey, 'active')

    let projectsContract
    let firstuserContract
    let seconduserContract
    let thirduserContract
    let accountssContract
    let permissionsContract
    let fourthuserContract

    before(async () => {

        projectsContract = await eoslime.Contract.at(names.projects, projects)
        firstuserContract = await eoslime.Contract.at(names.projects, firstuser)
        seconduserContract = await eoslime.Contract.at(names.projects, seconduser)
        thirduserContract = await eoslime.Contract.at(names.projects, thirduser)
        fourthuserContract = await eoslime.Contract.at(names.projects, fourthuser)
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

        try {
            await firstuserContract.addproject(
                firstuser.name, 
                projectConfig.project_name + " 2", 
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
        } catch (err) {
            console.log(getError(err))
        }

        await sleep(100);

        try {
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
        } catch (err) {
            console.log(getError(err))
        }

        try {
            await seconduserContract.addproject(
                seconduser.name, 
                projectConfig.project_name + " 2", 
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
                0,
                projectConfig.projected_stabilization_date,
                projectConfig.anticipated_year_sale
            )
        } catch (err) {
            console.log(getError(err))
        }

        try {
            await seconduserContract.addproject(
                seconduser.name, 
                projectConfig.project_name + " 2", 
                projectConfig.description, 
                "10000.0000 EUR",
                projectConfig.debt_financing,
                projectConfig.term,
                projectConfig.interest_rate,
                projectConfig.loan_agreement,
                projectConfig.total_equity_financing,
                projectConfig.total_gp_equity,
                projectConfig.private_equity,
                projectConfig.annual_return,
                projectConfig.project_co_lp,
                0,
                projectConfig.projected_completion_date,
                projectConfig.projected_stabilization_date,
                projectConfig.anticipated_year_sale
            )
        } catch (err) {
            console.log(getError(err))
        }

        await seconduserContract.addproject(
            seconduser.name, 
            projectConfig.project_name + " 2", 
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
        const investorsTable = await projectsContract.investors.limit(10).find()
        const developersTable = await projectsContract.developers.limit(10).find()
        const fundsTable = await projectsContract.funds.limit(10).find()



        // assert.deepEqual(expected, accountsTable, 'The accounts are not right.')
        
        console.log(usersTable)
        console.log(investorsTable)
        console.log(developersTable)
        console.log(fundsTable)
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

        await firstuserContract.invest(firstuser.name, 0, "4000.0000 USD", 40, 700, 832098900, "http://www.agreement.com")
        await firstuserContract.invest(firstuser.name, 0, "3000.0000 USD", 40, 700, 832098900, "http://www.agreement.com")
        await firstuserContract.invest(firstuser.name, 0, "1000.0000 USD", 40, 700, 832098900, "http://www.agreement.com")

        const investmentsTable = await projectsContract.investments.limit(10).find()

        console.log(investmentsTable)

    })

    it('Should approve the investment', async () => {

        await thirduserContract.approveinvst(thirduser.name, 0)
        await thirduserContract.approveinvst(thirduser.name, 1)
        await thirduserContract.approveinvst(thirduser.name, 2)

        const investmentsTable = await projectsContract.investments.limit(10).find()
        
        console.log(investmentsTable)

    })

    it('Should make a transfer', async () => {

        await firstuserContract.maketransfer(firstuser.name, "4000.0000 USD", 0, "http://www.file.com", 128329043820);
        await firstuserContract.maketransfer(firstuser.name, "400.0000 USD", 1, "http://www.file.com", 128329043820);
        await firstuserContract.maketransfer(firstuser.name, "1600.0000 USD", 1, "http://www.file.com", 128329043820);

        const transfersTable = await projectsContract.transfers.limit(10).find()
        const investmentsTable = await projectsContract.investments.limit(10).find()
        
        console.log(investmentsTable)
        console.log(transfersTable)

        await firstuserContract.maketransfer(firstuser.name, "1000.0000 USD", 1, "http://www.file.com", 128329043820);

        const transfersTableAfter = await projectsContract.transfers.limit(10).find()
        const investmentsTableAfter = await projectsContract.investments.limit(10).find()
        
        console.log(investmentsTableAfter)
        console.log(transfersTableAfter)

        try {
            await firstuserContract.maketransfer(firstuser.name, "20.0000 USD", 1, "http://www.file.com", 128329043820);
        } catch (err) {
            console.log(getError(err))
        }

        try {
            await firstuserContract.maketransfer(firstuser.name, "600.0000 USD", 2, "http://www.file.com", 128329043820);
            await firstuserContract.maketransfer(firstuser.name, "700.0000 USD", 2, "http://www.file.com", 128329043820);            
        } catch (err) {
            console.log(getError(err))
        }

        try {
            await fourthuserContract.maketransfer(fourthuser.name, "600.0000 USD", 2, "http://www.file.com", 128329043820);
        } catch (err) {
            console.log(getError(err))
        }

    })



})

