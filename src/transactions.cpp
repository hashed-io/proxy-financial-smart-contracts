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
								string description, 
								asset amount, 
								bool increase,
								vector<string> supporting_urls ) {

	require_auth(actor);
	check_asset(amount);

	//================================//
    //== check for permissions here ==//
    //================================//

	auto itr_project = projects.find(project_id);
	check(itr_project != projects.end(), contract_names::transactions.to_string() + ": the project with the id = " + to_string(project_id) + " does not exist.");

	account_tables accounts(_self, project_id);

	auto itr_from = accounts.find(from);
	check(itr_from != accounts.end(), contract_names::transactions.to_string() + ": the account with the id = " + to_string(from) + " does not exist.");

	auto itr_to = accounts.find(to);
	check(itr_to != accounts.end(), contract_names::transactions.to_string() + ": the account with the id = " + to_string(to) + " does not exist.");

	// uint8_t type_from = itr_from -> type;
	// uint8_t type_to = itr_to -> type;

	// transaction_tables transactions(_self, project_id);

	// transactions.emplace(_self, [&](auto & new_transaction){
	// 	new_transaction.transaction_id = transactions.available_primary_key();
	// 	new_transaction.from = from;
	// 	new_transaction.to = to;
	// 	new_transaction.from_increase = increase;
	// 	new_transaction.amount = amount;
	// 	new_transaction.actor = actor;
	// 	new_transaction.timestamp = eosio::current_time_point().sec_since_epoch();
	// 	new_transaction.description = description;
		
	// 	for (int i = 0; i < supporting_urls.size(); i++) {
	// 		new_transaction.supporting_urls.push_back(supporting_urls[i]);
	// 	}
	// });

	// accounts.modify(itr_from, _self, [&](auto & mod_account){
	// 	if (increase) {
	// 		mod_account.increase_balance += amount;
	// 	} else {
	// 		mod_account.decrease_balance += amount;
	// 	}
	// });

	// accounts.modify(itr_to, _self, [&](auto & mod_account){
	// 	if (type_from == AccountType::debit) {
	// 		if (increase) {
	// 			if (type_to == AccountType::debit) {
	// 				mod_account.decrease_balance += amount;
	// 			} else {
	// 				mod_account.increase_balance += amount;
	// 			}
	// 		} else {
	// 			if (type_to == AccountType::debit) {
	// 				mod_account.increase_balance += amount;
	// 			}
	// 			else {
	// 				mod_account.decrease_balance += amount;
	// 			}
	// 		}
	// 	} else { // from is credit
	// 		if (increase) {
	// 			if (type_to == AccountType::debit) {
	// 				mod_account.increase_balance += amount;
	// 			} else {
	// 				mod_account.decrease_balance += amount;
	// 			}
	// 		} else {
	// 			if (type_to == AccountType::debit) {
	// 				mod_account.decrease_balance += amount;
	// 			} else {
	// 				mod_account.increase_balance += amount;
	// 			}
	// 		}
	// 	}
	// });
}

// ACTION transactions::removeaccnt (name actor) {
// 	require_auth(permission_level(actor, app_permission));
// 	return;
	
// }


EOSIO_DISPATCH(transactions, (reset)(transact));
