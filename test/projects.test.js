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
            assert.deepEqual(getError(err), "proxycapprjt: the user type must be Developer to do this.", 'Something else went wrong.')
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
            assert.deepEqual(getError(err), "proxycapprjt: there is already a project with that name.", 'Something else went wrong.')
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
            assert.deepEqual(getError(err), "proxycapprjt: the date can not be earlier than now.", 'Something else went wrong.')
        }

        try {
            await seconduserContract.addproject(
                seconduser.name, 
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
                projectConfig.anticipated_year_sale
            )
        } catch (err) {
            assert.deepEqual(getError(err), "proxycapprjt: the symbols must be the same.", 'Something else went wrong.')
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
    

        let projectsTableBeforeApproval = await projectsContract.projects.limit(10).find()
        const usersTable = await projectsContract.users.limit(10).find()
        const investorsTable = await projectsContract.investors.limit(10).find()
        const developersTable = await projectsContract.developers.limit(10).find()
        const fundsTable = await projectsContract.funds.limit(10).find()

        const expectedUsersTable = [
            {
              account: 'prxycapusraa',
              user_name: 'firstuser',
              entity_id: 0,
              type: 'Investor'
            },
            {
              account: 'prxycapusrbb',
              user_name: 'seconduser',
              entity_id: 0,
              type: 'Developer'
            },
            {
              account: 'prxycapusrcc',
              user_name: 'thirduser',
              entity_id: 0,
              type: 'Fund'
            },
            {
              account: 'prxycapusrdd',
              user_name: 'fourthuser',
              entity_id: 1,
              type: 'Investor'
            }
        ]

        const expectedInvestorsTable = [
            {
              investor_id: 0,
              description: 'Test description for investor firstuser'
            },
            {
              investor_id: 1,
              description: 'Test description for investor fourthuser'
            }
        ]
        
        const expectedDevelopersTable = [
            {
              developer_id: 0,
              developer_name: 'Developer0',
              description: 'Test decription for developer seconduser'
            }
        ]
        
        const expectedFundsTable = [
            {
              fund_id: 0,
              fund_name: 'Fund0',
              description: 'Test description for fund thirduser'
            }
        ]

        const expectedProjectsTable = [
            {
              project_id: 0,
              owner: 'prxycapusrbb',
              project_name: 'Test Project',
              description: 'This is a test project.',
              created_date: parseInt(new Date() / 1000),
              status: 'Awaiting Fund Approval',
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
              anticipated_year_sale: 2023,
              fund_lp: '',
              total_fund_offering_amount: '0 ',
              total_number_fund_offering: 0,
              price_per_fund_unit: '0 ',
              approved_date: 0,
              approved_by: ''
            },
            {
              project_id: 1,
              owner: 'prxycapusrbb',
              project_name: 'Test Project 2',
              description: 'This is a test project.',
              created_date: parseInt(new Date() / 1000),
              status: 'Awaiting Fund Approval',
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
              anticipated_year_sale: 2023,
              fund_lp: '',
              total_fund_offering_amount: '0 ',
              total_number_fund_offering: 0,
              price_per_fund_unit: '0 ',
              approved_date: 0,
              approved_by: ''
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
              owner: 'prxycapusrbb',
              project_name: 'Test Project',
              description: 'This is a test project.',
              status: 'Ready for Investment',
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
              anticipated_year_sale: 2023,
              fund_lp: 'https://fund-lp.com',
              total_fund_offering_amount: '400000.00 USD',
              total_number_fund_offering: 40000,
              price_per_fund_unit: '300.00 USD',
              approved_date: parseInt(new Date() / 1000),
              approved_by: 'prxycapusrcc'
            },
            {
              project_id: 1,
              owner: 'prxycapusrbb',
              project_name: 'Test Project 2',
              description: 'This is a test project.',
              status: 'Ready for Investment',
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
              anticipated_year_sale: 2023,
              fund_lp: 'https://fund-lp.com',
              total_fund_offering_amount: '400000.00 USD',
              total_number_fund_offering: 40000,
              price_per_fund_unit: '300.00 USD',
              approved_date: parseInt(new Date() / 1000),
              approved_by: 'prxycapusrcc'
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
            assert.deepEqual(getError(err), 'proxycapprjt: the project does not exist.', 'Something else went wrong.')
        }

        try {
            await sleep(100)
            await thirduserContract.approveprjct(
                thirduser.name,
                1,
                projectConfig.fund_lp,
                projectConfig.total_fund_offering_amount,
                projectConfig.total_number_fund_offering,
                projectConfig.price_per_fund_unit
            )
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapprjt: the project has been already approved.', 'Something else went wrong.')
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
            projectConfig.anticipated_year_sale
        )

        const expectedInvestments = [
            {
              investment_id: 0,
              user: 'prxycapusraa',
              project_id: 0,
              total_investment_amount: '4000.00 USD',
              quantity_units_purchased: 40,
              annual_preferred_return: 700,
              signed_agreement_date: 832098900,
              file: 'http://www.first-agreement.com',
              status: 'Pending',
              approved_by: '',
              approved_date: 0,
              investment_date: time
            },
            {
              investment_id: 1,
              user: 'prxycapusraa',
              project_id: 1,
              total_investment_amount: '3000.00 USD',
              quantity_units_purchased: 40,
              annual_preferred_return: 700,
              signed_agreement_date: 832098900,
              file: 'http://www.first-agreement.com',
              status: 'Pending',
              approved_by: '',
              approved_date: 0,
              investment_date: time
            },
            {
              investment_id: 2,
              user: 'prxycapusrdd',
              project_id: 1,
              total_investment_amount: '1000.00 USD',
              quantity_units_purchased: 40,
              annual_preferred_return: 700,
              signed_agreement_date: 832098900,
              file: 'http://www.fourth-agreement.com',
              status: 'Pending',
              approved_by: '',
              approved_date: 0,
              investment_date: time
            }
        ]

        try {
            await fourthuserContract.invest(fourthuser.name, 2, "1000.00 USD", 40, 700, 832098900, "http://www.fourth-agreement.com")
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapprjt: the project can not accept any investment.', 'The projects table is not right.')
        }

        try {
            await fourthuserContract.invest(fourthuser.name, 3, "1000.00 USD", 40, 700, 832098900, "http://www.fourth-agreement.com")
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapprjt: the project does not exist.', 'The projects table is not right.')
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
              user: 'prxycapusraa',
              project_id: 0,
              total_investment_amount: '4000.00 USD',
              quantity_units_purchased: 40,
              annual_preferred_return: 700,
              signed_agreement_date: 832098900,
              file: 'http://www.first-agreement.com',
              status: 'Funding',
              approved_by: 'prxycapusrcc',
              approved_date: time
            },
            {
              investment_id: 1,
              user: 'prxycapusraa',
              project_id: 1,
              total_investment_amount: '3000.00 USD',
              quantity_units_purchased: 40,
              annual_preferred_return: 700,
              signed_agreement_date: 832098900,
              file: 'http://www.first-agreement.com',
              status: 'Funding',
              approved_by: 'prxycapusrcc',
              approved_date: time
            },
            {
              investment_id: 2,
              user: 'prxycapusrdd',
              project_id: 1,
              total_investment_amount: '1000.00 USD',
              quantity_units_purchased: 40,
              annual_preferred_return: 700,
              signed_agreement_date: 832098900,
              file: 'http://www.fourth-agreement.com',
              status: 'Funding',
              approved_by: 'prxycapusrcc',
              approved_date: time
            }
        ]

        try {
            await sleep(300)
            await thirduserContract.approveinvst(thirduser.name, 2)
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapprjt: the invesment has been already approved.', 'The investments table is not right.')
        }
          
        assert.deepEqual(investmentsTable, expectedInvestmentsTable, 'The investments table is not right.')

    })

    it('Should make a transfer', async () => {

        await firstuserContract.maketransfer(firstuser.name, "4000.00 USD", 0, "http://www.file.com", 832098900);
        await firstuserContract.maketransfer(firstuser.name, "400.00 USD", 1, "http://www.file.com", 832098900);
        await fourthuserContract.maketransfer(fourthuser.name, "500.00 USD", 2, "http://www.file.com", 832098900);

        let transfersTableBefore = await projectsContract.transfers.limit(10).find()
        let investmentsTableBefore = await projectsContract.investments.limit(10).find()

        investmentsTableBefore = investmentsTableBefore.map(investment => {
            delete investment.approved_date
            delete investment.investment_date
            return investment
        })

        const expectedInvestmentsTableBefore = [
            {
              investment_id: 0,
              user: 'prxycapusraa',
              project_id: 0,
              total_investment_amount: '4000.00 USD',
              quantity_units_purchased: 40,
              annual_preferred_return: 700,
              signed_agreement_date: 832098900,
              file: 'http://www.first-agreement.com',
              status: 'Funded',
              approved_by: 'prxycapusrcc'
            },
            {
              investment_id: 1,
              user: 'prxycapusraa',
              project_id: 1,
              total_investment_amount: '3000.00 USD',
              quantity_units_purchased: 40,
              annual_preferred_return: 700,
              signed_agreement_date: 832098900,
              file: 'http://www.first-agreement.com',
              status: 'Funding',
              approved_by: 'prxycapusrcc'
            },
            {
              investment_id: 2,
              user: 'prxycapusrdd',
              project_id: 1,
              total_investment_amount: '1000.00 USD',
              quantity_units_purchased: 40,
              annual_preferred_return: 700,
              signed_agreement_date: 832098900,
              file: 'http://www.fourth-agreement.com',
              status: 'Funding',
              approved_by: 'prxycapusrcc'
            }
        ]

        const expectedTransfersTableBefore = [
            {
              fund_transfer_id: 0,
              file: 'http://www.file.com',
              amount: '4000.00 USD',
              investment_id: 0,
              user: 'prxycapusraa',
              date: 832098900
            },
            {
              fund_transfer_id: 1,
              file: 'http://www.file.com',
              amount: '400.00 USD',
              investment_id: 1,
              user: 'prxycapusraa',
              date: 832098900
            },
            {
              fund_transfer_id: 2,
              file: 'http://www.file.com',
              amount: '500.00 USD',
              investment_id: 2,
              user: 'prxycapusrdd',
              date: 832098900
            }
        ]
          
        assert.deepEqual(investmentsTableBefore, expectedInvestmentsTableBefore, 'The investments table is not right.')
        assert.deepEqual(transfersTableBefore, expectedTransfersTableBefore, 'The transfers table is not right.')
          
        await firstuserContract.maketransfer(firstuser.name, "2600.00 USD", 1, "http://www.file.com", 128329043820);

        const transfersTableAfter = await projectsContract.transfers.limit(10).find()
        let investmentsTableAfter = await projectsContract.investments.limit(10).find()

        investmentsTableAfter = investmentsTableAfter.map(invest => {
            delete invest.approved_date
            delete invest.investment_date
            return invest
        })

        const expectedTransfersTableAfter = [
            {
              fund_transfer_id: 0,
              file: 'http://www.file.com',
              amount: '4000.00 USD',
              investment_id: 0,
              user: 'prxycapusraa',
              date: 832098900
            },
            {
              fund_transfer_id: 1,
              file: 'http://www.file.com',
              amount: '400.00 USD',
              investment_id: 1,
              user: 'prxycapusraa',
              date: 832098900
            },
            {
              fund_transfer_id: 2,
              file: 'http://www.file.com',
              amount: '500.00 USD',
              investment_id: 2,
              user: 'prxycapusrdd',
              date: 832098900
            },
            {
              fund_transfer_id: 3,
              file: 'http://www.file.com',
              amount: '2600.00 USD',
              investment_id: 1,
              user: 'prxycapusraa',
              date: '128329043820'
            }
        ]

        const expectedInvestmentsTableAfter = [
            {
              investment_id: 0,
              user: 'prxycapusraa',
              project_id: 0,
              total_investment_amount: '4000.00 USD',
              quantity_units_purchased: 40,
              annual_preferred_return: 700,
              signed_agreement_date: 832098900,
              file: 'http://www.first-agreement.com',
              status: 'Funded',
              approved_by: 'prxycapusrcc'
            },
            {
              investment_id: 1,
              user: 'prxycapusraa',
              project_id: 1,
              total_investment_amount: '3000.00 USD',
              quantity_units_purchased: 40,
              annual_preferred_return: 700,
              signed_agreement_date: 832098900,
              file: 'http://www.first-agreement.com',
              status: 'Funded',
              approved_by: 'prxycapusrcc'
            },
            {
              investment_id: 2,
              user: 'prxycapusrdd',
              project_id: 1,
              total_investment_amount: '1000.00 USD',
              quantity_units_purchased: 40,
              annual_preferred_return: 700,
              signed_agreement_date: 832098900,
              file: 'http://www.fourth-agreement.com',
              status: 'Funding',
              approved_by: 'prxycapusrcc'
            }
        ]

        assert.deepEqual(transfersTableAfter, expectedTransfersTableAfter, 'The transfers table is not right.')
        assert.deepEqual(investmentsTableAfter, expectedInvestmentsTableAfter, 'The investments table is not right.')

        try {
            await firstuserContract.maketransfer(firstuser.name, "20.00 USD", 1, "http://www.file.com", 128329043820);
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapprjt: the investment has not been approved yet or it could have been closed.', 'Something else went wrong.')
        }

        try {
            await fourthuserContract.maketransfer(fourthuser.name, "200.00 USD", 1, "http://www.file.com", 128329043820);         
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapprjt: the user can only make a transfer in an investment created by itself.', 'Something else went wrong.')
        }

        try {
            await fourthuserContract.maketransfer(fourthuser.name, "600.00 USD", 2, "http://www.file.com", 128329043820);
        } catch (err) {
            assert.deepEqual(getError(err), 'proxycapprjt: the payments can not exceed the total investment amount.', 'Something else went wrong.')
        }

    })



})

