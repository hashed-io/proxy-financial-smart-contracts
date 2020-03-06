#include <accounts.hpp>


void accounts::change_balance (uint64_t project_id, uint64_t account_id, asset amount, bool increase, bool cancel) {
    account_tables accounts(_self, project_id);

    auto itr_account = accounts.find(account_id);
    check(itr_account != accounts.end(), contract_names::accounts.to_string() + ": the account does not exist.");
    check(itr_account -> num_children == 0, contract_names::accounts.to_string() + ": can not add balance to a parent account.");

    uint64_t parent_id = 0;
    while (itr_account != accounts.end()) {
        parent_id = itr_account -> parent_id;
        print("PROCESSED:", itr_account -> account_name, "\n");
        accounts.modify(itr_account, _self, [&](auto & modified_account){
            if (increase) {
                if (cancel) {
                    modified_account.increase_balance -= amount;
                } else {
                    modified_account.increase_balance += amount;
                }
            } else {
                if (cancel) {
                    modified_account.decrease_balance -= amount;
                } else {
                    modified_account.decrease_balance += amount;
                }
            } 
        });
        itr_account = accounts.find(parent_id);
    }
}

ACTION accounts::reset () {
    require_auth(_self);

    for (int i = 0; i < RESET_IDS; i++) {
        account_tables accounts(_self, i);
        auto itr_accounts = accounts.begin();
        while (itr_accounts != accounts.end()) {
            itr_accounts = accounts.erase(itr_accounts);
        }
    }

    auto itr_types = account_types.begin();
	while (itr_types != account_types.end()) {
		itr_types = account_types.erase(itr_types);
	}

	for (int i = 0; i < account_types_v.size(); i++) {
		account_types.emplace(_self, [&](auto & naccount){
			naccount.type_id = account_types.available_primary_key();
			naccount.type_name = account_types_v[i].first;
			naccount.account_class = account_types_v[i].second;
		});
	}
}

ACTION accounts::initaccounts (uint64_t project_id) {
    require_auth(_self);

    auto project = projects_table.find(project_id);
    check(project != projects_table.end(), contract_names::accounts.to_string() + ": project does not exist.");
    
    account_tables accounts(_self, project_id);
    
    auto itr_types = account_types.begin();
    while (itr_types != account_types.end()) {
        uint64_t new_account_id = accounts.available_primary_key();
        new_account_id = (new_account_id > 0) ? new_account_id : 1;
        
        accounts.emplace(_self, [&](auto & new_account){
            new_account.account_id = new_account_id; 
            new_account.parent_id = 0;
            new_account.num_children = 0;
            new_account.account_name = itr_types -> type_name;
            new_account.account_subtype = itr_types -> type_name;
            new_account.increase_balance = asset(0, CURRENCY);
            new_account.decrease_balance = asset(0, CURRENCY);
            new_account.account_symbol = CURRENCY;
        });
        itr_types++;
    }
}

ACTION accounts::addbalance (uint64_t project_id, uint64_t account_id, asset amount) {
    require_auth(_self);
    check_asset(amount, contract_names::accounts);

    change_balance(project_id, account_id, amount, true, false);
}

ACTION accounts::subbalance (uint64_t project_id, uint64_t account_id, asset amount) {
    require_auth(_self);
    check_asset(amount, contract_names::accounts);

    change_balance(project_id, account_id, amount, false, false); 
}

ACTION accounts::canceladd (uint64_t project_id, uint64_t account_id, asset amount) {
    require_auth(_self);
    check_asset(amount, contract_names::accounts);

    change_balance(project_id, account_id, amount, true, true);
}

ACTION accounts::cancelsub (uint64_t project_id, uint64_t account_id, asset amount) {
    require_auth(_self);
    check_asset(amount, contract_names::accounts);

    change_balance(project_id, account_id, amount, false, true);
}

ACTION accounts::editaccount (name actor, uint64_t project_id, uint64_t account_id, string new_name) {
    require_auth(actor);

    //================================//
    //== check for permissions here ==//
    //================================//

    auto itr_project = projects_table.find(project_id);
    check(itr_project != projects_table.end(), contract_names::accounts.to_string() + ": the project does not exist.");

    account_tables accounts(_self, project_id);

    auto itr_account = accounts.find(account_id);
    check(itr_account != accounts.end(), contract_names::accounts.to_string() + ": the account does not exist.");

    auto itr_accounts = accounts.begin();
    while (itr_accounts != accounts.end()) {
        check(itr_accounts -> account_name != new_name, contract_names::accounts.to_string() + ": that name has been already taken.");
        itr_accounts++;
    }

    accounts.modify(itr_account, _self, [&](auto & modified_account){
        modified_account.account_name = new_name;
    });
}

ACTION accounts::deleteaccnt (name actor, uint64_t project_id, uint64_t account_id) {
    require_auth(actor);

    //================================//
    //== check for permissions here ==//
    //================================//

    auto project = projects_table.find(project_id);
	check(project != projects_table.end(), contract_names::accounts.to_string() + ": the project where the account is trying to be placed does not exist.");

	account_tables accounts(_self, project_id);

    auto account = accounts.find(account_id);
    check(account != accounts.end(), contract_names::accounts.to_string() + ": the account does not exist.");

    check(account -> num_children == 0, contract_names::accounts.to_string() + ": the account has subaccounts and can not be deleted.");
    check(account -> increase_balance == asset(0, CURRENCY), contract_names::accounts.to_string() + ": the account has an increase balance grater than 0 and can not be deleted.");
    check(account -> decrease_balance == asset(0, CURRENCY), contract_names::accounts.to_string() + ": the account has a decrease balance grater than 0 and can not be deleted.");

    auto parent = accounts.find(account -> parent_id);
    check(parent != accounts.end(), contract_names::accounts.to_string() + ": the parent account does not exist.");

    accounts.modify(parent, _self, [&](auto & modified_account){
        modified_account.num_children -= 1;
    });

    accounts.erase(account);
}

ACTION accounts::addaccount ( name actor,
                              uint64_t project_id, 
                              string account_name, 
                              uint64_t parent_id, 
                              string account_subtype, 
                              symbol account_currency ) {

    require_auth(actor);

    //================================//
    //== check for permissions here ==//
    //================================//

    auto project_exists = projects_table.find(project_id);
	check(project_exists != projects_table.end(), contract_names::accounts.to_string() + ": the project where the account is trying to be placed does not exist.");

	account_tables accounts(_self, project_id);
	
	auto itr_accounts = accounts.begin();
	while (itr_accounts != accounts.end()) {
		check(itr_accounts -> account_name != account_name, contract_names::accounts.to_string() + ": the name of the account already exists.");
		itr_accounts++;
	}

	check(account_currency == CURRENCY, contract_names::accounts.to_string() + ": the currency must be the same.");
    check(parent_id != 0, contract_names::accounts.to_string() + ": the parent id must be grater than zero.");

    auto parent = accounts.find(parent_id);
    check(parent != accounts.end(), contract_names::accounts.to_string() + ": the parent account does not exist.");
    check(parent -> increase_balance == asset(0, CURRENCY) && parent -> decrease_balance == asset(0, CURRENCY), contract_names::accounts.to_string() + ": the parent's balance is not zero.");
    check(account_subtype == parent -> account_subtype, contract_names::accounts.to_string() + ": the child account must have the same type as its parent's.");

    uint64_t new_account_id = accounts.available_primary_key();
    new_account_id = (new_account_id > 0) ? new_account_id : 1;

	accounts.emplace(_self, [&](auto & new_account){
		new_account.account_id = new_account_id; 
		new_account.parent_id = parent_id;
		new_account.account_name = account_name;
		new_account.account_subtype = account_subtype;
		new_account.increase_balance = asset(0, CURRENCY);
		new_account.decrease_balance = asset(0, CURRENCY);
		new_account.account_symbol = CURRENCY;
	});

    accounts.modify(parent, _self, [&](auto & modified_account){
        modified_account.num_children += 1;
    });
    
}


EOSIO_DISPATCH(accounts, (reset)(addaccount)(initaccounts)(addbalance)(subbalance)(canceladd)(cancelsub));

