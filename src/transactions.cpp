#include <transactions.hpp>

bool transactions::check_permissions(name actor, uint64_t project_id, name function) {
	user_permission_table permissions(_self, project_id);
	
	auto it_p = permissions.find(actor.value);
	check(it_p != permissions.end(), contract_name.to_string() + ": the actor " + actor.to_string() + " does not have an entry in the permissions of this project.");
	
	auto it_a = action_permissions.find(function.value);
	check(it_a != action_permissions.end(), contract_name.to_string() + ": the action " + function.to_string() + " does not exist.");

	for (int i = 0; i < it_p -> roles.size(); i++) {
		for (int j = 0; j < it_a -> roles.size(); j++) {
			if (it_p -> roles[i] == it_a -> roles[j]) {
				return true;
			}
		}
	}

	return false;
}

ACTION transactions::reset () {
	require_auth(_self);

	auto itr_roles = roles.begin();
	while (itr_roles != roles.end()) {
		itr_roles = roles.erase(itr_roles);
	}

	for (int i = 0; i < roles_v.size(); i++) {
		roles.emplace(_self, [&](auto & nrole){
			nrole.role_id = roles_v[i].first;
			nrole.role_name = roles_v[i].second;
		});
	}

	auto itr_a_p = action_permissions.begin();
	while (itr_a_p != action_permissions.end()) {
		itr_a_p = action_permissions.erase(itr_a_p);
	}

	action_permissions.emplace(_self, [&](auto & new_action){
		new_action.action_p = "transact"_n;
		new_action.roles.emplace_back(Permissions::OWNER);
		new_action.roles.emplace_back(Permissions::MANAGER);
		new_action.roles.emplace_back(Permissions::ACCOUNTANT);
	});

	action_permissions.emplace(_self, [&](auto & new_action){
		new_action.action_p = "addaccount"_n;
		new_action.roles.emplace_back(Permissions::OWNER);
		new_action.roles.emplace_back(Permissions::MANAGER);
	});

	for (int i = 0; i < 100; i++) {
		user_permission_tables permissions(_self, i);
		auto itr_u_p = permissions.begin();
		while (itr_u_p != permissions.end()) {
			itr_u_p = permissions.erase(itr_u_p);
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

/* ACTION transactions::transact ( name actor, 
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
} */


// ACTION transactions::invest() {}

ACTION transactions::addaccount ( name actor,
								  uint64_t project_id, 
								  string account_name, 
								  uint64_t parent_id, 
								  uint8_t type, 
								  symbol account_currency ) {

	require_auth(permission_level(actor, app_permission));
	check(check_permissions(actor, project_id, "addaccount"_n), contract_name.to_string() + ": the user " + actor.to_string() + " does not have permissions to do this.");

	

	print("HERE I AM");
}


// ACTION transactions::removeaccnt (name actor) {
// 	require_auth(permission_level(actor, app_permission));
// 	return;
	
// }


EOSIO_DISPATCH(transactions, (reset)/*(transact)*/(addaccount)(addproject));
