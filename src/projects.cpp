#include <projects.hpp>

#include <users/user_factory.hpp>

#include "users/base_user.cpp"
#include "users/admin_user.cpp"
#include "users/builder_user.cpp"
#include "users/investor_user.cpp"

void projects::check_user_role(name user, eosio::name role)
{
	auto user_itr = user_t.find(user.value);

	check(user_itr != user_t.end(), common::contracts::projects.to_string() + ": the user does not exist.");
	check(user_itr->role == role, common::contracts::projects.to_string() + ": the user role must be " + role.to_string() + " to do this.");
}

void projects::delete_transfer_aux(uint64_t transfer_id)
{

	auto transfer_itr = fund_transfer_t.find(transfer_id);
	auto investment_itr = investment_t.find(transfer_itr->investment_id);

	check(investment_itr != investment_t.end(), common::contracts::projects.to_string() + ": the investment does not exist.");

	investment_t.modify(investment_itr, _self, [&](auto &modified_investment)
											{
		modified_investment.total_unconfirmed_transferred_amount -= transfer_itr -> amount;
		modified_investment.total_unconfirmed_transfers -= 1; });

	fund_transfer_t.erase(transfer_itr);
}

uint64_t projects::get_user_entity(name actor)
{
	auto user_itr = user_t.find(actor.value);
	check(user_itr != user_t.end(), common::contracts::projects.to_string() + ": " + actor.to_string() + " proxy cap user not found.");

	return user_itr->entity_id;
}

ACTION projects::reset()
{
	require_auth(_self);

	auto project_itr = project_t.begin();
	while (project_itr != project_t.end())
	{
		project_itr = project_t.erase(project_itr);
	}

	auto entity_itr = entity_t.begin();
	while (entity_itr != entity_t.end())
	{
		entity_itr = entity_t.erase(entity_itr);
	}

	auto investment_itr = investment_t.begin();
	while (investment_itr != investment_t.end())
	{
		investment_itr = investment_t.erase(investment_itr);
	}

	auto transfer_itr = fund_transfer_t.begin();
	while (transfer_itr != fund_transfer_t.end())
	{
		transfer_itr = fund_transfer_t.erase(transfer_itr);
	}

	auto user_itr = user_t.begin();
	while (user_itr != user_t.end())
	{
		user_itr = user_t.erase(user_itr);
	}
	
}

ACTION projects::init()
{
	require_auth(_self);

	addentity(_self, "Proxy Capital", "Entity for Proxy Capital", ENTITY_TYPES.FUND);
	addentity(_self, "Investor Entity 1", "Entity for investors", ENTITY_TYPES.INVESTOR);
	addentity(_self, "Developer Entity 1", "Entity for developer", ENTITY_TYPES.DEVELOPER);

	// hardcoding some entity_t and user_t for testnet
	adduser(_self, "proxyadmin11"_n, "Admin", common::projects::entity::fund);
	adduser(_self, "investoruser"_n, "Investor 1", common::projects::entity::investor);
	adduser(_self, "investorusr2"_n, "Investor 2", common::projects::entity::investor);
	adduser(_self, "builderuser1"_n, "Builder", common::projects::entity::developer);

	// hardcoding some entity_t and user_t for mainnet
	adduser(_self, "proxy.gm"_n, "Admin", common::projects::entity::fund);
	adduser(_self, "tlalocman.sh"_n, "Admin", common::projects::entity::fund);
	adduser(_self, "proxybuilder"_n, "Builder", common::projects::entity::developer);

	// old flow
	// hardcoding some entity_t and user_t for testnet
	// addentity(_self, "Proxy Capital", "A test entity for Proxy Capital", ENTITY_TYPyES.FUND);
	// addentity(_self, "Investor Entity 1", "A test entity for investors", ENTITY_TYPES.INVESTOR);
	// addentity(_self, "Investor Entity 2", "A test entity for investors", ENTITY_TYPES.INVESTOR);
	// addentity(_self, "Developer Entity 1", "A test entity for developer", ENTITY_TYPES.DEVELOPER);

	// uint64_t entity_id = 1;

	// addtestuser("proxyadmin11"_n, "John Miller", entity_id);
	// addtestuser("investoruser"_n, "James Smith", entity_id + 1);
	// addtestuser("investorusr2"_n, "Sally Fields", entity_id + 2);
	// addtestuser("builderuser1"_n, "Mary Williams", entity_id + 3);
}

// who can do this?
ACTION projects::addentity(const eosio::name &actor,
													 const std::string &entity_name,
													 const std::string &description,
													 const eosio::name &role)
{
	require_auth(actor);

	// ============================== //
	// = check permissions here ??? = //
	// ============================== //

	auto entity_itr = entity_t.begin();
	while (entity_itr != entity_t.end())
	{
		check(entity_itr->entity_name != entity_name, common::contracts::projects.to_string() + ": there is already an entity using that name.");
		entity_itr++;
	}

	check(ENTITY_TYPES.is_valid_constant(role), common::contracts::projects.to_string() + ": the role is not valid.");

	entity_t.emplace(_self, [&](auto &new_entity)
									 {
		new_entity.entity_id = get_valid_index(entity_t.available_primary_key());;
		new_entity.entity_name = entity_name;
		new_entity.description = description;
		new_entity.role = role; });
}

ACTION projects::addtestuser(name user, string user_name, uint64_t entity_id)
{
	auto entity_itr = entity_t.find(entity_id);
	check(entity_itr != entity_t.end(), common::contracts::projects.to_string() + ": entity does not exist.");

	user_t.emplace(_self, [&](auto &new_user)
								 {
		new_user.account = user;
		new_user.user_name = user_name;
		new_user.role = entity_itr -> role;
		new_user.entity_id = entity_id; });
}

ACTION projects::checkuserdev(name user)
{
	check_user_role(user, ENTITY_TYPES.DEVELOPER);
}

ACTION projects::addproject(const eosio::name &actor,
														const std::string &project_class,
														const std::string &project_name,
														const std::string &description,
														const eosio::asset &total_project_cost,
														const eosio::asset &debt_financing,
														const uint8_t &term,
														const uint16_t &interest_rate,
														const std::string &loan_agreement, // url
														const eosio::asset &total_equity_financing,
														const eosio::asset &total_gp_equity,
														const eosio::asset &private_equity,
														const uint16_t &annual_return,
														const std::string &project_co_lp, // url
														const uint64_t &project_co_lp_date,
														const uint64_t &projected_completion_date,
														const uint64_t &projected_stabilization_date,
														const uint64_t &anticipated_year_sale_refinance)
{

	require_auth(actor);

	auto actor_itr = user_t.find(actor.value);
	check(actor_itr->role == common::projects::entity::fund, actor.to_string() + "has not permissions to create projects!");

	check(PROJECT_CLASS.is_valid_constant(project_class), common::contracts::projects.to_string() + ": that project class does not exist.");

	check_asset(total_project_cost, common::contracts::projects);
	check_asset(debt_financing, common::contracts::projects);
	check_asset(total_equity_financing, common::contracts::projects);
	check_asset(total_gp_equity, common::contracts::projects);
	check_asset(private_equity, common::contracts::projects);

	check(projected_completion_date >= eosio::current_time_point().sec_since_epoch(), common::contracts::projects.to_string() + ": the date can not be earlier than now.");
	check(projected_stabilization_date >= eosio::current_time_point().sec_since_epoch(), common::contracts::projects.to_string() + ": the date can not be earlier than now.");

	auto project_itr = project_t.begin();
	while (project_itr != project_t.end())
	{
		check(project_name != project_itr->project_name, common::contracts::projects.to_string() + ": there is already a project with that name.");
		project_itr++;
	}

	uint64_t new_project_id = project_t.available_primary_key();

	project_t.emplace(_self, [&](auto &new_project)
										{
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
		new_project.anticipated_year_sale_refinance = anticipated_year_sale_refinance; });
}

ACTION projects::deleteprojct(name actor, uint64_t project_id)
{
	require_auth(actor);
	check_user_role(actor, common::projects::entity::fund);

	auto project_itr = project_t.find(project_id);
	check(project_itr != project_t.end(), common::contracts::projects.to_string() + ": the project does not exist.");
	// check(project_itr->owner == actor, common::contracts::projects.to_string() + ": only the project owner can do this.");
	check(project_itr->status == PROJECT_STATUS.AWAITING_FUND_APPROVAL,
				common::contracts::projects.to_string() + ": the project can not be deleted as it has been already approved by one fund.");

	project_t.erase(project_itr);

	// action (
	// 	permission_level(common::contracts::accounts, "active"_n),
	// 	common::contracts::accounts,
	// 	"deleteaccnts"_n,
	// 	std::make_tuple(project_id)
	// ).send();

	// action (
	// 	permission_level(common::contracts::transactions, "active"_n),
	// 	common::contracts::transactions,
	// 	"deletetrxns"_n,
	// 	std::make_tuple(project_id)
	// ).send();

	// action (
	// 	permission_level(common::contracts::permissions, "active"_n),
	// 	common::contracts::permissions,
	// 	"deletepmssns"_n,
	// 	std::make_tuple(project_id)
	// ).send();
}

ACTION projects::editproject(const eosio::name &actor,
														 const uint64_t &project_id,
														 const std::string &project_class,
														 const std::string &project_name,
														 const std::string &description,
														 const eosio::asset &total_project_cost,
														 const eosio::asset &debt_financing,
														 const uint8_t &term,
														 const uint16_t &interest_rate,
														 const std::string &loan_agreement, // url
														 const eosio::asset &total_equity_financing,
														 const eosio::asset &total_gp_equity,
														 const eosio::asset &private_equity,
														 const uint16_t &annual_return,
														 const std::string &project_co_lp, // url
														 const uint64_t &project_co_lp_date,
														 const uint64_t &projected_completion_date,
														 const uint64_t &projected_stabilization_date,
														 const uint64_t &anticipated_year_sale_refinance)
{

	require_auth(actor);
	check_user_role(actor, common::projects::entity::fund);

	auto project_itr = project_t.find(project_id);
	check(project_itr != project_t.end(), common::contracts::projects.to_string() + ": the project does not exist.");
	check(project_itr->owner == actor, common::contracts::projects.to_string() + ": only the project owner can do this.");
	check(project_itr->status == PROJECT_STATUS.AWAITING_FUND_APPROVAL,
				common::contracts::projects.to_string() + ": the project can not be modified as it has been already approved by one fund.");

	check_asset(total_project_cost, common::contracts::projects);
	check_asset(debt_financing, common::contracts::projects);
	check_asset(total_equity_financing, common::contracts::projects);
	check_asset(total_gp_equity, common::contracts::projects);
	check_asset(private_equity, common::contracts::projects);

	check(projected_completion_date >= eosio::current_time_point().sec_since_epoch(), common::contracts::projects.to_string() + ": the date can not be earlier than now.");
	check(projected_stabilization_date >= eosio::current_time_point().sec_since_epoch(), common::contracts::projects.to_string() + ": the date can not be earlier than now.");

	auto projects_itr = project_t.begin();
	while (projects_itr != project_t.end())
	{
		if (projects_itr->project_id != project_id)
		{
			check(project_name != projects_itr->project_name, common::contracts::projects.to_string() + ": there is already a project with that name.");
		}
		projects_itr++;
	}

	project_t.modify(project_itr, _self, [&](auto &modified_project)
									 {
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
													modified_project.anticipated_year_sale_refinance = anticipated_year_sale_refinance; });
}

ACTION projects::approveprjct(name actor,
															uint64_t project_id,
															string fund_lp,
															asset total_fund_offering_amount,
															uint64_t total_number_fund_offering,
															asset price_per_fund_unit)
{
	require_auth(actor);

	check_asset(total_fund_offering_amount, common::contracts::projects);
	check_asset(price_per_fund_unit, common::contracts::projects);

	check_user_role(actor, common::projects::entity::fund);

	auto project_itr = project_t.find(project_id);
	check(project_itr != project_t.end(), common::contracts::projects.to_string() + ": the project does not exist.");
	check(project_itr->status == PROJECT_STATUS.AWAITING_FUND_APPROVAL, common::contracts::projects.to_string() + ": the project has been already approved.");

	uint64_t role_id = 0;

	uint64_t developer_entity = get_user_entity(project_itr->builder);
	uint64_t fund_entity = get_user_entity(actor);

	action(
			permission_level(common::contracts::accounts, "active"_n),
			common::contracts::accounts,
			"addledger"_n,
			std::make_tuple(project_id, developer_entity))
			.send();

	action(
			permission_level(common::contracts::accounts, "active"_n),
			common::contracts::accounts,
			"addledger"_n,
			std::make_tuple(project_id, fund_entity))
			.send();

	action(
			permission_level(common::contracts::permissions, "active"_n),
			common::contracts::permissions,
			"initroles"_n,
			std::make_tuple(project_id))
			.send();

	action(
			permission_level(common::contracts::permissions, "active"_n),
			common::contracts::permissions,
			"assignrole"_n,
			std::make_tuple(common::contracts::permissions, project_itr->builder, project_id, role_id)) // ! builder
			.send();

	action(
			permission_level(common::contracts::permissions, "active"_n),
			common::contracts::permissions,
			"assignrole"_n,
			std::make_tuple(common::contracts::permissions, actor, project_id, role_id)) // ! admin
			.send();

	action(
			permission_level(common::contracts::transactions, "active"_n),
			common::contracts::transactions,
			"initdrawdown"_n,
			std::make_tuple(project_id))
			.send();

	project_t.modify(project_itr, _self, [&](auto &modified_project)
									 {
		modified_project.fund_lp = fund_lp;
		modified_project.total_fund_offering_amount = total_fund_offering_amount;
		modified_project.total_number_fund_offering = total_number_fund_offering;
		modified_project.price_per_fund_unit = price_per_fund_unit;
		modified_project.approved_by = actor;
		modified_project.approved_date = eosio::current_time_point().sec_since_epoch();
		modified_project.status = PROJECT_STATUS.READY_FOR_INVESTMENT; });
}

ACTION projects::invest(name actor,
												uint64_t project_id,
												asset total_investment_amount,
												uint64_t quantity_units_purchased,
												uint16_t annual_preferred_return,
												uint64_t signed_agreement_date,
												string subscription_package)
{

	require_auth(actor);

	check_asset(total_investment_amount, common::contracts::projects);

	check_user_role(actor, ENTITY_TYPES.INVESTOR);

	auto project_itr = project_t.find(project_id);
	check(project_itr != project_t.end(), common::contracts::projects.to_string() + ": the project does not exist.");
	check(project_itr->status == PROJECT_STATUS.READY_FOR_INVESTMENT || project_itr->status == PROJECT_STATUS.INVESTMENT_GOAL_REACHED,
				common::contracts::projects.to_string() + ": the project can not accept any investment.");

	check(subscription_package.length() > 0, common::contracts::projects.to_string() + ": the signed subscription page can not be empty.");

	investment_t.emplace(_self, [&](auto &new_investment)
											 {
		new_investment.investment_id = investment_t.available_primary_key();
		new_investment.user = actor;
		new_investment.project_id = project_id;
		new_investment.total_investment_amount = total_investment_amount;
		new_investment.quantity_units_purchased = quantity_units_purchased;
		new_investment.annual_preferred_return = annual_preferred_return;
		new_investment.signed_agreement_date = signed_agreement_date;
		new_investment.subscription_package = subscription_package;
		new_investment.status = INVESTMENT_STATUS.PENDING;
		new_investment.investment_date = eosio::current_time_point().sec_since_epoch();
		new_investment.total_confirmed_transferred_amount = asset(0, common::currency);
		new_investment.total_unconfirmed_transferred_amount = asset(0, common::currency);
		new_investment.total_confirmed_transfers = 0;
		new_investment.total_unconfirmed_transfers = 0; });
}

ACTION projects::editinvest(name actor,
														uint64_t investment_id,
														asset total_investment_amount,
														uint64_t quantity_units_purchased,
														uint16_t annual_preferred_return,
														uint64_t signed_agreement_date,
														string subscription_package)
{

	require_auth(actor);

	check_asset(total_investment_amount, common::contracts::projects);

	auto itr_investment = investment_t.find(investment_id);
	check(itr_investment != investment_t.end(), common::contracts::projects.to_string() + ": the investment does not exist.");
	check(itr_investment->status == INVESTMENT_STATUS.PENDING, common::contracts::projects.to_string() + ": the investment can not be modified anymore.");
	check(itr_investment->user == actor, common::contracts::projects.to_string() + ": only the investment issuer can modify it.");

	check(subscription_package.length() > 0, common::contracts::projects.to_string() + ": the signed subscription page can not be empty.");

	investment_t.modify(itr_investment, _self, [&](auto &modified_investment)
											{
		modified_investment.total_investment_amount = total_investment_amount;
		modified_investment.quantity_units_purchased = quantity_units_purchased;
		modified_investment.annual_preferred_return = annual_preferred_return;
		modified_investment.signed_agreement_date = signed_agreement_date;
		modified_investment.subscription_package = subscription_package;
		modified_investment.investment_date = eosio::current_time_point().sec_since_epoch(); });
}

ACTION projects::deleteinvest(name actor, uint64_t investment_id)
{
	require_auth(actor);

	auto itr_investment = investment_t.find(investment_id);
	check(itr_investment != investment_t.end(), common::contracts::projects.to_string() + ": the investment request does not exist.");
	check(itr_investment->status == INVESTMENT_STATUS.PENDING,
				common::contracts::projects.to_string() + ": the investment request can not be modified anymore as it has been already approved by a fund.");
	check(itr_investment->user == actor, common::contracts::projects.to_string() + ": only the investment issuer can do this.");

	investment_t.erase(itr_investment);
}

ACTION projects::approveinvst(name actor, uint64_t investment_id)
{
	require_auth(actor);

	check_user_role(actor, ENTITY_TYPES.FUND);

	auto itr_investment = investment_t.find(investment_id);
	check(itr_investment != investment_t.end(), common::contracts::projects.to_string() + ": the investment does not exist.");
	check(itr_investment->status == INVESTMENT_STATUS.PENDING, common::contracts::projects.to_string() + ": the invesment has been already approved.");

	investment_t.modify(itr_investment, _self, [&](auto &modified_investment)
											{
		modified_investment.status = INVESTMENT_STATUS.FUNDING;
		modified_investment.approved_by = actor;
		modified_investment.approved_date = eosio::current_time_point().sec_since_epoch(); });
}

ACTION projects::maketransfer(name actor, asset amount, uint64_t investment_id, string proof_of_transfer, uint64_t transfer_date)
{
	require_auth(actor);

	check_user_role(actor, ENTITY_TYPES.INVESTOR);
	check_asset(amount, common::contracts::projects);

	auto itr_investment = investment_t.find(investment_id);
	check(itr_investment != investment_t.end(), common::contracts::projects.to_string() + ": the investment does not exist.");
	check(itr_investment->user == actor, common::contracts::projects.to_string() + ": the user can only make a transfer in an investment created by itself.");
	check(itr_investment->status == INVESTMENT_STATUS.FUNDING,
				common::contracts::projects.to_string() + ": the investment has not been approved yet or it could have been closed.");

	check(itr_investment->total_confirmed_transferred_amount + amount <= itr_investment->total_investment_amount,
				common::contracts::projects.to_string() + ": the payments can not exceed the total investment amount.");

	fund_transfer_t.emplace(_self, [&](auto &new_transfer)
													{
		new_transfer.fund_transfer_id = fund_transfer_t.available_primary_key();
		new_transfer.amount = amount;
		new_transfer.investment_id = investment_id;
		new_transfer.user = actor;
		new_transfer.transfer_date = transfer_date;
		new_transfer.proof_of_transfer = proof_of_transfer;
		new_transfer.updated_date = eosio::current_time_point().sec_since_epoch();
		new_transfer.status = TRANSFER_STATUS.AWAITING_CONFIRMATION; });

	investment_t.modify(itr_investment, _self, [&](auto &modified_investment)
											{
		modified_investment.total_unconfirmed_transferred_amount += amount;
		modified_investment.total_unconfirmed_transfers += 1; });
}

ACTION projects::edittransfer(name actor,
															uint64_t transfer_id,
															asset amount,
															string proof_of_transfer,
															uint64_t date)
{

	require_auth(actor);

	check_asset(amount, common::contracts::projects);

	auto itr_transfer = fund_transfer_t.find(transfer_id);
	check(itr_transfer != fund_transfer_t.end(), common::contracts::projects.to_string() + ": the transfer does not exist.");
	check(itr_transfer->status == TRANSFER_STATUS.AWAITING_CONFIRMATION, common::contracts::projects.to_string() + ": the transfer can not be edited anymore.");
	check(itr_transfer->user == actor, common::contracts::projects.to_string() + ": only the transfer issuer can do this.");

	uint64_t investment_id = itr_transfer->investment_id;
	auto itr_investment = investment_t.find(investment_id);

	asset old_amount = itr_transfer->amount;

	check(itr_investment->total_confirmed_transferred_amount + amount <= itr_investment->total_investment_amount,
				common::contracts::projects.to_string() + ": the payments can not exceed the total investment amount.");

	fund_transfer_t.modify(itr_transfer, _self, [&](auto &modified_transfer)
												 {
		modified_transfer.amount = amount;
		modified_transfer.transfer_date = date;
		modified_transfer.proof_of_transfer = proof_of_transfer;
		modified_transfer.updated_date = eosio::current_time_point().sec_since_epoch(); });

	investment_t.modify(itr_investment, _self, [&](auto &modified_investment)
											{
		modified_investment.total_unconfirmed_transferred_amount -= old_amount;
		modified_investment.total_unconfirmed_transferred_amount += amount; });
}

ACTION projects::deletetrnsfr(name actor, uint64_t transfer_id)
{
	require_auth(actor);

	auto itr_transfer = fund_transfer_t.find(transfer_id);
	check(itr_transfer != fund_transfer_t.end(), common::contracts::projects.to_string() + ": the transfer does not exist.");
	check(itr_transfer->user == actor, common::contracts::projects.to_string() + ": only the transfer issuer can do this.");
	check(itr_transfer->status == TRANSFER_STATUS.AWAITING_CONFIRMATION, common::contracts::projects.to_string() + ": the transfer can not be modified anymore.");

	delete_transfer_aux(transfer_id);
}

ACTION projects::confrmtrnsfr(name actor, uint64_t transfer_id, string proof_of_transfer)
{
	require_auth(actor);

	check_user_role(actor, ENTITY_TYPES.FUND);

	auto itr_transfer = fund_transfer_t.find(transfer_id);
	check(itr_transfer != fund_transfer_t.end(), common::contracts::projects.to_string() + ": the transfer does not exist.");
	check(itr_transfer->status == TRANSFER_STATUS.AWAITING_CONFIRMATION, common::contracts::projects.to_string() + ": the transfer has been already confirmed.");

	uint64_t investment_id = itr_transfer->investment_id;
	asset amount = itr_transfer->amount;

	auto itr_investment = investment_t.find(investment_id);

	asset total_amount = itr_investment->total_confirmed_transferred_amount + amount;
	asset total_investment = itr_investment->total_investment_amount;

	check(total_amount <= total_investment, common::contracts::projects.to_string() + ": the payments can not exceed the total investment amount.");

	fund_transfer_t.modify(itr_transfer, _self, [&](auto &modified_transfer)
												 {
		modified_transfer.status = TRANSFER_STATUS.CONFIRMED;
		modified_transfer.confirmed_date = eosio::current_time_point().sec_since_epoch();
		modified_transfer.updated_date = eosio::current_time_point().sec_since_epoch();
		modified_transfer.confirmed_by = actor;

		if (proof_of_transfer.length() > 0) {
			modified_transfer.proof_of_transfer = proof_of_transfer;
		} });

	investment_t.modify(itr_investment, _self, [&](auto &modified_investment)
											{
		if (total_amount == total_investment) {
			modified_investment.status = INVESTMENT_STATUS.FUNDED;
		}
		modified_investment.total_unconfirmed_transferred_amount -= amount;
		modified_investment.total_confirmed_transferred_amount += amount;
		modified_investment.total_confirmed_transfers += 1;
		modified_investment.total_unconfirmed_transfers -= 1; });
}

ACTION projects::changestatus(uint64_t project_id, uint64_t status)
{

	require_auth(_self);

	auto itr = project_t.find(project_id);
	check(itr != project_t.end(), common::contracts::projects.to_string() + ": project not found.");

	project_t.modify(itr, _self, [&](auto &item)
									 { item.status = status; });
}

// Users

ACTION projects::adduser(const eosio::name &actor, const eosio::name &account, const std::string &user_name, const eosio::name &role)
{
	auto actor_itr = user_t.find(actor.value);

	if (actor_itr != user_t.end())
	{

		require_auth(actor);
		check(actor_itr->role == common::projects::entity::fund, actor.to_string() + " has not permissions to do that!");
	}
	else
	{
		require_auth(_self);
	}
	auto user_itr = user_t.find(account.value);
	check(user_itr == user_t.end(), common::contracts::projects.to_string() + ": the account " + account.to_string() + " already exist.");

	std::unique_ptr<User> user = std::unique_ptr<User>(UserFactory::Factory(*this, role));
	user->create(account, user_name, role, "description");
}

ACTION projects::assignuser(const eosio::name &actor, const eosio::name &account, const uint64_t &project_id)
{
	auto actor_itr = user_t.find(actor.value);

	if (actor_itr != user_t.end())
	{
		require_auth(actor);
		check(actor_itr->role == common::projects::entity::fund, actor.to_string() + " has not permissions to do that!");
	}
	else
	{
		require_auth(_self);
	}
	auto user_itr = user_t.find(account.value);
	check(user_itr != user_t.end(), common::contracts::projects.to_string() + ": the account does not exist.");

	auto project_itr = project_t.find(project_id);
	check(project_itr != project_t.end(), common::contracts::projects.to_string() + ": the project does not exist.");

	std::unique_ptr<User> user = std::unique_ptr<User>(UserFactory::Factory(*this, user_itr->role));
	user->assign(account, project_id);
}

ACTION projects::removeuser(const eosio::name &actor, const eosio::name &account, const uint64_t &project_id)
{
	auto actor_itr = user_t.find(actor.value);

	if (actor_itr != user_t.end())
	{

		require_auth(actor);
		check(actor_itr->role == common::projects::entity::fund, actor.to_string() + " has not permissions to do that!");
	}
	else
	{
		require_auth(_self);
	}
	auto user_itr = user_t.find(account.value);
	check(user_itr != user_t.end(), common::contracts::projects.to_string() + ": the account does not exist.");

	auto project_itr = project_t.find(project_id);
	check(project_itr != project_t.end(), common::contracts::projects.to_string() + ": the project does not exist.");

	std::unique_ptr<User> user = std::unique_ptr<User>(UserFactory::Factory(*this, user_itr->role));
	user->unassign(account, project_id);
}

ACTION projects::deleteuser(const eosio::name &actor, const eosio::name &account)
{
	auto actor_itr = user_t.find(actor.value);

	if (actor_itr != user_t.end())
	{

		require_auth(actor);
		check(actor_itr->role == common::projects::entity::fund, actor.to_string() + " has not permissions to do that!");
	}
	else
	{
		require_auth(_self);
	}
	auto user_itr = user_t.find(account.value);
	check(user_itr != user_t.end(), common::contracts::projects.to_string() + ": the account does not exist.");

	std::unique_ptr<User> user = std::unique_ptr<User>(UserFactory::Factory(*this, user_itr->role));
	user->remove(account);
}