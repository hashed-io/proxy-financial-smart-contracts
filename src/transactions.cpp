#include <transactions.hpp>


void transactions::make_transaction ( name actor,
									  uint64_t transaction_id,
									  uint64_t project_id, 
									  vector<transaction_amount> & amounts,
									  uint64_t & date,
									  string & description,
									  bool & is_drawdown,
									  vector<url_information> & supporting_files ) {

	transaction_tables transactions(_self, project_id);
	account_transaction_tables accnttrxns(_self, project_id);

	account_tables accounts(contract_names::accounts, project_id);

	auto itr_amounts = amounts.begin();
	uint64_t trx_id = 0;
	int64_t total = 0;
	uint64_t total_positive = 0;
	uint64_t ledger_id = 0;
	uint64_t transaction_category = ACCOUNT_CATEGORIES.NONE;
	name action_accnt;

	if (transaction_id == 0) {
		trx_id = transactions.available_primary_key();
		trx_id = (trx_id > 0) ? trx_id : 1;
	} else {
		trx_id = transaction_id;
	}

	while (itr_amounts != amounts.end()) {
		auto itr_account = accounts.find(itr_amounts -> account_id);
		check(itr_account != accounts.end(), contract_names::transactions.to_string() + ": the account does not exist.");

		if (ledger_id != itr_account -> ledger_id) {
			check(ledger_id == 0, contract_names::transactions.to_string() + ": can not edit diferent ledgers in the same transaction.");
			ledger_id = itr_account -> ledger_id;
		}

		if (transaction_category == ACCOUNT_CATEGORIES.NONE) {
			transaction_category = itr_account -> account_category;
		}

		accnttrxns.emplace(_self, [&](auto & atrx){
			atrx.accnt_transaction_id = accnttrxns.available_primary_key();
			atrx.transaction_id = trx_id;
			atrx.account_id = itr_amounts -> account_id;
			atrx.amount = itr_amounts -> amount;
		});

		total += itr_amounts -> amount;


		if (itr_amounts -> amount < 0) {
			action_accnt = "subbalance"_n;
		} else {
			action_accnt = "addbalance"_n;
			total_positive += itr_amounts -> amount;
		}

		action (
			permission_level(contract_names::accounts, "active"_n),
			contract_names::accounts,
			action_accnt,
			std::make_tuple(project_id, itr_amounts -> account_id, asset(abs(itr_amounts -> amount), CURRENCY))
		).send();

		itr_amounts++;
	}

	check(ledger_id > 0, contract_names::transactions.to_string() + ": no ledger will be modified.");

	action (
		permission_level(contract_names::permissions, "active"_n),
		contract_names::permissions,
		"checkledger"_n,
		std::make_tuple(actor, project_id, ledger_id)
	).send();

	check(total == 0, contract_names::transactions.to_string() + ": the transaction total balance must be zero.");

	uint64_t drawdown_id = 0;

	if (is_drawdown) {
		drawdown_tables drawdowns(_self, project_id);

		auto drawdowns_by_state = drawdowns.get_index<"bystate"_n>();
		auto itr_drawdown = drawdowns_by_state.find(DRAWDOWN_STATES.OPEN);

		check(itr_drawdown != drawdowns_by_state.end(), contract_names::transactions.to_string() + ": there are no open drawdowns.");
		
		drawdown_id = itr_drawdown -> drawdown_id;

		drawdowns_by_state.modify(itr_drawdown, _self, [&](auto & modified_drawdown){
			modified_drawdown.total_amount += asset(total_positive, CURRENCY);
		});
	}

	transactions.emplace(_self, [&](auto & new_transaction){
		new_transaction.transaction_id = trx_id;
		new_transaction.actor = actor;
		new_transaction.timestamp = date;
		new_transaction.description = description;
		new_transaction.drawdown_id = drawdown_id;
		new_transaction.transaction_category = transaction_category;
		new_transaction.total_amount = asset(total_positive, CURRENCY);
		
		for (int i = 0; i < supporting_files.size(); i++) {
			new_transaction.supporting_files.push_back(supporting_files[i]);
		}
	});
	
}

void transactions::delete_transaction (name actor, uint64_t project_id, uint64_t transaction_id) {

	transaction_tables transactions(_self, project_id);
	account_transaction_tables accnttrxns(_self, project_id);

	auto itr_trxn = transactions.find(transaction_id);
	check(itr_trxn != transactions.end(), contract_names::transactions.to_string() + ": the transaction you want to delete does not exist.");

	auto accnttrxns_by_transactions = accnttrxns.get_index<"bytrxns"_n>();
	auto itr_amount = accnttrxns_by_transactions.find(transaction_id);
	uint64_t ledger_id = 0;
	asset total_amount = asset(0, CURRENCY);
	name action_cancel_amount;

	if (itr_amount != accnttrxns_by_transactions.end()) {
		account_tables accounts(contract_names::accounts, project_id);
		auto itr_account = accounts.find(itr_amount -> account_id);
		ledger_id = itr_account -> ledger_id;
	}

	action (
		permission_level(contract_names::permissions, "active"_n),
		contract_names::permissions,
		"checkledger"_n,
		std::make_tuple(actor, project_id, ledger_id)
	).send();

	while (itr_amount != accnttrxns_by_transactions.end() &&
		   itr_amount -> transaction_id == transaction_id) {
		
		if (itr_amount -> amount < 0) {
			action_cancel_amount = "cancelsub"_n;
		} else {
			action_cancel_amount = "canceladd"_n;
			total_amount += asset(itr_amount -> amount, CURRENCY);
		}

		action (
			permission_level(contract_names::accounts, "active"_n),
			contract_names::accounts,
			action_cancel_amount,
			std::make_tuple(project_id, itr_amount -> account_id, asset(abs(itr_amount -> amount), CURRENCY))
		).send();

		itr_amount = accnttrxns_by_transactions.erase(itr_amount);
	}

	if (itr_trxn -> drawdown_id) {
		drawdown_tables drawdowns(_self, project_id);

		auto drawdowns_by_state = drawdowns.get_index<"bystate"_n>();
		auto itr_drawdown = drawdowns_by_state.find(DRAWDOWN_STATES.OPEN);

		check(itr_drawdown != drawdowns_by_state.end(), contract_names::transactions.to_string() + ": there are no open drawdowns.");

		drawdowns_by_state.modify(itr_drawdown, _self, [&](auto & modified_drawdown){
			modified_drawdown.total_amount -= total_amount;
		});
	}

	transactions.erase(itr_trxn);
}




ACTION transactions::reset () {
	require_auth(_self);

	for (int i = 0; i < RESET_IDS; i++) {
		transaction_tables transactions(_self, i);
		
		auto itr_t = transactions.begin();
		while (itr_t != transactions.end()) {
			itr_t = transactions.erase(itr_t);
		}

		account_transaction_tables accnttrxns(_self, i);

		auto itr_at = accnttrxns.begin();
		while (itr_at != accnttrxns.end()) {
			itr_at = accnttrxns.erase(itr_at);
		}

		drawdown_tables drawdowns(_self, i);
		auto itr_d = drawdowns.begin();
		while (itr_d != drawdowns.end()) {
			itr_d = drawdowns.erase(itr_d);
		}
	}
}

ACTION transactions::transact ( name actor, 
						  		uint64_t project_id, 
								vector<transaction_amount> amounts,
								uint64_t date,
								string description,
								bool is_drawdown,
								vector<url_information> supporting_files ) {

	require_auth(actor);

	/* action (
        permission_level(contract_names::permissions, "active"_n),
        contract_names::permissions,
        "checkprmissn"_n,
        std::make_tuple(actor, project_id, ACTION_NAMES.TRANSACTIONS_ADD)
    ).send(); */

	auto itr_project = projects.find(project_id);
	check(itr_project != projects.end(), contract_names::transactions.to_string() + ": the project with the id = " + to_string(project_id) + " does not exist.");

	make_transaction(actor, 0, project_id, amounts, date, description, is_drawdown, supporting_files);
}

ACTION transactions::deletetrxn (name actor, uint64_t project_id, uint64_t transaction_id) {
	require_auth(actor);

	/* action (
        permission_level(contract_names::permissions, "active"_n),
        contract_names::permissions,
        "checkprmissn"_n,
        std::make_tuple(actor, project_id, ACTION_NAMES.TRANSACTIONS_REMOVE)
    ).send(); */

	delete_transaction(actor, project_id, transaction_id);
}

ACTION transactions::edittrxn ( name actor, 
								uint64_t project_id,
								uint64_t transaction_id,
								vector<transaction_amount> amounts,
								uint64_t date,
								string description,
								bool is_drawdown,
								vector<url_information> supporting_files ) {
	
	require_auth(actor);

	/* action (
        permission_level(contract_names::permissions, "active"_n),
        contract_names::permissions,
        "checkprmissn"_n,
        std::make_tuple(actor, project_id, ACTION_NAMES.TRANSACTIONS_EDIT)
    ).send(); */

	auto itr_project = projects.find(project_id);
	check(itr_project != projects.end(), contract_names::transactions.to_string() + ": the project with the id = " + to_string(project_id) + " does not exist.");

	transaction_tables transactions(_self, project_id);

	auto itr_trxn = transactions.find(transaction_id);
	check(itr_trxn != transactions.end(), contract_names::transactions.to_string() + ": the transaction does not exist.");

	if (itr_trxn -> drawdown_id != 0) {
		drawdown_tables drawdowns(_self, project_id);
		auto itr_drawdown = drawdowns.find(itr_trxn -> drawdown_id);
		check(itr_drawdown != drawdowns.end(), contract_names::transactions.to_string() + ": the drawdown does not exist.");
		check(itr_drawdown -> state == DRAWDOWN_STATES.OPEN, contract_names::transactions.to_string() + ": can not modify a transaction within a closed drawdown.");
	}
	
	delete_transaction(actor, project_id, transaction_id);
	make_transaction(actor, transaction_id, project_id, amounts, date, description, is_drawdown, supporting_files);
}


ACTION transactions::deletetrxns (uint64_t project_id) {
	require_auth(_self);

	transaction_tables transactions(_self, project_id);
	account_transaction_tables accnttrxns(_self, project_id);

	auto itr_transaction = transactions.begin();
	while (itr_transaction != transactions.end()) {
		itr_transaction = transactions.erase(itr_transaction);
	}

	auto itr_at = accnttrxns.begin();
	while (itr_at != accnttrxns.end()) {
		itr_at = accnttrxns.erase(itr_at);
	}
}




ACTION transactions::submitdrwdn (name actor, uint64_t project_id, vector<url_information> files) {
	require_auth(actor);

	if (actor != _self) {

		// ======================================== //
		// ======== CHECK PERMISSIONS HERE ======== //
		// ======================================== //

	}

	drawdown_tables drawdowns(_self, project_id);

	auto drawdowns_by_state = drawdowns.get_index<"bystate"_n>();
	auto itr_drawdown = drawdowns_by_state.find(DRAWDOWN_STATES.OPEN);

	check(itr_drawdown != drawdowns_by_state.end(), 
		contract_names::transactions.to_string() + ": the project has no open drawdowns, the project may not exist.");

	drawdowns_by_state.modify(itr_drawdown, _self, [&](auto & modified_drawdown){
		modified_drawdown.state = DRAWDOWN_STATES.CLOSE;
		modified_drawdown.close_date = eosio::current_time_point().sec_since_epoch();

		for (int i = 0; i < files.size(); i++) {
			modified_drawdown.files.push_back(files[i]);
		}
	});

	drawdowns.emplace(_self, [&](auto & new_drawdown){
		new_drawdown.drawdown_id = get_valid_index(drawdowns.available_primary_key());
		new_drawdown.total_amount = asset(0, CURRENCY);
		new_drawdown.state = DRAWDOWN_STATES.OPEN;
		new_drawdown.open_date = eosio::current_time_point().sec_since_epoch();
		new_drawdown.close_date = 0;
	});
}


ACTION transactions::initdrawdown (uint64_t project_id) {
	require_auth(_self);

	drawdown_tables drawdowns(_self, project_id);

	auto drawdowns_by_state = drawdowns.get_index<"bystate"_n>();
	auto itr_drawdown = drawdowns_by_state.find(DRAWDOWN_STATES.OPEN);

	check(itr_drawdown == drawdowns_by_state.end(),
		contract_names::transactions.to_string() + ": there is already an open drawdown in this project.");

	drawdowns.emplace(_self, [&](auto & new_drawdown){
		new_drawdown.drawdown_id = get_valid_index(drawdowns.available_primary_key());
		new_drawdown.total_amount = asset(0, CURRENCY);
		new_drawdown.state = DRAWDOWN_STATES.OPEN;
		new_drawdown.open_date = eosio::current_time_point().sec_since_epoch();
		new_drawdown.close_date = 0;
	});
}

ACTION transactions::toggledrdwn (uint64_t project_id, uint64_t drawdown_id) {
	require_auth(_self);

	print("drawdown toggled");

	drawdown_tables drawdowns(_self, project_id);

	auto drawdown_by_state = drawdowns.get_index<"bystate"_n>();
	auto itr_drawdown_by_state = drawdown_by_state.find(DRAWDOWN_STATES.OPEN);

	drawdown_by_state.modify(itr_drawdown_by_state, _self, [&](auto & md){
		md.state = DRAWDOWN_STATES.CLOSE;
	});

	auto itr_drawdown = drawdowns.find(drawdown_id);
	check(itr_drawdown != drawdowns.end(), "no drawdown found.");

	drawdowns.modify(itr_drawdown, _self, [&](auto & mdrawdown){
		if (mdrawdown.state == DRAWDOWN_STATES.CLOSE) {
			mdrawdown.state = DRAWDOWN_STATES.OPEN;
		}
	});
}



EOSIO_DISPATCH(transactions, (reset)(transact)(deletetrxn)(edittrxn)(deletetrxns)(submitdrwdn)(initdrawdown)(toggledrdwn));
