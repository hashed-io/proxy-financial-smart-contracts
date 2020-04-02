const assert = require('assert');
const accounts = require('../scripts/accounts.json')
const { names } = require('../scripts/helper')
const projectConfig = require('./config/new_project.json')

function getError(err) {
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
            projectConfig.project_class,
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
            projectConfig.anticipated_year_sale_refinance
        )

        try {
            await firstuserContract.addproject(
                firstuser.name,
                projectConfig.project_class,
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
                projectConfig.anticipated_year_sale_refinance
            )
        } catch (err) {
            assert.deepEqual(getError(err), "proxycapproj: the user type must be Developer to do this.", 'Something else went wrong.')
        }

        await sleep(100);

        try {
            await seconduserContract.addproject(
                seconduser.name,
                projectConfig.project_class,
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
                projectConfig.anticipated_year_sale_refinance
            )
        } catch (err) {
            assert.deepEqual(getError(err), "proxycapproj: there is already a project with that name.", 'Something else went wrong.')
        }

        try {
            await seconduserContract.addproject(
                seconduser.name,
                projectConfig.project_class,
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
                projectConfig.anticipated_year_sale_refinance
            )
        } catch (err) {
            assert.deepEqual(getError(err), "proxycapproj: the date can not be earlier than now.", 'Something else went wrong.')
        }

        try {
            await seconduserContract.addproject(
                seconduser.name,
                projectConfig.project_class,
                projectConfig.project_name + " 2",
                projectConfig.description,
                "10000.00 EUR",
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
                projectConfig.anticipated_year_sale_refinance
            )
        } catch (err) {
            assert.deepEqual(getError(err), names.projects + ": the symbols must be the same. 10000.00 EUR. amount symbol:EUR!=USD", 'Something else went wrong.')
        }

        await seconduserContract.addproject(
            seconduser.name,
            projectConfig.project_class,
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
            projectConfig.anticipated_year_sale_refinance
        )


        let projectsTableBeforeApproval = await projectsContract.projects.limit(10).find()
        const usersTable = await projectsContract.users.limit(10).find()
        const investorsTable = await projectsContract.investors.limit(10).find()
        const developersTable = await projectsContract.developers.limit(10).find()
        const fundsTable = await projectsContract.funds.limit(10).find()

        const expectedUsersTable = [
            {
                account: 'developerco1',
                user_name: 'Developer Co.',
                entity_id: 0,
                type: 'Developer'
            },
            {
                account: 'fundusr11111',
                user_name: 'Fund',
                entity_id: 0,
                type: 'Fund'
            },
            {
                account: 'investorusr1',
                user_name: 'Investor 1',
                entity_id: 0,
                type: 'Investor'
            },
            {
                account: 'investorusr2',
                user_name: 'Investor 2',
                entity_id: 1,
                type: 'Investor'
            }
        ]

        const expectedInvestorsTable = [
            {
                investor_id: 0,
                description: 'Test description for investor Investor 1'
            },
            {
                investor_id: 1,
                description: 'Test description for investor Investor 2'
            }
        ]

        const expectedDevelopersTable = [
            {
                developer_id: 0,
                developer_name: 'Developer0',
                description: 'Test decription for developer Developer Co.'
            }
        ]

        const expectedFundsTable = [
            {
                fund_id: 0,
                fund_name: 'Fund0',
                description: 'Test description for fund Fund'
            }
        ]

        const expectedProjectsTable = [
            {
                project_id: 0,
                owner: 'developerco1',
                project_name: 'Test Project',
                description: 'This is a test project.',
                created_date: parseInt(new Date() / 1000),
                total_project_cost: '435000.00 USD',
                debt_financing: '2000.00 USD',
                term: 3,
                interest_rate: 100,
                loan_agreement: 'https://loan-agreement.com',
                total_equity_financing: '3000.00 USD',
                total_gp_equity: '2100.00 USD',
                private_equity: '5000.00 USD',
                annual_return: 500,
                project_co_lp: 'https://project-co-lp.com',
                project_co_lp_date: 1583864481,
                projected_completion_date: 1683864481,
                projected_stabilization_date: 1593864481,
                anticipated_year_sale_refinance: 2023,
                fund_lp: '',
                total_fund_offering_amount: '0 ',
                total_number_fund_offering: 0,
                price_per_fund_unit: '0 ',
                approved_date: 0,
                approved_by: '',
                developer_id: 0,
                project_class: 'NNN',
                status: 1
            },
            {
                project_id: 1,
                owner: 'developerco1',
                project_name: 'Test Project 2',
                description: 'This is a test project.',
                created_date: parseInt(new Date() / 1000),
                status: 1,
                total_project_cost: '435000.00 USD',
                debt_financing: '2000.00 USD',
                term: 3,
                interest_rate: 100,
                loan_agreement: 'https://loan-agreement.com',
                total_equity_financing: '3000.00 USD',
                total_gp_equity: '2100.00 USD',
                private_equity: '5000.00 USD',
                annual_return: 500,
                project_co_lp: 'https://project-co-lp.com',
                project_co_lp_date: 1583864481,
                projected_completion_date: 1683864481,
                projected_stabilization_date: 1593864481,
                anticipated_year_sale_refinance: 2023,
                fund_lp: '',
                total_fund_offering_amount: '0 ',
                total_number_fund_offering: 0,
                price_per_fund_unit: '0 ',
                approved_date: 0,
                approved_by: '',
                developer_id: 0,
                project_class: 'NNN'
            }
        ]

        projectsTableBeforeApproval = projectsTableBeforeApproval.map(project => {
            if (project.created_date <= parseInt(new Date() / 1000) + 5 && (project.created_date > parseInt(new Date() / 1000) - 5)) {
                project.created_date = parseInt(new Date() / 1000)
            }
            return project
        })

        assert.deepEqual(usersTable, expectedUsersTable, 'The users table is not right.')
        assert.deepEqual(investorsTable, expectedInvestorsTable, 'The investors table is not right.')
        assert.deepEqual(developersTable, expectedDevelopersTable, 'The developers table is not right.')
        assert.deepEqual(fundsTable, expectedFundsTable, 'The funds table is not right.')
        assert.deepEqual(projectsTableBeforeApproval, expectedProjectsTable, 'The projects table is not right.')

    })

    it('Should edit and delete a project', async () => {

        await seconduserContract.addproject(
            seconduser.name,
            projectConfig.project_class,
            projectConfig.project_name + " Editable",
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
            projectConfig.anticipated_year_sale_refinance
        )

        let projectsTableBefore = await projectsContract.projects.limit(10).find()

        await seconduserContract.editproject(
            seconduser.name,
            2, // project id
            projectConfig.project_class,
            projectConfig.project_name + " Editable",
            "Just an editable description",
            projectConfig.total_project_cost,
            projectConfig.debt_financing,
            projectConfig.term,
            100,
            projectConfig.loan_agreement,
            projectConfig.total_equity_financing,
            projectConfig.total_gp_equity,
            projectConfig.private_equity,
            projectConfig.annual_return,
            "http://www.lp-edited.com",
            projectConfig.project_co_lp_date,
            projectConfig.projected_completion_date,
            projectConfig.projected_stabilization_date,
            projectConfig.anticipated_year_sale_refinance
        )

        await seconduserContract.editproject(
            seconduser.name,
            2, // project id
            projectConfig.project_class,
            projectConfig.project_name + " Edited",
            "Just an editable description",
            projectConfig.total_project_cost,
            projectConfig.debt_financing,
            projectConfig.term,
            100,
            projectConfig.loan_agreement,
            projectConfig.total_equity_financing,
            projectConfig.total_gp_equity,
            projectConfig.private_equity,
            projectConfig.annual_return,
            "http://www.lp-edited.com",
            projectConfig.project_co_lp_date,
            projectConfig.projected_completion_date,
            projectConfig.projected_stabilization_date,
            projectConfig.anticipated_year_sale_refinance
        )

        let projectsTableAfter = await projectsContract.projects.limit(10).find()

        // console.log(projectsTableBefore)
        // console.log(projectsTableAfter)

        await seconduserContract.deleteprojct(seconduser.name, 2)

        let projectsTableAfterDelete = await projectsContract.projects.limit(10).find()
        // console.log(projectsTableAfterDelete)

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

        await thirduserContract.approveprjct(
            thirduser.name,
            1,
            projectConfig.fund_lp,
            projectConfig.total_fund_offering_amount,
            projectConfig.total_number_fund_offering,
            projectConfig.price_per_fund_unit
        )

        let projectsTableAfterApproval = await projectsContract.projects.limit(10).find()

        projectsTableAfterApproval = projectsTableAfterApproval.map(project => {
            delete project.created_date
            if (project.approved_date <= parseInt(new Date() / 1000) + 5 && (project.approved_date > parseInt(new Date() / 1000) - 5)) {
                project.approved_date = parseInt(new Date() / 1000)
            }
            return project
        })

        const expectedProjectsTable = [
            {
                project_id: 0,
                owner: 'developerco1',
                project_name: 'Test Project',
                description: 'This is a test project.',
                status: 2,
                developer_id: 0,
                project_class: 'NNN',
                total_project_cost: '435000.00 USD',
                debt_financing: '2000.00 USD',
                term: 3,
                interest_rate: 100,
                loan_agreement: 'https://loan-agreement.com',
                total_equity_financing: '3000.00 USD',
                total_gp_equity: '2100.00 USD',
                private_equity: '5000.00 USD',
                annual_return: 500,
                project_co_lp: 'https://project-co-lp.com',
                project_co_lp_date: 1583864481,
                projected_completion_date: 1683864481,
                projected_stabilization_date: 1593864481,
                anticipated_year_sale_refinance: 2023,
                fund_lp: 'https://fund-lp.com',
                total_fund_offering_amount: '400000.00 USD',
                total_number_fund_offering: 40000,
                price_per_fund_unit: '300.00 USD',
                approved_date: parseInt(new Date() / 1000),
                approved_by: 'fundusr11111'
            },
            {
                project_id: 1,
                owner: 'developerco1',
                project_name: 'Test Project 2',
                description: 'This is a test project.',
                status: 2,
                developer_id: 0,
                project_class: 'NNN',
                total_project_cost: '435000.00 USD',
                debt_financing: '2000.00 USD',
                term: 3,
                interest_rate: 100,
                loan_agreement: 'https://loan-agreement.com',
                total_equity_financing: '3000.00 USD',
                total_gp_equity: '2100.00 USD',
                private_equity: '5000.00 USD',
                annual_return: 500,
                project_co_lp: 'https://project-co-lp.com',
                project_co_lp_date: 1583864481,
                projected_completion_date: 1683864481,
                projected_stabilization_date: 1593864481,
                anticipated_year_sale_refinance: 2023,
                fund_lp: 'https://fund-lp.com',
                total_fund_offering_amount: '400000.00 USD',
                total_number_fund_offering: 40000,
                price_per_fund_unit: '300.00 USD',
                approved_date: parseInt(new Date() / 1000),
                approved_by: 'fundusr11111'
            }
        ]

        try {
            await thirduserContract.approveprjct(
                thirduser.name,
                2,
                projectConfig.fund_lp,
                projectConfig.total_fund_offering_amount,
                projectConfig.total_number_fund_offering,
                projectConfig.price_per_fund_unit
            )
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapproj: the project does not exist.', 'Something else went wrong.')
        }

        try {
            await sleep(500)
            await thirduserContract.approveprjct(
                thirduser.name,
                1,
                projectConfig.fund_lp,
                projectConfig.total_fund_offering_amount,
                projectConfig.total_number_fund_offering,
                projectConfig.price_per_fund_unit
            )
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapproj: the project has been already approved.', 'Something else went wrong.')
        }

        assert.deepEqual(projectsTableAfterApproval, expectedProjectsTable, 'The projects table is not right.')

    })

    it('Should make an investment', async () => {

        await firstuserContract.invest(firstuser.name, 0, "4000.00 USD", 40, 700, 832098900, "http://www.first-agreement.com")
        await firstuserContract.invest(firstuser.name, 1, "3000.00 USD", 40, 700, 832098900, "http://www.first-agreement.com")
        await fourthuserContract.invest(fourthuser.name, 1, "1000.00 USD", 40, 700, 832098900, "http://www.fourth-agreement.com")

        let investmentsTable = await projectsContract.investments.limit(10).find()
        let time = parseInt(new Date() / 1000)

        investmentsTable = investmentsTable.map(invest => {
            if (invest.investment_date <= time + 5 && (invest.investment_date > time - 5)) {
                invest.investment_date = time
            }
            return invest
        })

        await seconduserContract.addproject(
            seconduser.name,
            projectConfig.project_class,
            projectConfig.project_name + " 3",
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
            projectConfig.anticipated_year_sale_refinance
        )

        const expectedInvestments = [
            {
                investment_id: 0,
                user: 'investorusr1',
                project_id: 0,
                total_investment_amount: '4000.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '0.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 0,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.first-agreement.com',
                status: 1,
                approved_by: '',
                approved_date: 0,
                investment_date: time
            },
            {
                investment_id: 1,
                user: 'investorusr1',
                project_id: 1,
                total_investment_amount: '3000.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '0.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 0,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.first-agreement.com',
                status: 1,
                approved_by: '',
                approved_date: 0,
                investment_date: time
            },
            {
                investment_id: 2,
                user: 'investorusr2',
                project_id: 1,
                total_investment_amount: '1000.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '0.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 0,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.fourth-agreement.com',
                status: 1,
                approved_by: '',
                approved_date: 0,
                investment_date: time
            }
        ]

        try {
            await fourthuserContract.invest(fourthuser.name, 2, "1000.00 USD", 40, 700, 832098900, "http://www.fourth-agreement.com")
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapproj: the project can not accept any investment.', 'The projects table is not right.')
        }

        try {
            await fourthuserContract.invest(fourthuser.name, 3, "1000.00 USD", 40, 700, 832098900, "http://www.fourth-agreement.com")
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapproj: the project does not exist.', 'The projects table is not right.')
        }

        assert.deepEqual(investmentsTable, expectedInvestments, 'The investments table is not right.')

    })

    it('Should approve the investment', async () => {

        await thirduserContract.approveinvst(thirduser.name, 0)
        await thirduserContract.approveinvst(thirduser.name, 1)
        await thirduserContract.approveinvst(thirduser.name, 2)

        let investmentsTable = await projectsContract.investments.limit(10).find()
        let time = parseInt(new Date() / 1000)

        investmentsTable = investmentsTable.map(investment => {
            delete investment.investment_date
            if (investment.approved_date <= time + 5 && (investment.approved_date > time - 5)) {
                investment.approved_date = time
            }
            return investment
        })

        const expectedInvestmentsTable = [
            {
                investment_id: 0,
                user: 'investorusr1',
                project_id: 0,
                total_investment_amount: '4000.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '0.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 0,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.first-agreement.com',
                status: 2,
                approved_by: 'fundusr11111',
                approved_date: time
            },
            {
                investment_id: 1,
                user: 'investorusr1',
                project_id: 1,
                total_investment_amount: '3000.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '0.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 0,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.first-agreement.com',
                status: 2,
                approved_by: 'fundusr11111',
                approved_date: time
            },
            {
                investment_id: 2,
                user: 'investorusr2',
                project_id: 1,
                total_investment_amount: '1000.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '0.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 0,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.fourth-agreement.com',
                status: 2,
                approved_by: 'fundusr11111',
                approved_date: time
            }

        ]

        try {
            await sleep(300)
            await thirduserContract.approveinvst(thirduser.name, 2)
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapproj: the invesment has been already approved.', 'The investments table is not right.')
        }

        assert.deepEqual(investmentsTable, expectedInvestmentsTable, 'The investments table is not right.')

    })

    it('Should make a transfer', async () => {

        await firstuserContract.maketransfer(firstuser.name, "4000.00 USD", 0, "http://www.file.com", 832098900);
        await firstuserContract.maketransfer(firstuser.name, "400.00 USD", 1, "http://www.file.com", 832098900);
        await fourthuserContract.maketransfer(fourthuser.name, "500.00 USD", 2, "http://www.file.com", 832098900);

        await thirduserContract.confrmtrnsfr(thirduser.name, 0, '')
        await thirduserContract.confrmtrnsfr(thirduser.name, 1, '')
        await thirduserContract.confrmtrnsfr(thirduser.name, 2, '')

        let transfersTableBefore = await projectsContract.transfers.limit(10).find()
        let investmentsTableBefore = await projectsContract.investments.limit(10).find()

        investmentsTableBefore = investmentsTableBefore.map(investment => {
            delete investment.approved_date
            delete investment.investment_date
            return investment
        })

        let time = parseInt(new Date() / 1000)

        transfersTableBefore = transfersTableBefore.map(transfer => {
            if (transfer.updated_date <= time + 5 && (transfer.updated_date > time - 5)) {
                transfer.updated_date = time
            }
            if (transfer.confirmed_date <= time + 5 && (transfer.confirmed_date > time - 5)) {
                transfer.confirmed_date = time
            }
            return transfer
        })

        const expectedInvestmentsTableBefore = [
            {
                investment_id: 0,
                user: 'investorusr1',
                project_id: 0,
                total_investment_amount: '4000.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '4000.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 1,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.first-agreement.com',
                status: 3,
                approved_by: 'fundusr11111'
            },
            {
                investment_id: 1,
                user: 'investorusr1',
                project_id: 1,
                total_investment_amount: '3000.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '400.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 1,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.first-agreement.com',
                status: 2,
                approved_by: 'fundusr11111'
            },
            {
                investment_id: 2,
                user: 'investorusr2',
                project_id: 1,
                total_investment_amount: '1000.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '500.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 1,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.fourth-agreement.com',
                status: 2,
                approved_by: 'fundusr11111'
            }

        ]

        const expectedTransfersTableBefore = [
            {
                fund_transfer_id: 0,
                proof_of_transfer: 'http://www.file.com',
                amount: '4000.00 USD',
                investment_id: 0,
                user: 'investorusr1',
                status: 2,
                transfer_date: 832098900,
                updated_date: time,
                confirmed_date: time,
                confirmed_by: 'fundusr11111'
            },
            {
                fund_transfer_id: 1,
                proof_of_transfer: 'http://www.file.com',
                amount: '400.00 USD',
                investment_id: 1,
                user: 'investorusr1',
                status: 2,
                transfer_date: 832098900,
                updated_date: time,
                confirmed_date: time,
                confirmed_by: 'fundusr11111'
            },
            {
                fund_transfer_id: 2,
                proof_of_transfer: 'http://www.file.com',
                amount: '500.00 USD',
                investment_id: 2,
                user: 'investorusr2',
                status: 2,
                transfer_date: 832098900,
                updated_date: time,
                confirmed_date: time,
                confirmed_by: 'fundusr11111'
            }
        ]

        assert.deepEqual(investmentsTableBefore, expectedInvestmentsTableBefore, 'The investments table is not right.')
        assert.deepEqual(transfersTableBefore, expectedTransfersTableBefore, 'The transfers table is not right.')

        await firstuserContract.maketransfer(firstuser.name, "2600.00 USD", 1, "http://www.file.com", 832098900);

        let transfersTableMidle = await projectsContract.transfers.limit(10).find()
        let investmentsTableMidle = await projectsContract.investments.limit(10).find()

        investmentsTableMidle = investmentsTableMidle.map(investment => {
            delete investment.approved_date
            delete investment.investment_date
            return investment
        })

        transfersTableMidle = await transfersTableMidle.map(transfer => {
            delete transfer.transfer_date
            delete transfer.updated_date
            if (transfer.fund_transfer_id !== 3) {
                delete transfer.confirmed_date
            }
            return transfer
        })

        const expectedTransfersMidle = [
            {
                fund_transfer_id: 0,
                proof_of_transfer: 'http://www.file.com',
                amount: '4000.00 USD',
                investment_id: 0,
                user: 'investorusr1',
                status: 2,
                confirmed_by: 'fundusr11111'
            },
            {
                fund_transfer_id: 1,
                proof_of_transfer: 'http://www.file.com',
                amount: '400.00 USD',
                investment_id: 1,
                user: 'investorusr1',
                status: 2,
                confirmed_by: 'fundusr11111'
            },
            {
                fund_transfer_id: 2,
                proof_of_transfer: 'http://www.file.com',
                amount: '500.00 USD',
                investment_id: 2,
                user: 'investorusr2',
                status: 2,
                confirmed_by: 'fundusr11111'
            },
            {
                fund_transfer_id: 3,
                proof_of_transfer: 'http://www.file.com',
                amount: '2600.00 USD',
                investment_id: 1,
                user: 'investorusr1',
                status: 1,
                confirmed_date: 0,
                confirmed_by: ''
            }
        ]

        const expectedInvestmentsMidle = [
            {
                investment_id: 0,
                user: 'investorusr1',
                project_id: 0,
                total_investment_amount: '4000.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '4000.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 1,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.first-agreement.com',
                status: 3,
                approved_by: 'fundusr11111'
            },
            {
                investment_id: 1,
                user: 'investorusr1',
                project_id: 1,
                total_investment_amount: '3000.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '400.00 USD',
                total_unconfirmed_transfered_amount: '2600.00 USD',
                total_confirmed_transfers: 1,
                total_unconfirmed_transfers: 1,
                subscription_package: 'http://www.first-agreement.com',
                status: 2,
                approved_by: 'fundusr11111'
            },
            {
                investment_id: 2,
                user: 'investorusr2',
                project_id: 1,
                total_investment_amount: '1000.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '500.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 1,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.fourth-agreement.com',
                status: 2,
                approved_by: 'fundusr11111'
            }
        ]

        assert.deepEqual(transfersTableMidle, expectedTransfersMidle, 'The transfers table is not right.')
        assert.deepEqual(investmentsTableMidle, expectedInvestmentsMidle, 'The investments table is not right.')

        await thirduserContract.confrmtrnsfr(thirduser.name, 3, '')

        let transfersTableAfter = await projectsContract.transfers.limit(10).find()
        let investmentsTableAfter = await projectsContract.investments.limit(10).find()

        investmentsTableAfter = investmentsTableAfter.map(invest => {
            delete invest.approved_date
            delete invest.investment_date
            return invest
        })

        time = parseInt(new Date() / 1000)

        transfersTableAfter = transfersTableAfter.map(transfer => {
            if (transfer.updated_date <= time + 5 && (transfer.updated_date > time - 5)) {
                transfer.updated_date = time
            }
            if (transfer.confirmed_date <= time + 5 && (transfer.confirmed_date > time - 5)) {
                transfer.confirmed_date = time
            }
            return transfer
        })

        transfersTableAfter = await transfersTableAfter.map(transfer => {
            if (transfer.fund_transfer_id !== 3) {
                delete transfer.confirmed_date
                delete transfer.updated_date
            }
            return transfer
        })

        const expectedTransfersTableAfter = [
            {
                fund_transfer_id: 0,
                proof_of_transfer: 'http://www.file.com',
                amount: '4000.00 USD',
                investment_id: 0,
                user: 'investorusr1',
                status: 2,
                transfer_date: 832098900,
                confirmed_by: 'fundusr11111'
            },
            {
                fund_transfer_id: 1,
                proof_of_transfer: 'http://www.file.com',
                amount: '400.00 USD',
                investment_id: 1,
                user: 'investorusr1',
                status: 2,
                transfer_date: 832098900,
                confirmed_by: 'fundusr11111'
            },
            {
                fund_transfer_id: 2,
                proof_of_transfer: 'http://www.file.com',
                amount: '500.00 USD',
                investment_id: 2,
                user: 'investorusr2',
                status: 2,
                transfer_date: 832098900,
                confirmed_by: 'fundusr11111'
            },
            {
                fund_transfer_id: 3,
                proof_of_transfer: 'http://www.file.com',
                amount: '2600.00 USD',
                investment_id: 1,
                user: 'investorusr1',
                status: 2,
                transfer_date: 832098900,
                updated_date: time,
                confirmed_date: time,
                confirmed_by: 'fundusr11111'
            }
        ]

        const expectedInvestmentsTableAfter = [
            {
                investment_id: 0,
                user: 'investorusr1',
                project_id: 0,
                total_investment_amount: '4000.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '4000.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 1,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.first-agreement.com',
                status: 3,
                approved_by: 'fundusr11111'
            },
            {
                investment_id: 1,
                user: 'investorusr1',
                project_id: 1,
                total_investment_amount: '3000.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '3000.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 2,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.first-agreement.com',
                status: 3,
                approved_by: 'fundusr11111'
            },
            {
                investment_id: 2,
                user: 'investorusr2',
                project_id: 1,
                total_investment_amount: '1000.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '500.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 1,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.fourth-agreement.com',
                status: 2,
                approved_by: 'fundusr11111'
            }

        ]

        assert.deepEqual(transfersTableAfter, expectedTransfersTableAfter, 'The transfers table is not right.')
        assert.deepEqual(investmentsTableAfter, expectedInvestmentsTableAfter, 'The investments table is not right.')

        try {
            await firstuserContract.maketransfer(firstuser.name, "20.00 USD", 1, "http://www.file.com", 832098900);
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapproj: the investment has not been approved yet or it could have been closed.', 'Something else went wrong.')
        }

        try {
            await fourthuserContract.maketransfer(fourthuser.name, "200.00 USD", 1, "http://www.file.com", 832098900);
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapproj: the user can only make a transfer in an investment created by itself.', 'Something else went wrong.')
        }

        try {
            await fourthuserContract.maketransfer(fourthuser.name, "600.00 USD", 2, "http://www.file.com", 832098900);
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapproj: the payments can not exceed the total investment amount.', 'Something else went wrong.')
        }

    })

    it('Should edit and delete an investment', async () => {

        await firstuserContract.invest(firstuser.name, 0, "25000.00 USD", 40, 700, 99999, "http://www.first-agreement.com")
        await firstuserContract.editinvest(firstuser.name, 3, "2500.00 USD", 20, 400, 99999, "http://www.first-agreement-updated.com")

        let time = parseInt(new Date() / 1000)
        let investmentsTableAfter = await projectsContract.investments.limit(10).find()

        investmentsTableAfter = investmentsTableAfter.map(investment => {
            if (investment.investment_id === 3) {
                if (investment.investment_date <= time + 5 && (investment.investment_date > time - 5)) {
                    investment.investment_date = time
                }
                return investment
            }
        })

        const expectedInvestments = [
            {
                investment_id: 3,
                user: 'investorusr1',
                project_id: 0,
                total_investment_amount: '2500.00 USD',
                quantity_units_purchased: 20,
                annual_preferred_return: 400,
                signed_agreement_date: 99999,
                total_confirmed_transfered_amount: '0.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 0,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.first-agreement-updated.com',
                status: 1,
                approved_by: '',
                approved_date: 0,
                investment_date: time
            }
        ]

        assert.deepEqual(investmentsTableAfter.filter(Boolean), expectedInvestments, 'The investments table is not right.')

        await firstuserContract.deleteinvest(firstuser.name, 3)
        let investmentsTableAfterDelete = await projectsContract.investments.limit(10).find()

        investmentsTableAfterDelete = investmentsTableAfterDelete.map(investment => {
            if (investment.investment_id === 3) {
                return investment
            }
        })

        assert.deepEqual(investmentsTableAfterDelete.filter(Boolean), [], 'The investments table is not right.')

        try {
            await firstuserContract.editinvest(firstuser.name, 0, "2500.00 USD", 20, 400, 99999, "http://www.first-agreement-updated.com")
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapproj: the investment can not be modified anymore.', 'Something else went wrong.')
        }

    })

    it('Should edit and delete transfers', async () => {

        await fourthuserContract.invest(fourthuser.name, 0, "1500.00 USD", 40, 700, 832098900, "http://www.fourth-agreement.com")
        await thirduserContract.approveinvst(thirduser.name, 3)

        await fourthuserContract.maketransfer(fourthuser.name, "1500.00 USD", 3, "http://www.file.com", 832098900)

        let transfersTable = await projectsContract.transfers.limit(10).find()

        transfersTable = transfersTable.map(transfer => {
            if (transfer.fund_transfer_id === 4) {
                delete transfer.updated_date
                return transfer
            }
        })

        await sleep(2000)
        await fourthuserContract.edittransfer(fourthuser.name, 4, "1200.00 USD", "http://www.file-update.com", 2222222)

        let transfersTableAfter = await projectsContract.transfers.limit(10).find()

        transfersTableAfter = transfersTableAfter.map(transfer => {
            if (transfer.fund_transfer_id === 4) {
                delete transfer.updated_date
                return transfer
            }
        })

        let investmentsTable = await projectsContract.investments.limit(10).find()

        investmentsTable = investmentsTable.map(investment => {
            if (investment.investment_id === 3) {
                delete investment.approved_date
                delete investment.investment_date
                return investment
            }
        })

        const expectedTransfer = [
            {
                fund_transfer_id: 4,
                proof_of_transfer: 'http://www.file-update.com',
                amount: '1200.00 USD',
                investment_id: 3,
                user: 'investorusr2',
                status: 1,
                transfer_date: 2222222,
                confirmed_date: 0,
                confirmed_by: ''
            }
        ]

        const expectedInvestment = [
            {
                investment_id: 3,
                user: 'investorusr2',
                project_id: 0,
                total_investment_amount: '1500.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '0.00 USD',
                total_unconfirmed_transfered_amount: '1200.00 USD',
                total_confirmed_transfers: 0,
                total_unconfirmed_transfers: 1,
                subscription_package: 'http://www.fourth-agreement.com',
                status: 2,
                approved_by: 'fundusr11111'
            }
        ]

        assert.deepEqual(transfersTableAfter.filter(Boolean), expectedTransfer, 'The transfers table is not right.')
        assert.deepEqual(investmentsTable.filter(Boolean), expectedInvestment, 'The investments table is not right.')

        await fourthuserContract.deletetrnsfr(fourthuser.name, 4)

        let transfersTableAfterDelete = await projectsContract.transfers.limit(10).find()

        transfersTableAfterDelete = transfersTableAfterDelete.map(transfer => {
            if (transfer.fund_transfer_id === 4) {
                return transfer
            }
        })

        assert.deepEqual(transfersTableAfterDelete.filter(Boolean), [], 'The transfers table is not right.')

        let investmentsTableAfterDelete = await projectsContract.investments.limit(10).find()

        investmentsTableAfterDelete = investmentsTableAfterDelete.map(investment => {
            if (investment.investment_id === 3) {
                delete investment.approved_date
                delete investment.investment_date
                return investment
            }
        })

        const expectedTableAfterDelete = [
            {
                investment_id: 3,
                user: 'investorusr2',
                project_id: 0,
                total_investment_amount: '1500.00 USD',
                quantity_units_purchased: 40,
                annual_preferred_return: 700,
                signed_agreement_date: 832098900,
                total_confirmed_transfered_amount: '0.00 USD',
                total_unconfirmed_transfered_amount: '0.00 USD',
                total_confirmed_transfers: 0,
                total_unconfirmed_transfers: 0,
                subscription_package: 'http://www.fourth-agreement.com',
                status: 2,
                approved_by: 'fundusr11111'
            }
        ]

        assert.deepEqual(investmentsTableAfterDelete.filter(Boolean), expectedTableAfterDelete, 'The investments table is not right.')

    })

})

