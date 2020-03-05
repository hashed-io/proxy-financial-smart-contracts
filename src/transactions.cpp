#include <transactions.hpp>

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

	//================================//
    //== check for permissions here ==//
    //================================//

	auto itr_project = projects.find(project_id);
	check(itr_project != projects.end(), contract_names::transactions.to_string() + ": the project with the id = " + to_string(project_id) + " does not exist.");

	account_tables accounts(contract_names::accounts, project_id);

	auto itr_from = accounts.find(from);
	check(itr_from != accounts.end(), contract_names::transactions.to_string() + ": the account with the id = " + to_string(from) + " does not exist.");

	auto itr_to = accounts.find(to);
	check(itr_to != accounts.end(), contract_names::transactions.to_string() + ": the account with the id = " + to_string(to) + " does not exist.");

	string type_from;
	auto itr_type_from = account_types.begin();
	while (itr_type_from != account_types.end()) {
		if (itr_type_from -> type_name == itr_from -> account_subtype) {
			type_from = itr_type_from -> account_class;
		}
		itr_type_from++;
	}

	string type_to;
	auto itr_type_to =account_types.begin();
	while (itr_type_to != account_types.end()) {
		if (itr_type_to -> type_name == itr_to -> account_subtype) {
			type_to = itr_type_to -> account_class;
		}
		itr_type_to++;
	}

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

	name action_from;
	name action_to;
	
	if (increase) {
		action_from = "addbalance"_n;
	} else {
		action_from = "subbalance"_n;
	}

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





EOSIO_DISPATCH(transactions, (reset)(transact));
