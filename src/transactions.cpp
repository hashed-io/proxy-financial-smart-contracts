#include <transactions.hpp>


void check_asset(asset amount) {
	check(amount.symbol == currency, contract_name.to_string() + ": the symbols must be the same.");
	check(amount > 0, contract_name.to_string() + ": the amount must be greater than zero.");
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


ACTION transactions::addaccount ( name actor,
								  uint64_t project_id, 
								  string account_name, 
								  uint64_t parent, 
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

	accounts.emplace(_self, [&](auto & new_account){
		new_account.account_id = accounts.available_primary_key();
		new_account.parent_id = parent_id;
		new_account.account_name = account_name;
		new_account.type = type;
		new_account.increase_balance = asset(0, currency);
		new_account.decrease_balance = asset(0, currency);
		new_account.account_symbol = currency;
	});
}


ACTION transactions::removeaccnt (name actor) {
	require_auth(permission_level(actor, app_permission));

	
}


EOSIO_DISPATCH(transactions, (transact)(addaccount));
