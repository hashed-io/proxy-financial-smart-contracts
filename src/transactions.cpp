#include <transactions.hpp>

#include <drawdowns/drawdown_factory.hpp>

#include "drawdowns/base_drawdown.cpp"
#include "drawdowns/eb5_drawdown.cpp"
#include "drawdowns/construction_loan_drawdown.cpp"
#include "drawdowns/developer_equity_drawdown.cpp"

/*

	TODO
	[ ] create multiple options / types of drawdowns for each project only builder and admin
	 can create those builder EB5 admin all of them.

	 [ ] on the drawdown, summit new information for each drawdown type

	 [ ] update transactions::submitdrwdn to get the drawdown type

	 [ ] update transactions::transact to accept a vector of expeses

*/

void transactions::create_drawdown(const uint64_t &project_id,
																	 const eosio::name &drawdown_type,
																	 const uint64_t &drawdown_number)
{

	std::unique_ptr<Drawdown> drawdown = std::unique_ptr<Drawdown>(DrawdownFactory::Factory(project_id, *this, drawdown_type));
	drawdown->create(drawdown_type, drawdown_number);
}

void transactions::make_transaction(name actor,
																		uint64_t transaction_id,
																		uint64_t project_id,
																		vector<common::types::transaction_amount> &amounts,
																		uint64_t &date,
																		string &description,
																		std::string &drawdown_type,
																		vector<common::types::transaction_subtypes> &accounting,
																		vector<common::types::url_information> &supporting_files)
{

	transaction_tables transactions(_self, project_id);
	account_transaction_tables account_transacion_t(_self, project_id);

	account_tables accounts(common::contracts::accounts, project_id);

	auto itr_amounts = amounts.begin();
	uint64_t trx_id = 0;
	int64_t total = 0;
	uint64_t total_positive = 0;
	uint64_t ledger_id = 0;
	uint64_t transaction_category = ACCOUNT_CATEGORIES.NONE;
	name action_accnt;

	if (transaction_id == 0)
	{
		trx_id = transactions.available_primary_key();
		trx_id = (trx_id > 0) ? trx_id : 1;
	}
	else
	{
		trx_id = transaction_id;
	}

	while (itr_amounts != amounts.end())
	{
		auto itr_account = accounts.find(itr_amounts->account_id);
		check(itr_account != accounts.end(), common::contracts::transactions.to_string() + ": the account does not exist.");

		if (ledger_id != itr_account->ledger_id)
		{
			check(ledger_id == 0, common::contracts::transactions.to_string() + ": can not edit different ledgers in the same transaction.");
			ledger_id = itr_account->ledger_id;
		}

		if (transaction_category == ACCOUNT_CATEGORIES.NONE)
		{
			transaction_category = itr_account->account_category;
		}

		account_transacion_t.emplace(_self, [&](auto &item)
																 {
			item.accnt_transaction_id = account_transacion_t.available_primary_key();
			item.transaction_id = trx_id;
			item.account_id = itr_amounts -> account_id;
			item.amount = itr_amounts -> amount; });

		total += itr_amounts->amount;

		if (itr_amounts->amount < 0)
		{
			action_accnt = "subbalance"_n;
		}
		else
		{
			action_accnt = "addbalance"_n;
			total_positive += itr_amounts->amount;
		}

		action(
				permission_level(common::contracts::accounts, "active"_n),
				common::contracts::accounts,
				action_accnt,
				std::make_tuple(project_id, itr_amounts->account_id, asset(abs(itr_amounts->amount), common::currency)))
				.send();

		itr_amounts++;
	}

	check(ledger_id > 0, common::contracts::transactions.to_string() + ": no ledger will be modified.");

	// TODO checar esta validacion
	check(total == 0, common::contracts::transactions.to_string() + ": the transaction total balance must be zero.");

	uint64_t drawdown_id = 0;

	check(DRAWDOWN_TYPES.is_valid_constant(drawdown_type), common::contracts::transactions.to_string() + ": Unkown drawdown type");

	if (DRAWDOWN_TYPES.is_valid_constant(drawdown_type))
	{
		drawdown_tables drawdowns(_self, project_id);

		auto drawdowns_by_state = drawdowns.get_index<"bystate"_n>();
		auto itr_drawdown = drawdowns_by_state.find(DRAWDOWN_STATES.OPEN);

		check(itr_drawdown != drawdowns_by_state.end(), common::contracts::transactions.to_string() + ": there are no open drawdowns.");

		drawdown_id = itr_drawdown->drawdown_id;

		drawdowns_by_state.modify(itr_drawdown, _self, [&](auto &item)
															{ item.total_amount += asset(total_positive, common::currency); });
	}

	transactions.emplace(_self, [&](auto &item)
											 {
		item.transaction_id = trx_id;
		item.actor = actor;
		item.timestamp = date;
		item.description = description;
		item.drawdown_id = drawdown_id;
		item.transaction_category = transaction_category;
		item.total_amount = asset(total_positive, common::currency);

		for (int i = 0; i < accounting.size(); i++) {
			item.accounting.push_back(accounting[i]);
		}
		
		for (int i = 0; i < supporting_files.size(); i++) {
			item.supporting_files.push_back(supporting_files[i]);
		} });
}

void transactions::delete_transaction(name actor,
																			uint64_t project_id,
																			uint64_t transaction_id)
{

	transaction_tables transactions(_self, project_id);
	account_transaction_tables account_transacion_t(_self, project_id);

	auto itr_trxn = transactions.find(transaction_id);
	check(itr_trxn != transactions.end(), common::contracts::transactions.to_string() + ": the transaction you want to delete does not exist.");

	auto account_transacion_t_by_transactions = account_transacion_t.get_index<"bytrxns"_n>();
	auto itr_amount = account_transacion_t_by_transactions.find(transaction_id);
	uint64_t ledger_id = 0;
	asset total_amount = asset(0, common::currency);
	name action_cancel_amount;

	if (itr_amount != account_transacion_t_by_transactions.end())
	{
		account_tables accounts(common::contracts::accounts, project_id);
		auto itr_account = accounts.find(itr_amount->account_id);
		ledger_id = itr_account->ledger_id;
	}

	// ! same as generate_transaction

	while (itr_amount != account_transacion_t_by_transactions.end() &&
				 itr_amount->transaction_id == transaction_id)
	{

		if (itr_amount->amount < 0)
		{
			action_cancel_amount = "cancelsub"_n;
		}
		else
		{
			action_cancel_amount = "canceladd"_n;
			total_amount += asset(itr_amount->amount, common::currency);
		}

		action(
				permission_level(common::contracts::accounts, "active"_n),
				common::contracts::accounts,
				action_cancel_amount,
				std::make_tuple(project_id, itr_amount->account_id, asset(abs(itr_amount->amount), common::currency)))
				.send();

		itr_amount = account_transacion_t_by_transactions.erase(itr_amount);
	}

	if (itr_trxn->drawdown_id)
	{
		drawdown_tables drawdown_t(_self, project_id);
		auto drawdown_itr = drawdown_t.find(itr_trxn->drawdown_id);

		std::unique_ptr<Drawdown> drawdown = std::unique_ptr<Drawdown>(DrawdownFactory::Factory(project_id, *this, drawdown_itr->type));
		drawdown->update(itr_trxn->drawdown_id, total_amount, common::transactions::drawdown::flag::remove_balance);
	}

	transactions.erase(itr_trxn);
}

ACTION transactions::reset()
{
	require_auth(_self);

	for (int i = 0; i < common::reset_ids; i++)
	{
		transaction_tables transactions(_self, i);

		auto itr_t = transactions.begin();
		while (itr_t != transactions.end())
		{
			itr_t = transactions.erase(itr_t);
		}

		account_transaction_tables account_transacion_t(_self, i);

		auto itr_at = account_transacion_t.begin();
		while (itr_at != account_transacion_t.end())
		{
			itr_at = account_transacion_t.erase(itr_at);
		}

		drawdown_tables drawdowns(_self, i);
		auto itr_d = drawdowns.begin();
		while (itr_d != drawdowns.end())
		{
			itr_d = drawdowns.erase(itr_d);
		}
	}
}
// TODO change this thing or is this the onlyone than handles the transaction?

ACTION transactions::transact(name actor,
															uint64_t transaction_id,
															uint64_t project_id,
															vector<common::types::transaction_amount> &amounts,
															uint64_t &date,
															string &description,
															std::string &drawdown_type,
															vector<common::types::transaction_subtypes> &accounting,
															vector<common::types::url_information> &supporting_files)
{

	require_auth(actor);

	auto project_itr = project_t.find(project_id);
	check(project_itr != project_t.end(), common::contracts::transactions.to_string() + ": the project with the id = " + to_string(project_id) + " does not exist.");

	make_transaction(actor, 0, project_id, amounts, date, description, drawdown_type, accounting, supporting_files);
}

ACTION transactions::deletetrxn(name actor, uint64_t project_id, uint64_t transaction_id)
{
	require_auth(actor);

	delete_transaction(actor, project_id, transaction_id);
}

ACTION transactions::edittrxn(name actor,
															uint64_t project_id,
															uint64_t transaction_id,
															vector<common::types::transaction_amount> amounts,
															uint64_t date,
															string description,
															std::string &drawdown_type,
															vector<common::types::transaction_subtypes> &accounting,
															vector<common::types::url_information> &supporting_files)
{

	require_auth(actor);

	check(DRAWDOWN_TYPES.is_valid_constant(drawdown_type), "Unkown drawdown type");

	auto project_itr = project_t.find(project_id);
	check(project_itr != project_t.end(), common::contracts::transactions.to_string() + ": the project with the id = " + to_string(project_id) + " does not exist.");

	transaction_tables transactions(_self, project_id);

	auto itr_trxn = transactions.find(transaction_id);
	check(itr_trxn != transactions.end(), common::contracts::transactions.to_string() + ": the transaction does not exist.");

	if (itr_trxn->drawdown_id != 0)
	{
		drawdown_tables drawdowns(_self, project_id);
		auto itr_drawdown = drawdowns.find(itr_trxn->drawdown_id);
		check(itr_drawdown != drawdowns.end(), common::contracts::transactions.to_string() + ": the drawdown does not exist.");
		check(itr_drawdown->state == DRAWDOWN_STATES.OPEN, common::contracts::transactions.to_string() + ": can not modify a transaction within a closed drawdown.");
	}

	delete_transaction(actor, project_id, transaction_id);
	make_transaction(actor, transaction_id, project_id, amounts, date, description, drawdown_type, accounting, supporting_files);
}

ACTION transactions::deletetrxns(uint64_t project_id)
{
	require_auth(_self);

	transaction_tables transactions(_self, project_id);
	account_transaction_tables account_transacion_t(_self, project_id);

	auto itr_transaction = transactions.begin();
	while (itr_transaction != transactions.end())
	{
		itr_transaction = transactions.erase(itr_transaction);
	}

	auto itr_at = account_transacion_t.begin();
	while (itr_at != account_transacion_t.end())
	{
		itr_at = account_transacion_t.erase(itr_at);
	}
}

ACTION transactions::submitdrwdn(name actor,
																 uint64_t project_id,
																 vector<common::types::transaction_subtypes> &accounting,
																 vector<common::types::url_information> files
																 /*vector<common::types::url_information> files*/)
{
	require_auth(actor);
}

ACTION transactions::initdrawdown(const uint64_t &project_id)
{
	require_auth(_self);

	drawdown_tables drawdown_t(_self, project_id);
	auto drawdown_itr = drawdown_t.find(1);
	check(drawdown_itr == drawdown_t.end(), "Drawdowns have already started");

	std::unique_ptr<Drawdown> drawdown_eb5 = std::unique_ptr<Drawdown>(DrawdownFactory::Factory(project_id, *this, common::transactions::drawdown::type::eb5));
	drawdown_eb5->create(common::transactions::drawdown::type::eb5, 1);

	std::unique_ptr<Drawdown> drawdown_construction_loan = std::unique_ptr<Drawdown>(DrawdownFactory::Factory(project_id, *this, common::transactions::drawdown::type::construction_loan));
	drawdown_construction_loan->create(common::transactions::drawdown::type::construction_loan, 1);

	std::unique_ptr<Drawdown> drawdown_developer_equity = std::unique_ptr<Drawdown>(DrawdownFactory::Factory(project_id, *this, common::transactions::drawdown::type::developer_equity));
	drawdown_developer_equity->create(common::transactions::drawdown::type::developer_equity, 1);
}

ACTION transactions::toggledrdwn(uint64_t project_id,
																 uint64_t drawdown_id)
{

	// ! remove this transaction
	require_auth(_self);

	print("drawdown toggled");

	drawdown_tables drawdowns(_self, project_id);

	auto drawdown_by_state = drawdowns.get_index<"bystate"_n>();
	auto itr_drawdown_by_state = drawdown_by_state.find(DRAWDOWN_STATES.OPEN);

	drawdown_by_state.modify(itr_drawdown_by_state, _self, [&](auto &item)
													 { item.state = DRAWDOWN_STATES.CLOSE; });

	auto itr_drawdown = drawdowns.find(drawdown_id);
	check(itr_drawdown != drawdowns.end(), "no drawdown found.");

	drawdowns.modify(itr_drawdown, _self, [&](auto &item)
									 {
		if (item.state == DRAWDOWN_STATES.CLOSE) {
			item.state = DRAWDOWN_STATES.OPEN;
		} });
}

ACTION transactions::movedrawdown(const eosio::name &actor,
																	const uint64_t &project_id,
																	const uint64_t &drawdown_id)
{

	drawdown_tables drawdown_t(_self, project_id);

	auto drawdown_itr = drawdown_t.find(drawdown_id);

	check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

	auto project_itr = project_t.find(project_id);

	check(project_itr != project_t.end(), "Project not found!");
	check(project_itr->builder == actor, actor.to_string() + " is not the project's builder!");

	drawdown_t.modify(drawdown_itr, _self, [&](auto &item)
										{ item.creator = actor;
										item.state = common::transactions::drawdown::status::submitted; });

	// TODO: check why this is not working
	// std::unique_ptr<Drawdown> drawdown = std::unique_ptr<Drawdown>(DrawdownFactory::Factory(project_id, *this, drawdown_itr->type));
	// drawdown->submit(drawdown_id);

	// std::unique_ptr<Drawdown> drawdown = std::unique_ptr<Drawdown>(DrawdownFactory::Factory(project_id, *this, drawdown_itr->type));
	// drawdown->update(drawdown_id, asset(total_positive, common::currency));
}

ACTION transactions::rejtdrawdown(const eosio::name &actor,
																	const uint64_t &project_id,
																	const uint64_t &drawdown_id)
{
	drawdown_tables drawdown_t(_self, project_id);
	auto drawdown_itr = drawdown_t.find(drawdown_id);

	check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

	auto user_itr = user_t.find(actor.value);

	check(user_itr != user_t.end(), "User not found");
	check(user_itr->role == common::projects::entity::fund, actor.to_string() + " has no permissions to reject this drawdown");

	drawdown_t.modify(drawdown_itr, _self, [&](auto &item)
										{ item.creator = actor;
										item.state = common::transactions::drawdown::status::daft; });

	// TODO: check why this is not working
	// std::unique_ptr<Drawdown> drawdown = std::unique_ptr<Drawdown>(DrawdownFactory::Factory(project_id, *this, drawdown_itr->type));
	// drawdown->reject(drawdown_id);
}

ACTION transactions::acptdrawdown(const eosio::name &actor,
																	const uint64_t &project_id,
																	const uint64_t &drawdown_id)
{

	drawdown_tables drawdown_t(_self, project_id);

	auto drawdown_itr = drawdown_t.find(drawdown_id);

	check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

	auto user_itr = user_t.find(actor.value);

	check(user_itr != user_t.end(), "User not found");
	check(user_itr->role == common::projects::entity::fund, actor.to_string() + " has no permissions to reject this drawdown");

	drawdown_t.modify(drawdown_itr, _self, [&](auto &item)
										{ item.creator = actor;
										item.state = common::transactions::drawdown::status::approved;
										item.close_date = eosio::current_time_point().sec_since_epoch(); });

	create_drawdown(project_id, drawdown_itr->type, drawdown_itr->drawdown_number + 1);

	// TODO: check why this is not working
	// std::unique_ptr<Drawdown> drawdown = std::unique_ptr<Drawdown>(DrawdownFactory::Factory(project_id, *this, drawdown_itr->type));
	// drawdown->approve(drawdown_id);
}

ACTION transactions::transacts(const eosio::name &actor,
															 const uint64_t &project_id,
															 const uint64_t &drawdown_id,
															 std::vector<common::types::transaction_param> transactions)
{
	require_auth(actor);

	for (int i = 0; i < transactions.size(); i++)
	{
		if (transactions[i].flag == common::transactions::flag::create)
		{
			generate_transaction(actor,
													 project_id,
													 drawdown_id,
													 transactions[i].id,
													 transactions[i].date,
													 transactions[i].amounts,
													 transactions[i].description,
													 transactions[i].supporting_files);
		}
		else if (transactions[i].flag == common::transactions::flag::remove)
		{
			delete_transaction(actor,
												 project_id,
												 transactions[i].id);
		}
		else if (transactions[i].flag == common::transactions::flag::edit)
		{

			delete_transaction(actor,
												 project_id,
												 transactions[i].id);

			generate_transaction(actor,
													 project_id,
													 drawdown_id,
													 transactions[i].id,
													 transactions[i].date,
													 transactions[i].amounts,
													 transactions[i].description,
													 transactions[i].supporting_files);
		}
	}
}

void transactions::generate_transaction(const eosio::name &actor,
																				const uint64_t &project_id,
																				const uint64_t &drawdown_id,
																				uint64_t transaction_id,
																				const uint64_t &date,
																				vector<common::types::transaction_amount> amounts,
																				const std::string description,
																				vector<common::types::url_information> supporting_files)
{

	transaction_tables transactions_t(_self, project_id);
	account_transaction_tables account_transacion_t(_self, project_id);

	account_tables account_t(common::contracts::accounts, project_id);

	auto itr_amounts = amounts.begin();
	uint64_t trx_id = 0;
	int64_t total = 0;
	uint64_t total_positive = 0;
	uint64_t ledger_id = 0;
	uint64_t transaction_category = ACCOUNT_CATEGORIES.NONE;
	name action_accnt;

	if (transaction_id == 0)
	{
		trx_id = transactions_t.available_primary_key();
		trx_id = (trx_id > 0) ? trx_id : 1;
	}
	else
	{
		trx_id = transaction_id;
	}

	while (itr_amounts != amounts.end())
	{
		auto itr_account = account_t.find(itr_amounts->account_id);
		check(itr_account != account_t.end(), common::contracts::transactions.to_string() + ": the account does not exist.");

		// ! update this to be the global ledger

		if (ledger_id != itr_account->ledger_id)
		{
			check(ledger_id == 0, common::contracts::transactions.to_string() + ": can not edit different ledgers in the same transaction.");
			ledger_id = itr_account->ledger_id;
		}

		if (transaction_category == ACCOUNT_CATEGORIES.NONE)
		{
			transaction_category = itr_account->account_category;
		}

		account_transacion_t.emplace(_self, [&](auto &item)
																 {
			item.accnt_transaction_id = account_transacion_t.available_primary_key();
			item.transaction_id = trx_id;
			item.account_id = itr_amounts -> account_id;
			item.amount = itr_amounts -> amount; });

		total += itr_amounts->amount;

		if (itr_amounts->amount < 0)
		{
			action_accnt = "subbalance"_n;
		}
		else
		{
			action_accnt = "addbalance"_n;
			total_positive += itr_amounts->amount;
		}
		// action name doesn't exist
		action(
				permission_level(common::contracts::accounts, "active"_n),
				common::contracts::accounts,
				action_accnt,
				std::make_tuple(project_id, itr_amounts->account_id, asset(abs(itr_amounts->amount), common::currency)))
				.send();

		itr_amounts++;
	}

	check(ledger_id > 0, common::contracts::transactions.to_string() + ": no ledger will be modified.");

	// TODO checar esta validacion
	// ! remove this when the validation is complete
	// check(total == 0, common::contracts::transactions.to_string() + ": the transaction total balance must be zero.");

	drawdown_tables drawdown_t(_self, project_id);

	auto drawdown_itr = drawdown_t.find(drawdown_id);

	std::unique_ptr<Drawdown> drawdown = std::unique_ptr<Drawdown>(DrawdownFactory::Factory(project_id, *this, drawdown_itr->type));
	drawdown->update(drawdown_id, asset(total_positive, common::currency), common::transactions::drawdown::flag::add_balance);

	transactions_t.emplace(_self, [&](auto &item)
												 {
		item.transaction_id = trx_id;
		item.actor = actor;
		item.timestamp = date;
		item.description = description;
		item.drawdown_id = drawdown_id;
		item.transaction_category = transaction_category;
		item.total_amount = asset(total_positive, common::currency);
		
		for (int i = 0; i < supporting_files.size(); i++) {
			item.supporting_files.push_back(supporting_files[i]);
		} });
}

ACTION transactions::bulktransact(const eosio::name &actor,
																	const uint64_t &project_id,
																	const uint64_t &drawdown_id,
																	vector<common::types::extended_url_information_param> transactions)
{
	require_auth(actor);

	for (int i = 0; i < transactions.size(); i++)
	{
		check_asset(transactions[i].amount, common::contracts::transactions);

		generate_bulk_files(actor,
												project_id,
												drawdown_id,
												transactions[i].supporting_files,
												transactions[i].description,
												transactions[i].date,
												transactions[i].amount,
												transactions[i].add_file);
	}
}

void transactions::generate_bulk_files(const eosio::name &actor,
																			 const uint64_t &project_id,
																			 const uint64_t &drawdown_id,
																			 vector<common::types::url_information> supporting_files,
																			 const std::string &description,
																			 const uint64_t &date,
																			 const eosio::asset &amount,
																			 const uint8_t &add_file)
{
	auto project_itr = project_t.find(project_id);
	check(project_itr != project_t.end(), "Project not found!");

	drawdown_tables drawdown_t(_self, project_id);
	auto drawdown_itr = drawdown_t.find(drawdown_id);
	check(drawdown_itr != drawdown_t.end(), "Drawdown not found");
	
	auto user_itr = user_t.find(actor.value);
	check(user_itr != user_t.end(), "User not found");
	check(user_itr -> role == common::projects::entity::developer && drawdown_itr -> state < common::transactions::drawdown::status::submitted, "builder role cannot create/modify/delete beyond this drawdown state");


	std::unique_ptr<Drawdown> drawdown = std::unique_ptr<Drawdown>(DrawdownFactory::Factory(project_id, *this, drawdown_itr->type));
	drawdown->edit(drawdown_id, supporting_files, description, date, amount, add_file);
}