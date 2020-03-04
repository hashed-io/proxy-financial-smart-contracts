#include <accounts.hpp>

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
            new_account.account_name = itr_types -> type_name;
            new_account.account_subtype = itr_types -> type_name;
            new_account.increase_balance = asset(0, CURRENCY);
            new_account.decrease_balance = asset(0, CURRENCY);
            new_account.account_symbol = CURRENCY;
        });
        itr_types++;
    }
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

	if (parent_id != 0) {
		auto parent = accounts.find(parent_id);
		check(parent != accounts.end(), contract_names::accounts.to_string() + ": the parent account does not exist.");
		check(account_subtype == parent -> account_subtype, contract_names::accounts.to_string() + ": the child account must have the same type as its parent's.");
	}

    //=========================================================//
    //== if it is not 0 then another permission is required? ==//
    //=========================================================//

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
    
}


EOSIO_DISPATCH(accounts, (reset)(addaccount)(initaccounts));

