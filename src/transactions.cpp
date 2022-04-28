#include <transactions.hpp>

/*

	TODO
	[ ] create multiple options / types of drawdowns for each project only builder and admin
	 can create those builder EB5 admin all of them.

	 [ ] on the drawdown, summit new information for each drawdown type

	 [ ] update transactions::submitdrwdn to get the drawdown type

	 [ ] update transactions::transact to accept a vector of expenses

*/

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

	action(
			permission_level(common::contracts::permissions, "active"_n),
			common::contracts::permissions,
			"checkledger"_n,
			std::make_tuple(actor, project_id, ledger_id))
			.send();

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
															{ 
																item.total_amount += asset(total_positive, common::currency); });
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

	action(
			permission_level(common::contracts::permissions, "active"_n),
			common::contracts::permissions,
			"checkledger"_n,
			std::make_tuple(actor, project_id, ledger_id))
			.send();

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
		drawdown_tables drawdowns(_self, project_id);

		auto drawdowns_by_state = drawdowns.get_index<"bystate"_n>();
		auto itr_drawdown = drawdowns_by_state.find(DRAWDOWN_STATES.OPEN);

		check(itr_drawdown != drawdowns_by_state.end(), common::contracts::transactions.to_string() + ": there are no open drawdowns.");

		drawdowns_by_state.modify(itr_drawdown, _self, [&](auto &item)
															{ item.total_amount -= total_amount; });
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

	/* action (
				permission_level(common::contracts::permissions, "active"_n),
				common::contracts::permissions,
				"checkprmissn"_n,
				std::make_tuple(actor, project_id, ACTION_NAMES.TRANSACTIONS_ADD)
		).send(); */

	auto itr_project = projects.find(project_id);
	check(itr_project != projects.end(), common::contracts::transactions.to_string() + ": the project with the id = " + to_string(project_id) + " does not exist.");

	make_transaction(actor, 0, project_id, amounts, date, description, drawdown_type, accounting, supporting_files);
}

ACTION transactions::deletetrxn(name actor, uint64_t project_id, uint64_t transaction_id)
{
	require_auth(actor);

	/* action (
				permission_level(common::contracts::permissions, "active"_n),
				common::contracts::permissions,
				"checkprmissn"_n,
				std::make_tuple(actor, project_id, ACTION_NAMES.TRANSACTIONS_REMOVE)
		).send(); */

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

	/* action (
				permission_level(common::contracts::permissions, "active"_n),
				common::contracts::permissions,
				"checkprmissn"_n,
				std::make_tuple(actor, project_id, ACTION_NAMES.TRANSACTIONS_EDIT)
		).send(); */

	auto itr_project = projects.find(project_id);
	check(itr_project != projects.end(), common::contracts::transactions.to_string() + ": the project with the id = " + to_string(project_id) + " does not exist.");

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

	if (actor != _self)
	{

		// ======================================== //
		// ======== CHECK PERMISSIONS HERE ======== //
		// ======================================== //
	}

	drawdown_tables drawdowns(_self, project_id);

	// change this to accept a vector of transactions
	auto drawdowns_by_state = drawdowns.get_index<"bystate"_n>();
	auto itr_drawdown = drawdowns_by_state.find(DRAWDOWN_STATES.OPEN);

	check(itr_drawdown != drawdowns_by_state.end(),
				common::contracts::transactions.to_string() + ": the project has no open drawdowns, the project may not exist.");

	drawdowns_by_state.modify(itr_drawdown, _self, [&](auto &item)
														{
		item.state = DRAWDOWN_STATES.CLOSE;
		item.close_date = eosio::current_time_point().sec_since_epoch();

		for (int i = 0; i < accounting.size(); i++) {
			item.accounting.push_back(accounting[i]);
		}

		for (int i = 0; i < files.size(); i++) {
			item.files.push_back(files[i]);
		} });

		

	drawdowns.emplace(_self, [&](auto &item)
										{
		item.drawdown_id = get_valid_index(drawdowns.available_primary_key());
		item.total_amount = asset(0, common::currency);
		item.state = DRAWDOWN_STATES.OPEN;
		item.open_date = eosio::current_time_point().sec_since_epoch();
		item.close_date = 0; });
}

ACTION transactions::initdrawdown(uint64_t project_id, std::string drawdown_type)
{
	require_auth(_self);

	check(DRAWDOWN_TYPES.is_valid_constant(drawdown_type), common::contracts::transactions.to_string() + ": Unkown drawdown type");

	drawdown_tables drawdowns(_self, project_id);

	auto drawdowns_by_state = drawdowns.get_index<"bystate"_n>();
	auto itr_drawdown = drawdowns_by_state.find(DRAWDOWN_STATES.OPEN);

	bool existing_drawdown = false;

	while (itr_drawdown != drawdowns_by_state.end())
	{
		/* code */
		if (itr_drawdown->type == drawdown_type)
		{
			existing_drawdown = true;
			break;
		}

		itr_drawdown++;
	}

	check(!existing_drawdown, "Drawdown already exists!");

	drawdowns.emplace(_self, [&](auto &item)
										{
		item.drawdown_id = get_valid_index(drawdowns.available_primary_key());
		item.type = drawdown_type;
		item.total_amount = asset(0, common::currency);
		item.state = DRAWDOWN_STATES.OPEN;
		item.open_date = eosio::current_time_point().sec_since_epoch();
		item.close_date = 0; });
}

ACTION transactions::toggledrdwn(uint64_t project_id,
																 uint64_t drawdown_id)
{
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