#include <accounts.hpp>


void accounts::change_balance (uint64_t project_id, uint64_t account_id, asset amount, bool increase, bool cancel) {
    account_tables accounts(_self, project_id);

    auto itr_account = accounts.find(account_id);
    check(itr_account != accounts.end(), contract_names::accounts.to_string() + ": the account does not exist.");
    check(itr_account -> num_children == 0, contract_names::accounts.to_string() + ": can not add balance to a parent account.");

    uint64_t parent_id = 0;
    while (itr_account != accounts.end()) {
        parent_id = itr_account -> parent_id;
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

bool accounts::overlap (uint64_t begin, uint64_t end, uint64_t new_begin, uint64_t new_end) {
    if (begin <= new_begin && new_begin <= end) { return true; }
    if (begin <= new_end && new_end <= end) { return true; }
    if (new_begin <= begin && begin <= new_end) { return true; }
    if (new_begin <= end && end <= new_end) { return true; }

    return false;
}

bool accounts::match (uint64_t begin, uint64_t end, uint64_t new_begin, uint64_t new_end) {
    if (begin == new_begin && end == new_end) {
        return true;
    }
    return false;
}


ACTION accounts::rcalcbudgets (name actor, uint64_t project_id, uint64_t account_id, uint64_t date_id) {

    require_auth(actor);

    // ========================== //
    // check for permissions here //
    // ========================== //

    budget_tables budgets(_self, project_id);
    account_tables accounts(_self, project_id);

    uint64_t parent_id = account_id;
    uint64_t budget_id;
    asset sum_children_budget;

    while (parent_id > 0) {

        set <uint64_t> children;
        auto accounts_by_parents = accounts.get_index<"byparent"_n>();
        auto itr_accounts_by_parents = accounts_by_parents.find(parent_id);

        sum_children_budget = asset(0, CURRENCY);
        budget_id = 0;

        while (itr_accounts_by_parents != accounts_by_parents.end() && itr_accounts_by_parents -> parent_id == parent_id) {
            children.insert(itr_accounts_by_parents -> account_id);
            itr_accounts_by_parents++;
        }

        auto budgets_by_date = budgets.get_index<"bydate"_n>();
        auto itr_budgets_date = budgets_by_date.find(date_id);

        while (itr_budgets_date != budgets_by_date.end() && itr_budgets_date -> budget_date_id == date_id) {

            if (itr_budgets_date -> account_id == parent_id) {
                budget_id = itr_budgets_date -> budget_id;
                if (children.empty()) {
                    break;
                }
            }

            if (children.find(itr_budgets_date -> account_id) != children.end()) {
                sum_children_budget += itr_budgets_date -> amount;
            } 

            itr_budgets_date++;
        }

        if (budget_id == 0) {
            uint64_t new_budget_id = budgets.available_primary_key();
            new_budget_id = (new_budget_id > 0) ? new_budget_id : 1;

            budgets.emplace(_self, [&](auto & new_budget){
                new_budget.budget_id = new_budget_id;
                new_budget.account_id = parent_id;
                new_budget.amount = sum_children_budget;
                new_budget.budget_date_id = date_id;
                new_budget.budget_creation = eosio::current_time_point().sec_since_epoch();
                new_budget.budget_update = eosio::current_time_point().sec_since_epoch();
            });
        } else {
            auto itr_budget = budgets.find(budget_id);
            check(itr_budget != budgets.end(), contract_names::accounts.to_string() + ": the budget does not exist.");
            
            if (sum_children_budget < itr_budget -> amount) {
                sum_children_budget = itr_budget -> amount;
            }

            budgets.modify(itr_budget, _self, [&](auto & modified_budget){
                modified_budget.amount = sum_children_budget;
                modified_budget.budget_update = eosio::current_time_point().sec_since_epoch();
            });
        }

        auto itr_accounts = accounts.find(parent_id);
        parent_id = itr_accounts -> parent_id;
    }
}


void accounts::create_budget_aux ( name actor,
                                   uint64_t project_id,
                                   uint64_t account_id,
                                   asset amount,
                                   uint64_t budget_type_id,
                                   uint64_t date_begin,
                                   uint64_t date_end,
                                   bool modify_parents ) {
    
    account_tables accounts(_self, project_id);
    budget_tables budgets(_self, project_id);
    budget_period_tables budget_dates(_self, project_id);

    auto dates_by_type = budget_dates.get_index<"bytype"_n>();
    auto itr_dates = dates_by_type.find(budget_type_id);
    uint64_t dates_id = 0;
    uint64_t budgets_id = 0;
    uint64_t parent_id = 0;
    bool parent_has_budget = false;
    asset sum_children_budget = asset(0, CURRENCY);
    asset parent_budget = asset(0, CURRENCY);

    // the dates dont overlap
    while (itr_dates != dates_by_type.end() && itr_dates -> budget_type_id == budget_type_id) {

        if (match(itr_dates -> date_begin, itr_dates -> date_end, date_begin, date_end)) {
            dates_id = itr_dates -> budget_date_id;
            break;
        } else {
            check(!overlap(itr_dates -> date_begin, itr_dates -> date_end, date_begin, date_end), 
                contract_names::accounts.to_string() + ": the interval from begin to end overlaps with an existing budget.");
        }

        itr_dates++;
    }
    
    auto itr_a = accounts.find(account_id);
    parent_id = itr_a -> parent_id;
    
    auto accounts_by_parent = accounts.get_index<"byparent"_n>();
    auto itr_accounts = accounts_by_parent.find(account_id);
    set<int> children;

    while (itr_accounts != accounts_by_parent.end() && itr_accounts -> parent_id == account_id) {
        children.insert(itr_accounts -> account_id);
        itr_accounts++;
    }

    auto budgets_by_date = budgets.get_index<"bydate"_n>();
    auto itr_budgets_date = budgets_by_date.find(dates_id);

    while (itr_budgets_date != budgets_by_date.end() && itr_budgets_date -> budget_date_id == dates_id) {
        if (itr_budgets_date -> account_id == account_id) {
            budgets_id = itr_budgets_date -> budget_id;
        }
        if (children.find(itr_budgets_date -> account_id) != children.end()) {
            sum_children_budget += itr_budgets_date -> amount;
        } else if (itr_budgets_date -> account_id == parent_id) {
            parent_budget = itr_budgets_date -> amount;
            parent_has_budget = true;
        }
        itr_budgets_date++;
    }

    // if the dates dont exist, create one entry
    if (dates_id == 0) {
        dates_id = budget_dates.available_primary_key();
        dates_id = (dates_id > 0) ? dates_id : 1;

        budget_dates.emplace(_self, [&](auto & new_budget_date){
            new_budget_date.budget_date_id = dates_id;
            new_budget_date.date_begin = date_begin;
            new_budget_date.date_end = date_end;
            new_budget_date.budget_type_id = budget_type_id;
        });
    }

    if (budgets_id == 0) {
        uint64_t budget_id = budgets.available_primary_key();
        budget_id = (budget_id > 0) ? budget_id : 1;

        // check(amount >= sum_children_budget, 
        //    contract_names::accounts.to_string() + ": the parent " + to_string(account_id) + " can not have less budget than its children. amount = " + amount.to_string() + " sum_children = " + sum_children_budget.to_string());

        if (amount < sum_children_budget) {
            amount = sum_children_budget;
        }

        budgets.emplace(_self, [&](auto & new_budget){
            new_budget.budget_id = budget_id;
            new_budget.account_id = account_id;
            new_budget.amount = amount;
            new_budget.budget_date_id = dates_id;
            new_budget.budget_creation = eosio::current_time_point().sec_since_epoch();
            new_budget.budget_update = eosio::current_time_point().sec_since_epoch();
        });
    } else {
        auto itr_budget = budgets.find(budgets_id);
        check(itr_budget != budgets.end(), contract_names::accounts.to_string() + ": the budget does not exist.");

        budgets.modify(itr_budget, _self, [&](auto & modified_budget){
            modified_budget.amount += amount;
            modified_budget.budget_update = eosio::current_time_point().sec_since_epoch();
        });
    }

    if (parent_id > 0) {
        if (modify_parents) {
            rcalcbudgets (actor, project_id, account_id, dates_id);
        }
        else if (parent_has_budget){
            check(amount >= sum_children_budget, 
                contract_names::accounts.to_string() + ": the parent " + to_string(account_id) + " can not have less budget than its children. amount = " + amount.to_string() + " sum_children = " + sum_children_budget.to_string());
            check(amount <= parent_budget, contract_names::accounts.to_string() + ": the child can not have more budget than its parent, account_id = " + to_string(account_id) + " parent_budget = " + parent_budget.to_string() + ".");
        }
    }
}


uint64_t accounts::get_id_budget_type (string budget_name) {
    auto itr =  budget_types.begin();

    while (itr != budget_types.end()) {
        if (itr -> type_name == budget_name) {
            return itr -> budget_type_id;
        }
    }

    return 0;
}


ACTION accounts::reset () {
    require_auth(_self);

    for (int i = 0; i < RESET_IDS; i++) {
        account_tables accounts(_self, i);
        auto itr_accounts = accounts.begin();
        while (itr_accounts != accounts.end()) {
            itr_accounts = accounts.erase(itr_accounts);
        }

        budget_tables budgets(_self, i);
        auto itr_budgets = budgets.begin();
        while (itr_budgets != budgets.end()) {
            itr_budgets = budgets.erase(itr_budgets);
        }

        budget_period_tables budget_dates(_self, i);
        auto itr_budget_dates = budget_dates.begin();
        while (itr_budget_dates != budget_dates.end()) {
            itr_budget_dates = budget_dates.erase(itr_budget_dates);
        }
    }

    auto itr_types = account_types.begin();
	while (itr_types != account_types.end()) {
		itr_types = account_types.erase(itr_types);
	}

	for (int i = 0; i < account_types_v.size(); i++) {
		account_types.emplace(_self, [&](auto & naccount){
			naccount.type_id = i + 1;
			naccount.type_name = account_types_v[i].first;
			naccount.account_class = account_types_v[i].second;
		});
	}

    auto itr_b_types = budget_types.begin();
    while (itr_b_types != budget_types.end()) {
        itr_b_types = budget_types.erase(itr_b_types);
    }

    for (int i = 0; i < budget_types_v.size(); i++) {
        budget_types.emplace(_self, [&](auto & nbudget_type){
            nbudget_type.budget_type_id = i + 1;
            nbudget_type.type_name = budget_types_v[i].first;
            nbudget_type.description = budget_types_v[i].second;
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

ACTION accounts::editaccount (name actor, uint64_t project_id, uint64_t account_id, string account_name) {
    require_auth(actor);

    action (
        permission_level(contract_names::permissions, "active"_n),
        contract_names::permissions,
        "checkprmissn"_n,
        std::make_tuple(actor, project_id, ACTION_NAMES.ACCOUNTS_EDIT)
    ).send();

    check(account_name.length() > 0, contract_names::accounts.to_string() + ": the account name can not be an empty string.");

    auto itr_project = projects_table.find(project_id);
    check(itr_project != projects_table.end(), contract_names::accounts.to_string() + ": the project does not exist.");

    account_tables accounts(_self, project_id);

    auto itr_account = accounts.find(account_id);
    check(itr_account != accounts.end(), contract_names::accounts.to_string() + ": the account does not exist.");

    auto itr_accounts = accounts.begin();
    while (itr_accounts != accounts.end()) {
        check(itr_accounts -> account_name != account_name, contract_names::accounts.to_string() + ": that name has been already taken.");
        itr_accounts++;
    }

    accounts.modify(itr_account, _self, [&](auto & modified_account){
        modified_account.account_name = account_name;
    });
}

ACTION accounts::deleteaccnt (name actor, uint64_t project_id, uint64_t account_id) {
    require_auth(actor);

    action (
        permission_level(contract_names::permissions, "active"_n),
        contract_names::permissions,
        "checkprmissn"_n,
        std::make_tuple(actor, project_id, ACTION_NAMES.ACCOUNTS_REMOVE)
    ).send();

    auto project = projects_table.find(project_id);
	check(project != projects_table.end(), contract_names::accounts.to_string() + ": the project where the account is trying to be created does not exist.");

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
                              symbol account_currency ) {

    require_auth(actor);

    action (
        permission_level(contract_names::permissions, "active"_n),
        contract_names::permissions,
        "checkprmissn"_n,
        std::make_tuple(actor, project_id, ACTION_NAMES.ACCOUNTS_ADD)
    ).send();

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
    
    if (parent -> num_children == 0) {
        check(parent -> increase_balance == asset(0, CURRENCY) && parent -> decrease_balance == asset(0, CURRENCY), 
                contract_names::accounts.to_string() + ": the parent's balance is not zero.");
    }
    
    uint64_t new_account_id = accounts.available_primary_key();
    new_account_id = (new_account_id > 0) ? new_account_id : 1;

	accounts.emplace(_self, [&](auto & new_account){
		new_account.account_id = new_account_id; 
		new_account.parent_id = parent_id;
		new_account.account_name = account_name;
		new_account.account_subtype = parent -> account_subtype;
		new_account.increase_balance = asset(0, CURRENCY);
		new_account.decrease_balance = asset(0, CURRENCY);
		new_account.account_symbol = CURRENCY;
	});

    accounts.modify(parent, _self, [&](auto & modified_account){
        modified_account.num_children += 1;
    });
    
}


ACTION accounts::deleteaccnts (uint64_t project_id) {
    require_auth(_self);

    account_tables accounts(_self, project_id);

    auto itr_account = accounts.begin();
    while (itr_account != accounts.end()) {
        delbdgtsacct (project_id, itr_account -> account_id);
        itr_account = accounts.erase(itr_account);
    }
}


ACTION accounts::addbudget ( name actor,
                             uint64_t project_id,
                             uint64_t account_id,
                             asset amount,
                             uint64_t budget_type_id,
                             uint64_t date_begin,
                             uint64_t date_end,
                             bool modify_parents ) {

    require_auth(actor);
    
    // ========================== //
    // check for permissions here //
    // ========================== //

    account_tables accounts(_self, project_id);

    auto accnt_itr = accounts.find(account_id);
    check(accnt_itr != accounts.end(), contract_names::accounts.to_string() + ": the account does not exist.");

    // the project type must be total
    if (budget_type_id != get_id_budget_type(BUDGET_TYPES.TOTAL)) {
        check(date_begin < date_end, contract_names::accounts.to_string() + ": the begin date can not be grater than the end date.");
    } else {
        date_begin = 0;
        date_end = 0;
    }

    check_asset(amount, contract_names::accounts);

    create_budget_aux(actor, project_id, account_id, amount, budget_type_id, date_begin, date_end, modify_parents);
}


ACTION accounts::editbudget ( name actor,
                              uint64_t project_id,
                              uint64_t budget_id,
                              asset amount,
                              uint64_t budget_type_id,
                              uint64_t date_begin,
                              uint64_t date_end,
                              bool modify_parents ) {

    require_auth(actor);

    // ========================== //
    // check for permissions here //
    // ========================== //

    budget_tables budgets(_self, project_id);

    auto budget_itr = budgets.find(budget_id);
    check(budget_itr != budgets.end(), contract_names::accounts.to_string() + ": the account does not have a budget.");

    check_asset(amount, contract_names::accounts);

     // the project type must be total
    if (budget_type_id != get_id_budget_type(BUDGET_TYPES.TOTAL)) {
        check(date_begin < date_end, contract_names::accounts.to_string() + ": the begin date can not be grater than the end date.");
    } else {
        date_begin = 0;
        date_end = 0;
    }

    deletebudget(actor, project_id, budget_id, modify_parents);
    create_budget_aux(actor, project_id, budget_itr -> account_id, amount, budget_type_id, date_begin, date_end, modify_parents);
}



void accounts::remove_budget_amount (uint64_t project_id, uint64_t budget_id, asset amount) {

    budget_tables budgets(_self, project_id);
    account_tables accounts(_self, project_id);

    auto itr_budget = budgets.find(budget_id);
    uint64_t account_id = 0;
    uint64_t parent_id = 0;
    uint64_t date_id = 0;

    while (itr_budget != budgets.end()) {
        account_id = itr_budget -> account_id;
        date_id = itr_budget -> budget_date_id;
        
        budgets.modify(itr_budget, _self, [&](auto & modified_budget){
            modified_budget.amount -= amount;
        });

        auto itr_account = accounts.find(account_id);
        check(itr_account != accounts.end(), contract_names::accounts.to_string() + ": the account does not exist.");

        budget_id = 0;

        auto budgets_by_date = budgets.get_index<"byaccount"_n>();
        auto itr_budgets_by_date = budgets_by_date.find(itr_account -> parent_id);

        while (itr_budgets_by_date != budgets_by_date.end()) {
            if (itr_budgets_by_date -> account_id == itr_account -> parent_id && itr_budgets_by_date -> budget_date_id == date_id) {
                budget_id = itr_budgets_by_date -> budget_id;
                break;
            }
            itr_budgets_by_date++;
        }

        itr_budget = budgets.find(budget_id);
    }
}



ACTION accounts::deletebudget (name actor, uint64_t project_id, uint64_t budget_id, bool modify_parents) {

    require_auth(actor);

    // ========================== //
    // check for permissions here //
    // ========================== //

    budget_tables budgets(_self, project_id);

    uint64_t date_id = 0;
    auto budget_itr = budgets.find(budget_id);
    check(budget_itr != budgets.end(), contract_names::accounts.to_string() + ": the budget does not exist.");

    date_id = budget_itr -> budget_date_id;

    if (modify_parents) {
        remove_budget_amount(project_id, budget_id, budget_itr -> amount);
    }

    // delete the budget entry
    budgets.erase(budget_itr);

    // delete if there is no other entry of budgets dates
    auto budgets_by_date = budgets.get_index<"bydate"_n>();
    auto itr_budgets_date = budgets_by_date.find(date_id);

    if (itr_budgets_date == budgets_by_date.end()) {
        budget_period_tables budget_dates(_self, project_id);
        auto itr_date = budget_dates.find(date_id);
        budget_dates.erase(itr_date);
    }
}


ACTION accounts::delbdgtsacct (uint64_t project_id, uint64_t account_id) {

    require_auth(_self);

    account_tables accounts(_self, project_id);
    budget_tables budgets(_self, project_id);

    auto accnt_itr = accounts.find(account_id);
    check(accnt_itr != accounts.end(), contract_names::accounts.to_string() + ": the account does not exist.");

    uint64_t date_id = 0;

    auto budgets_by_accounts = budgets.get_index<"byaccount"_n>();
    auto budget_itr = budgets_by_accounts.find(account_id);

    while (budget_itr != budgets_by_accounts.end() && budget_itr -> account_id == account_id) {
        date_id = budget_itr -> budget_date_id;

        budget_itr = budgets_by_accounts.erase(budget_itr);

        // delete if there is no other entry of budgets dates
        auto budgets_by_date = budgets.get_index<"bydate"_n>();
        auto itr_budgets_date = budgets_by_date.find(date_id);

        if (itr_budgets_date == budgets_by_date.end()) {
            budget_period_tables budget_dates(_self, project_id);
            auto itr_date = budget_dates.find(date_id);
            budget_dates.erase(itr_date);
        }
    }
}


EOSIO_DISPATCH(accounts, (reset)(addaccount)(editaccount)(deleteaccnt)(initaccounts)(addbalance)(subbalance)(canceladd)(cancelsub)(deleteaccnts)(addbudget)(deletebudget)(editbudget)(rcalcbudgets)(delbdgtsacct));

