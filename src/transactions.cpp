#include <transactions.hpp>


name transactions::get_action_from (string type_from, bool increase) {
	name action_from;

	if (increase) {
		action_from = "addbalance"_n;
	} else {
		action_from = "subbalance"_n;
	}

	return action_from;
}

name transactions::get_action_to (string type_from, string type_to, bool increase) {
	name action_to;

	if (type_from == ACCOUNT_TYPES.DEBIT) {
		if (increase) { // left side
			if (type_to == ACCOUNT_TYPES.DEBIT) {
				action_to = "subbalance"_n;
			} else {
				action_to = "addbalance"_n;
			}
		} else { // right side
			if (type_to == ACCOUNT_TYPES.DEBIT) {
				action_to = "addbalance"_n;
			}
			else {
				action_to = "subbalance"_n;
			}
		}
	} else { // from is credit
		if (increase) { // right side
			if (type_to == ACCOUNT_TYPES.DEBIT) {
				action_to = "addbalance"_n;
			} else {
				action_to = "subbalance"_n;
			}
		} else { // left side
			if (type_to == ACCOUNT_TYPES.DEBIT) {
				action_to = "subbalance"_n;
			} else {
				action_to = "addbalance"_n;
			}
		}
	}

	return action_to;
}

string transactions::get_account_type (uint64_t project_id, uint64_t account_id) {

	account_tables accounts(contract_names::accounts, project_id);

	auto itr_account = accounts.find(account_id);
	check(itr_account != accounts.end(), contract_names::transactions.to_string() + ": the account with the id = " + to_string(account_id) + " does not exist.");

	string type_account;

	auto itr_type_account = account_types.begin();
	while (itr_type_account != account_types.end()) {
		if (itr_type_account -> type_name == itr_account -> account_subtype) {
			type_account = itr_type_account -> account_class;
		}
		itr_type_account++;
	}

	return type_account;
}

name transactions::get_cancel_action (name action_to_be_canceled) {
	return (action_to_be_canceled == "addbalance"_n) ? "canceladd"_n : "cancelsub"_n;
}

void transactions::make_transaction ( name actor, 
									  uint64_t project_id, 
									  uint64_t from, 
									  uint64_t to,
									  uint64_t date,
									  string description, 
									  asset amount, 
									  bool increase,
									  vector<string> supporting_urls ) {

	string type_from = get_account_type(project_id, from);
	string type_to = get_account_type(project_id, to);

	transaction_tables transactions(_self, project_id);

	transactions.emplace(_self, [&](auto & new_transaction){
		new_transaction.transaction_id = transactions.available_primary_key();
		new_transaction.from = from;
		new_transaction.to = to;
		new_transaction.from_increase = increase;
		new_transaction.amount = amount;
		new_transaction.actor = actor;
		new_transaction.timestamp = date;
		new_transaction.description = description;
		
		for (int i = 0; i < supporting_urls.size(); i++) {
			new_transaction.supporting_urls.push_back(supporting_urls[i]);
		}
	});

	name action_from = get_action_from(type_from, increase);
	name action_to = get_action_to(type_from, type_to, increase);
	
	action (
		permission_level(contract_names::accounts, "active"_n),
		contract_names::accounts,
		action_from,
		std::make_tuple(project_id, from, amount)
	).send();

	action (
		permission_level(contract_names::accounts, "active"_n),
		contract_names::accounts,
		action_to,
		std::make_tuple(project_id, to, amount)
	).send();
}

void transactions::delete_transaction (uint64_t project_id, uint64_t transaction_id) {

	transaction_tables transactions(_self, project_id);

	auto itr_trxn = transactions.find(transaction_id);
	check(itr_trxn != transactions.end(), contract_names::transactions.to_string() + ": the transaction you want to delete does not exist.");

	asset amount = itr_trxn -> amount;
	bool increase = itr_trxn -> from_increase;
	uint64_t from = itr_trxn -> from;
	uint64_t to = itr_trxn -> to;

	string type_from = get_account_type(project_id, from);
	string type_to = get_account_type(project_id, to);

	name action_from = get_cancel_action(get_action_from(type_from, increase));
	name action_to = get_cancel_action(get_action_to(type_from, type_to, increase));

	transactions.erase(itr_trxn);

	action (
		permission_level(contract_names::accounts, "active"_n),
		contract_names::accounts,
		action_from,
		std::make_tuple(project_id, from, amount)
	).send();

	action (
		permission_level(contract_names::accounts, "active"_n),
		contract_names::accounts,
		action_to,
		std::make_tuple(project_id, to, amount)
	).send();
}

ACTION transactions::reset () {
	require_auth(_self);

	for (int i = 0; i < RESET_IDS; i++) {
		transaction_tables transactions(_self, i);
		auto itr_t = transactions.begin();
		while (itr_t != transactions.end()) {
			itr_t = transactions.erase(itr_t);
		}
	}
}

ACTION transactions::transact ( name actor, 
								uint64_t project_id, 
								uint64_t from, 
								uint64_t to,
								uint64_t date,
								string description, 
								asset amount, 
								bool increase,
								vector<string> supporting_urls ) {

	require_auth(actor);
	check_asset(amount, contract_names::transactions);
	check(from != to, contract_names::transactions.to_string() + ": from must be different than to");

	action (
        permission_level(contract_names::permissions, "active"_n),
        contract_names::permissions,
        "checkprmissn"_n,
        std::make_tuple(actor, project_id, ACTION_NAMES.TRANSACTIONS_ADD)
    ).send();

	auto itr_project = projects.find(project_id);
	check(itr_project != projects.end(), contract_names::transactions.to_string() + ": the project with the id = " + to_string(project_id) + " does not exist.");

	make_transaction(actor, project_id, from, to, date, description, amount, increase, supporting_urls);
}

ACTION transactions::deletetrxn (name actor, uint64_t project_id, uint64_t transaction_id) {
	require_auth(actor);

	action (
        permission_level(contract_names::permissions, "active"_n),
        contract_names::permissions,
        "checkprmissn"_n,
        std::make_tuple(actor, project_id, ACTION_NAMES.TRANSACTIONS_REMOVE)
    ).send();

	delete_transaction(project_id, transaction_id);
}

ACTION transactions::edittrxn ( name actor,
								uint64_t project_id, 
								uint64_t transaction_id,
								uint64_t date,
								string description,
								asset amount,
								bool increase,
								vector<string> supporting_urls ) {
	
	require_auth(actor);
	check_asset(amount, contract_names::transactions);

	action (
        permission_level(contract_names::permissions, "active"_n),
        contract_names::permissions,
        "checkprmissn"_n,
        std::make_tuple(actor, project_id, ACTION_NAMES.TRANSACTIONS_EDIT)
    ).send();

	auto itr_project = projects.find(project_id);
	check(itr_project != projects.end(), contract_names::transactions.to_string() + ": the project with the id = " + to_string(project_id) + " does not exist.");

	transaction_tables transactions(_self, project_id);

	auto itr_trxn = transactions.find(transaction_id);
	check(itr_trxn != transactions.end(), contract_names::transactions.to_string() + ": the transaction does not exist.");

	uint64_t from = itr_trxn -> from;
	uint64_t to = itr_trxn -> to;

	delete_transaction(project_id, transaction_id);
	make_transaction(actor, project_id, from, to, date, description, amount, increase, supporting_urls);
}


ACTION transactions::deletetrxns (uint64_t project_id) {
	require_auth(_self);

	transaction_tables transactions(_self, project_id);

	auto itr_transaction = transactions.begin();
	while (itr_transaction != transactions.end()) {
		itr_transaction = transactions.erase(itr_transaction);
	}
}


EOSIO_DISPATCH(transactions, (reset)(transact)(deletetrxn)(edittrxn)(deletetrxns));
