#include <transactions.hpp>


void transactions::check_asset(asset amount) {
	check(amount.symbol == currency, contract_name.to_string() + ": the symbols must be the same.");
	check(amount > asset(0, currency), contract_name.to_string() + ": the amount must be greater than zero.");
}

ACTION transactions::reset () {
	require_auth(_self);

	auto itr_p = projects.begin();
	while (itr_p != projects.end()) {
		itr_p = projects.erase(itr_p);
	}

	for (int i = 0; i < 100; i++) {
		account_tables accounts(_self, i);
		auto itr_a = accounts.begin();
		while (itr_a != accounts.end()) {
			itr_a = accounts.erase(itr_a);
		}
	}

	for (int i = 0; i < 100; i++) {
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
	require_auth(permission_level(actor, app_permission));

	check_asset(amount);

	auto itr_project = projects.find(project_id);
	check(itr_project != projects.end(), contract_name.to_string() + ": the project with the id = " + to_string(project_id) + " does not exist.");

	account_tables accounts(_self, project_id);

	auto itr_from = accounts.find(from);
	check(itr_from != accounts.end(), contract_name.to_string() + ": the account with the id = " + to_string(from) + " does not exist.");

	auto itr_to = accounts.find(to);
	check(itr_to != accounts.end(), contract_name.to_string() + ": the account with the id = " + to_string(to) + " does not exist.");

	uint8_t type_from = itr_from -> type;
	uint8_t type_to = itr_to -> type;

	transaction_tables transactions(_self, project_id);

	transactions.emplace(_self, [&](auto & new_transaction){
		new_transaction.transaction_id = transactions.available_primary_key();
		new_transaction.from = from;
		new_transaction.to = to;
		new_transaction.from_increase = increase;
		new_transaction.amount = amount;
		new_transaction.actor = actor;
		new_transaction.timestamp = eosio::current_time_point().sec_since_epoch();
		new_transaction.description = description;
		
		for (int i = 0; i < supporting_urls.size(); i++) {
			new_transaction.supporting_urls.push_back(supporting_urls[i]);
		}
	});

	accounts.modify(itr_from, _self, [&](auto & mod_account){
		if (increase) {
			mod_account.increase_balance += amount;
		} else {
			mod_account.decrease_balance += amount;
		}
	});

	accounts.modify(itr_to, _self, [&](auto & mod_account){
		if (type_from == AccountType::debit) {
			if (increase) {
				if (type_to == AccountType::debit) {
					mod_account.decrease_balance += amount;
				} else {
					mod_account.increase_balance += amount;
				}
			} else {
				if (type_to == AccountType::debit) {
					mod_account.increase_balance += amount;
				}
				else {
					mod_account.decrease_balance += amount;
				}
			}
		} else { // from is credit
			if (increase) {
				if (type_to == AccountType::debit) {
					mod_account.increase_balance += amount;
				} else {
					mod_account.decrease_balance += amount;
				}
			} else {
				if (type_to == AccountType::debit) {
					mod_account.decrease_balance += amount;
				} else {
					mod_account.increase_balance += amount;
				}
			}
		}
	});
}


// ACTION transactions::invest() {}

ACTION transactions::addproject ( name actor,
								  string project_name,
								  string description,
								  asset initial_goal ) {

	require_auth(permission_level(actor, app_permission));

	check_asset(initial_goal);

	auto itr_p = projects.begin();
	while (itr_p != projects.end()) {
		check(project_name != itr_p -> project_name, contract_name.to_string() + ": there is a project with that name.");
	}

	projects.emplace(_self, [&](auto & new_project) {
		new_project.project_id = projects.available_primary_key();
		new_project.owner = actor;
		new_project.project_name = project_name;
		new_project.description = description;
		new_project.initial_goal = initial_goal;
	});

}


ACTION transactions::addaccount ( name actor,
								  uint64_t project_id, 
								  string account_name, 
								  uint64_t parent_id, 
								  uint8_t type, 
								  symbol account_currency ) {
	require_auth(permission_level(actor, app_permission));

	account_tables accounts(_self, project_id);
	
	auto itr_accounts = accounts.begin();

	while (itr_accounts != accounts.end()) {
		check(itr_accounts -> account_name != account_name, contract_name.to_string() + ": the name of the account already exists.");
	}

	check(account_currency == currency, contract_name.to_string() + ": the currency must be the same.");
	check(type == AccountType::debit || type == AccountType::credit, contract_name.to_string() + ": the type must be debit or credit.");

	uint64_t new_id = accounts.available_primary_key();

	accounts.emplace(_self, [&](auto & new_account){
		new_account.account_id = ((new_id == 0) ? 1 : new_id); 
		new_account.parent_id = parent_id;
		new_account.account_name = account_name;
		new_account.type = type;
		new_account.increase_balance = asset(0, currency);
		new_account.decrease_balance = asset(0, currency);
		new_account.account_symbol = currency;
	});
}


// ACTION transactions::removeaccnt (name actor) {
// 	require_auth(permission_level(actor, app_permission));
// 	return;
	
// }


EOSIO_DISPATCH(transactions, (reset)(transact)(addaccount)(addproject));
