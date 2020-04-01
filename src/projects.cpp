#include <projects.hpp>


void projects::checkusrtype (name user, string type) {
	auto itr_user = users.find(user.value);
	check(itr_user != users.end(), contract_names::projects.to_string() + ": the user does not exist.");
	check(itr_user -> type == type, contract_names::projects.to_string() + ": the user type must be " + type + " to do this.");
}

void projects::delete_transfer_aux (uint64_t transfer_id) {

	auto itr_transfer = transfers.find(transfer_id);
	auto itr_investment = investments.find(itr_transfer -> investment_id);

	check(itr_investment != investments.end(), contract_names::projects.to_string() + ": the investment does not exist.");

	investments.modify(itr_investment, _self, [&](auto & modified_investment){
		modified_investment.total_unconfirmed_transfered_amount -= itr_transfer -> amount;
		modified_investment.total_unconfirmed_transfers -= 1;
	});

	transfers.erase(itr_transfer);
}


ACTION projects::reset () {
    require_auth(_self);

    auto itr_p = projects_table.begin();
	while (itr_p != projects_table.end()) {
		itr_p = projects_table.erase(itr_p);
	}

	auto itr_users = users.begin();
	while (itr_users != users.end()) {
		itr_users = users.erase(itr_users);
	}

	auto itr_investor = investors.begin();
	while (itr_investor != investors.end()) {
		itr_investor = investors.erase(itr_investor);
	}

	auto itr_developer = developers.begin();
	while (itr_developer != developers.end()) {
		itr_developer = developers.erase(itr_developer);
	}

	auto itr_fund = funds.begin();
	while (itr_fund != funds.end()) {
		itr_fund = funds.erase(itr_fund);
	}

	auto itr_investment = investments.begin();
	while (itr_investment != investments.end()) {
		itr_investment = investments.erase(itr_investment);
	}

	auto itr_transfer = transfers.begin();
	while (itr_transfer != transfers.end()) {
		itr_transfer = transfers.erase(itr_transfer);
	}

	// hardcoding some users for testnet
	addtestuser("investorusr1"_n, "Investor 1", USER_TYPES.INVESTOR);
	addtestuser("investorusr2"_n, "Investor 2", USER_TYPES.INVESTOR);
	addtestuser("developerco1"_n, "Developer Co.", USER_TYPES.DEVELOPER);
	addtestuser("fundusr11111"_n, "Fund", USER_TYPES.FUND);
}

ACTION projects::addtestuser (name user, string user_name, string type) {
	uint64_t entity_id = 0;

	if (type == USER_TYPES.INVESTOR) {
		entity_id = investors.available_primary_key();
		investors.emplace(_self, [&](auto & new_investor){
			new_investor.investor_id = entity_id;
			new_investor.description = "Test description for investor " + user_name;
		});
	} else if (type == USER_TYPES.DEVELOPER) {
		entity_id = developers.available_primary_key();
		developers.emplace(_self, [&](auto & new_developer){
			new_developer.developer_id = entity_id;
			new_developer.developer_name = "Developer" + std::to_string(entity_id);
			new_developer.description = "Test decription for developer " + user_name;
		});
	} else if (type == USER_TYPES.FUND) {
		entity_id = funds.available_primary_key(),
		funds.emplace(_self, [&](auto & new_fund){
			new_fund.fund_id = entity_id;
			new_fund.fund_name = "Fund" + std::to_string(entity_id);
			new_fund.description = "Test description for fund " + user_name;
		});
	}

	users.emplace(_self, [&](auto & new_user){
		new_user.account = user;
		new_user.user_name = user_name;
		new_user.type = type;
		new_user.entity_id = entity_id;
	});
}

ACTION projects::checkuserdev (name user) {
	checkusrtype(user, USER_TYPES.DEVELOPER);
}

ACTION projects::addproject ( name actor,
							  string project_class,
							  string project_name,
							  string description,
							  asset total_project_cost,
							  asset debt_financing,
							  uint8_t term,
							  uint16_t interest_rate,
							  string loan_agreement, // url
							  asset total_equity_financing,
							  asset total_gp_equity,
							  asset private_equity,
							  uint16_t annual_return,
							  string project_co_lp, // url
							  uint64_t project_co_lp_date,
							  uint64_t projected_completion_date,
							  uint64_t projected_stabilization_date,
							  uint64_t anticipated_year_sale_refinance ) {

    require_auth(actor);
	checkuserdev(actor);

	check(PROJECT_CLASS.is_valid_constant(project_class), contract_names::projects.to_string() + ": that project class does not exist.");

    check_asset(total_project_cost, contract_names::projects);
	check_asset(debt_financing, contract_names::projects);
	check_asset(total_equity_financing, contract_names::projects);
	check_asset(total_gp_equity, contract_names::projects);
	check_asset(private_equity, contract_names::projects);

	check(projected_completion_date >= eosio::current_time_point().sec_since_epoch(), contract_names::projects.to_string() + ": the date can not be earlier than now.");
	check(projected_stabilization_date >= eosio::current_time_point().sec_since_epoch(), contract_names::projects.to_string() + ": the date can not be earlier than now.");

	auto itr_p = projects_table.begin();
	while (itr_p != projects_table.end()) {
		check(project_name != itr_p -> project_name, contract_names::projects.to_string() + ": there is already a project with that name.");
        itr_p++;
	}

    uint64_t new_project_id = projects_table.available_primary_key();
	uint64_t role_id = 0; // the owner is always the index 0

	projects_table.emplace(_self, [&](auto & new_project) {
		
		new_project.project_id = new_project_id;
		new_project.owner = actor;
		new_project.project_class = project_class;
		new_project.project_name = project_name;
		new_project.description = description;
		new_project.created_date = eosio::current_time_point().sec_since_epoch();
		new_project.status = PROJECT_STATUS.AWAITING_FUND_APPROVAL;

		new_project.total_project_cost = total_project_cost;
		new_project.debt_financing = debt_financing;
		new_project.term = term;
		new_project.interest_rate = interest_rate;
		new_project.loan_agreement = loan_agreement;
		
		new_project.total_equity_financing = total_equity_financing;
		new_project.total_gp_equity = total_gp_equity;
		new_project.private_equity = private_equity;
		new_project.annual_return = annual_return;
		new_project.project_co_lp = project_co_lp;
		new_project.project_co_lp_date = project_co_lp_date;

		new_project.projected_completion_date = projected_completion_date;
		new_project.projected_stabilization_date = projected_stabilization_date;
		new_project.anticipated_year_sale_refinance = anticipated_year_sale_refinance;

	});

    action (
        permission_level(contract_names::accounts, "active"_n),
        contract_names::accounts,
        "initaccounts"_n,
        std::make_tuple(new_project_id)
    ).send();

	action (
		permission_level(contract_names::permissions, "active"_n),
		contract_names::permissions,
		"initroles"_n,
		std::make_tuple(new_project_id)
	).send();

	action (
		permission_level(contract_names::permissions, "active"_n),
		contract_names::permissions,
		"assignrole"_n,
		std::make_tuple(contract_names::permissions, actor, new_project_id, role_id)
	).send();
}

ACTION projects::deleteprojct (name actor, uint64_t project_id) {
	require_auth(actor);

	auto itr_project = projects_table.find(project_id);
	check(itr_project != projects_table.end(), contract_names::projects.to_string() + ": the project does not exist.");
	check(itr_project -> owner == actor, contract_names::projects.to_string() + ": only the project owner can do this.");
	check(itr_project -> status == PROJECT_STATUS.AWAITING_FUND_APPROVAL, 
				contract_names::projects.to_string() + ": the project can not be deleted as it has been already approved by one fund.");

	projects_table.erase(itr_project);

	action (
		permission_level(contract_names::accounts, "active"_n),
		contract_names::accounts,
		"deleteaccnts"_n,
		std::make_tuple(project_id)
	).send();

	action (
		permission_level(contract_names::transactions, "active"_n),
		contract_names::transactions,
		"deletetrxns"_n,
		std::make_tuple(project_id)
	).send();

	action (
		permission_level(contract_names::permissions, "active"_n),
		contract_names::permissions,
		"deletepmssns"_n,
		std::make_tuple(project_id)
	).send();
}

ACTION projects::editproject ( name actor,
							   uint64_t project_id,
							   string project_class,
							   string project_name,
							   string description,
							   asset total_project_cost,
							   asset debt_financing,
							   uint8_t term,
							   uint16_t interest_rate,
							   string loan_agreement, // url
							   asset total_equity_financing,
							   asset total_gp_equity,
							   asset private_equity,
							   uint16_t annual_return,
							   string project_co_lp, // url
							   uint64_t project_co_lp_date,
							   uint64_t projected_completion_date,
							   uint64_t projected_stabilization_date,
							   uint64_t anticipated_year_sale_refinance ) {

	require_auth(actor);

	auto itr_project = projects_table.find(project_id);
	check(itr_project != projects_table.end(), contract_names::projects.to_string() + ": the project does not exist.");
	check(itr_project -> owner == actor, contract_names::projects.to_string() + ": only the project owner can do this.");
	check(itr_project -> status == PROJECT_STATUS.AWAITING_FUND_APPROVAL, 
				contract_names::projects.to_string() + ": the project can not be modified as it has been already approved by one fund.");

	check_asset(total_project_cost, contract_names::projects);
	check_asset(debt_financing, contract_names::projects);
	check_asset(total_equity_financing, contract_names::projects);
	check_asset(total_gp_equity, contract_names::projects);
	check_asset(private_equity, contract_names::projects);

	check(projected_completion_date >= eosio::current_time_point().sec_since_epoch(), contract_names::projects.to_string() + ": the date can not be earlier than now.");
	check(projected_stabilization_date >= eosio::current_time_point().sec_since_epoch(), contract_names::projects.to_string() + ": the date can not be earlier than now.");

	auto itr_p = projects_table.begin();
	while (itr_p != projects_table.end()) {
		if (itr_p -> project_id != project_id) {
			check(project_name != itr_p -> project_name, contract_names::projects.to_string() + ": there is already a project with that name.");
		}
        itr_p++;
	}

	projects_table.modify(itr_project, _self, [&](auto & modified_project) {

		modified_project.project_class = project_class;
		modified_project.project_name = project_name;
		modified_project.description = description;

		modified_project.total_project_cost = total_project_cost;
		modified_project.debt_financing = debt_financing;
		modified_project.term = term;
		modified_project.interest_rate = interest_rate;
		modified_project.loan_agreement = loan_agreement;
		
		modified_project.total_equity_financing = total_equity_financing;
		modified_project.total_gp_equity = total_gp_equity;
		modified_project.private_equity = private_equity;
		modified_project.annual_return = annual_return;
		modified_project.project_co_lp = project_co_lp;
		modified_project.project_co_lp_date = project_co_lp_date;

		modified_project.projected_completion_date = projected_completion_date;
		modified_project.projected_stabilization_date = projected_stabilization_date;
		modified_project.anticipated_year_sale_refinance = anticipated_year_sale_refinance;

	});
}

ACTION projects::approveprjct ( name actor, 
								uint64_t project_id, 
								string fund_lp,
								asset total_fund_offering_amount,
								uint64_t total_number_fund_offering,
								asset price_per_fund_unit ) {
	require_auth(actor);

	check_asset(total_fund_offering_amount, contract_names::projects);
	check_asset(price_per_fund_unit, contract_names::projects);

	checkusrtype(actor, USER_TYPES.FUND);

	auto itr_project = projects_table.find(project_id);
	check(itr_project != projects_table.end(), contract_names::projects.to_string() + ": the project does not exist.");
	check(itr_project -> status == PROJECT_STATUS.AWAITING_FUND_APPROVAL, contract_names::projects.to_string() + ": the project has been already approved.");

	projects_table.modify(itr_project, _self, [&](auto & modified_project){
		modified_project.fund_lp = fund_lp;
		modified_project.total_fund_offering_amount = total_fund_offering_amount;
		modified_project.total_number_fund_offering = total_number_fund_offering;
		modified_project.price_per_fund_unit = price_per_fund_unit;
		modified_project.approved_by = actor;
		modified_project.approved_date = eosio::current_time_point().sec_since_epoch();
		modified_project.status = PROJECT_STATUS.READY_FOR_INVESTMENT;
	});
}

ACTION projects::invest ( name actor, 
						  uint64_t project_id, 
						  asset total_investment_amount,
						  uint64_t quantity_units_purchased,
						  uint16_t annual_preferred_return,
						  uint64_t signed_agreement_date,
						  string subscription_package ) {
	
	require_auth(actor);

	check_asset(total_investment_amount, contract_names::projects);

	checkusrtype(actor, USER_TYPES.INVESTOR);

	auto itr_project = projects_table.find(project_id);
	check(itr_project != projects_table.end(), contract_names::projects.to_string() + ": the project does not exist.");
	check(itr_project -> status == PROJECT_STATUS.READY_FOR_INVESTMENT || itr_project -> status == PROJECT_STATUS.INVESTMENT_GOAL_REACHED, 
			contract_names::projects.to_string() + ": the project can not accept any investment.");
	
	check(subscription_package.length() > 0, contract_names::projects.to_string() + ": the signed subscription page can not be empty.");

	investments.emplace(_self, [&](auto & new_investment){
		new_investment.investment_id = investments.available_primary_key();
		new_investment.user = actor;
		new_investment.project_id = project_id;
		new_investment.total_investment_amount = total_investment_amount;
		new_investment.quantity_units_purchased = quantity_units_purchased;
		new_investment.annual_preferred_return = annual_preferred_return;
		new_investment.signed_agreement_date = signed_agreement_date;
		new_investment.subscription_package = subscription_package;
		new_investment.status = INVESTMENT_STATUS.PENDING;
		new_investment.investment_date = eosio::current_time_point().sec_since_epoch();
		new_investment.total_confirmed_transfered_amount = asset(0, CURRENCY);
		new_investment.total_unconfirmed_transfered_amount = asset(0, CURRENCY);
		new_investment.total_confirmed_transfers = 0;
		new_investment.total_unconfirmed_transfers = 0;
	});	
}

ACTION projects::editinvest ( name actor, 
							  uint64_t investment_id,
							  asset total_investment_amount,
							  uint64_t quantity_units_purchased,
							  uint16_t annual_preferred_return,
							  uint64_t signed_agreement_date,
							  string subscription_package ) {

	require_auth(actor);

	check_asset(total_investment_amount, contract_names::projects);

	auto itr_investment = investments.find(investment_id);
	check(itr_investment != investments.end(), contract_names::projects.to_string() + ": the investment does not exist.");
	check(itr_investment -> status == INVESTMENT_STATUS.PENDING, contract_names::projects.to_string() + ": the investment can not be modified anymore.");
	check(itr_investment -> user == actor, contract_names::projects.to_string() + ": only the investment issuer can modify it.");

	check(subscription_package.length() > 0, contract_names::projects.to_string() + ": the signed subscription page can not be empty.");

	investments.modify(itr_investment, _self, [&](auto & modified_investment){
		modified_investment.total_investment_amount = total_investment_amount;
		modified_investment.quantity_units_purchased = quantity_units_purchased;
		modified_investment.annual_preferred_return = annual_preferred_return;
		modified_investment.signed_agreement_date = signed_agreement_date;
		modified_investment.subscription_package = subscription_package;
		modified_investment.investment_date = eosio::current_time_point().sec_since_epoch();
	});
}

ACTION projects::deleteinvest (name actor, uint64_t investment_id) {
	require_auth(actor);

	auto itr_investment = investments.find(investment_id);
	check(itr_investment != investments.end(), contract_names::projects.to_string() + ": the investment request does not exist.");
	check(itr_investment -> status == INVESTMENT_STATUS.PENDING, 
			contract_names::projects.to_string() + ": the investment request can not be modified anymore as it has been already approved by a fund.");
	check(itr_investment -> user == actor, contract_names::projects.to_string() + ": only the investment issuer can do this.");

	investments.erase(itr_investment);
}

ACTION projects::approveinvst (name actor, uint64_t investment_id) {
	require_auth(actor);

	checkusrtype(actor, USER_TYPES.FUND);

	auto itr_investment = investments.find(investment_id);
	check(itr_investment != investments.end(), contract_names::projects.to_string() + ": the investment does not exist.");
	check(itr_investment -> status == INVESTMENT_STATUS.PENDING, contract_names::projects.to_string() + ": the invesment has been already approved.");

	investments.modify(itr_investment, _self, [&](auto & modified_investment){
		modified_investment.status = INVESTMENT_STATUS.FUNDING;
		modified_investment.approved_by = actor;
		modified_investment.approved_date = eosio::current_time_point().sec_since_epoch();
	});
}

ACTION projects::maketransfer (name actor, asset amount, uint64_t investment_id, string proof_of_transfer, uint64_t transfer_date) {
	require_auth(actor);

	checkusrtype(actor, USER_TYPES.INVESTOR);
	check_asset(amount, contract_names::projects);

	auto itr_investment = investments.find(investment_id);
	check(itr_investment != investments.end(), contract_names::projects.to_string() + ": the investment does not exist.");
	check(itr_investment -> user == actor, contract_names::projects.to_string() + ": the user can only make a transfer in an investment created by itself.");
	check(itr_investment -> status == INVESTMENT_STATUS.FUNDING,
			contract_names::projects.to_string() + ": the investment has not been approved yet or it could have been closed.");

	check(itr_investment -> total_confirmed_transfered_amount + amount <= itr_investment -> total_investment_amount,
			contract_names::projects.to_string() + ": the payments can not exceed the total investment amount.");

	transfers.emplace(_self, [&](auto & new_transfer){
		new_transfer.fund_transfer_id = transfers.available_primary_key();
		new_transfer.amount = amount;
		new_transfer.investment_id = investment_id;
		new_transfer.user = actor;
		new_transfer.transfer_date = transfer_date;
		new_transfer.proof_of_transfer = proof_of_transfer;
		new_transfer.updated_date = eosio::current_time_point().sec_since_epoch();
		new_transfer.status = TRANSFER_STATUS.AWAITING_CONFIRMATION;
	});

	investments.modify(itr_investment, _self, [&](auto & modified_investment){
		modified_investment.total_unconfirmed_transfered_amount += amount;
		modified_investment.total_unconfirmed_transfers += 1;
	});

}

ACTION projects::edittransfer ( name actor, 
								uint64_t transfer_id,
								asset amount, 
								string proof_of_transfer, 
								uint64_t date ) {
	
	require_auth(actor);

	check_asset(amount, contract_names::projects);

	auto itr_transfer = transfers.find(transfer_id);
	check(itr_transfer != transfers.end(), contract_names::projects.to_string() + ": the transfer does not exist.");
	check(itr_transfer -> status == TRANSFER_STATUS.AWAITING_CONFIRMATION, contract_names::projects.to_string() + ": the transfer can not be edited anymore.");
	check(itr_transfer -> user == actor, contract_names::projects.to_string() + ": only the transfer issuer can do this.");

	uint64_t investment_id = itr_transfer -> investment_id;
	auto itr_investment = investments.find(investment_id);

	asset old_amount = itr_transfer -> amount;

	check(itr_investment -> total_confirmed_transfered_amount + amount <= itr_investment -> total_investment_amount,
			contract_names::projects.to_string() + ": the payments can not exceed the total investment amount.");

	transfers.modify(itr_transfer, _self, [&](auto & modified_transfer){
		modified_transfer.amount = amount;
		modified_transfer.transfer_date = date;
		modified_transfer.proof_of_transfer = proof_of_transfer;
		modified_transfer.updated_date = eosio::current_time_point().sec_since_epoch();
	});

	investments.modify(itr_investment, _self, [&](auto & modified_investment){
		modified_investment.total_unconfirmed_transfered_amount -= old_amount;
		modified_investment.total_unconfirmed_transfered_amount += amount;
	});

}


ACTION projects::deletetrnsfr (name actor, uint64_t transfer_id) {
	require_auth(actor);

	auto itr_transfer = transfers.find(transfer_id);
	check(itr_transfer != transfers.end(), contract_names::projects.to_string() + ": the transfer does not exist.");
	check(itr_transfer -> user == actor, contract_names::projects.to_string() + ": only the transfer issuer can do this.");
	check(itr_transfer -> status == TRANSFER_STATUS.AWAITING_CONFIRMATION, contract_names::projects.to_string() + ": the transfer can not be modified anymore.");

	delete_transfer_aux(transfer_id);
}

ACTION projects::confrmtrnsfr (name actor, uint64_t transfer_id, string proof_of_transfer) {
	require_auth(actor);

	checkusrtype(actor, USER_TYPES.FUND);

	auto itr_transfer = transfers.find(transfer_id);
	check(itr_transfer != transfers.end(), contract_names::projects.to_string() + ": the transfer does not exist.");
	check(itr_transfer -> status == TRANSFER_STATUS.AWAITING_CONFIRMATION, contract_names::projects.to_string() + ": the transfer has been already confirmed.");

	uint64_t investment_id = itr_transfer -> investment_id;
	asset amount = itr_transfer -> amount;

	auto itr_investment = investments.find(investment_id);

	asset total_amount = itr_investment -> total_confirmed_transfered_amount + amount;
	asset total_investment = itr_investment -> total_investment_amount;

	check(total_amount <= total_investment, contract_names::projects.to_string() + ": the payments can not exceed the total investment amount.");

	transfers.modify(itr_transfer, _self, [&](auto & modified_transfer){
		modified_transfer.status = TRANSFER_STATUS.CONFIRMED;
		modified_transfer.confirmed_date = eosio::current_time_point().sec_since_epoch();
		modified_transfer.updated_date = eosio::current_time_point().sec_since_epoch();
		modified_transfer.confirmed_by = actor;

		if (proof_of_transfer.length() > 0) {
			modified_transfer.proof_of_transfer = proof_of_transfer;
		}
	});

	investments.modify(itr_investment, _self, [&](auto & modified_investment){
		if (total_amount == total_investment) {
			modified_investment.status = INVESTMENT_STATUS.FUNDED;
		}
		modified_investment.total_unconfirmed_transfered_amount -= amount;
		modified_investment.total_confirmed_transfered_amount += amount;
		modified_investment.total_confirmed_transfers += 1;
		modified_investment.total_unconfirmed_transfers -= 1;
	});
}




EOSIO_DISPATCH(projects, (reset)(addproject)(approveprjct)(addtestuser)(invest)(approveinvst)(maketransfer)(editproject)(deleteprojct)(deleteinvest)(editinvest)(confrmtrnsfr)(edittransfer)(deletetrnsfr));




