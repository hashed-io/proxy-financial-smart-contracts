#include <budgets.hpp>

bool budgets::overlap (uint64_t begin, uint64_t end, uint64_t new_begin, uint64_t new_end) {
    if (begin <= new_begin && new_begin <= end) { return true; }
    if (begin <= new_end && new_end <= end) { return true; }
    if (new_begin <= begin && begin <= new_end) { return true; }
    if (new_begin <= end && end <= new_end) { return true; }

    return false;
}

bool budgets::match (uint64_t begin, uint64_t end, uint64_t new_begin, uint64_t new_end) {
    if (begin == new_begin && end == new_end) {
        return true;
    }
    return false;
}

void budgets::create_budget_aux ( name actor,
                                  uint64_t project_id,
                                  uint64_t account_id,
                                  asset amount,
                                  uint64_t budget_type_id,
                                  uint64_t begin_date,
                                  uint64_t end_date,
                                  bool modify_parents ) {
    
    account_tables accounts(contract_names::accounts, project_id);
    budget_tables budgets(_self, project_id);
    budget_period_tables budget_periods(_self, project_id);

    auto dates_by_type = budget_periods.get_index<"bytype"_n>();
    auto itr_dates = dates_by_type.find(budget_type_id);
    uint64_t dates_id = 0;
    uint64_t budgets_id = 0;
    uint64_t parent_id = 0;
    bool parent_has_budget = false;
    asset sum_children_budget = asset(0, CURRENCY);
    asset parent_budget = asset(0, CURRENCY);

    // the dates dont overlap
    while (itr_dates != dates_by_type.end() && itr_dates -> budget_type_id == budget_type_id) {

        if (match(itr_dates -> begin_date, itr_dates -> end_date, begin_date, end_date)) {
            dates_id = itr_dates -> budget_period_id;
            break;
        } else {
            check(!overlap(itr_dates -> begin_date, itr_dates -> end_date, begin_date, end_date), 
               contract_names::budgets.to_string() + ": the interval from begin to end overlaps with an existing budget.");
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

    auto budgets_by_period = budgets.get_index<"byperiod"_n>();
    auto itr_budgets_by_period = budgets_by_period.find(dates_id);

    while (itr_budgets_by_period != budgets_by_period.end() && itr_budgets_by_period -> budget_period_id == dates_id) {
        if (itr_budgets_by_period -> account_id == account_id) {
            budgets_id = itr_budgets_by_period -> budget_id;
        }
        if (children.find(itr_budgets_by_period -> account_id) != children.end()) {
            sum_children_budget += itr_budgets_by_period -> amount;
        } else if (itr_budgets_by_period -> account_id == parent_id) {
            parent_budget = itr_budgets_by_period -> amount;
            parent_has_budget = true;
        }
        itr_budgets_by_period++;
    }

    // if the dates dont exist, create one entry
    if (dates_id == 0) {
        dates_id = budget_periods.available_primary_key();
        dates_id = (dates_id > 0) ? dates_id : 1;

        budget_periods.emplace(_self, [&](auto & new_budget_date){
            new_budget_date.budget_period_id = dates_id;
            new_budget_date.begin_date = begin_date;
            new_budget_date.end_date = end_date;
            new_budget_date.budget_type_id = budget_type_id;
        });
    }

    if (budgets_id == 0) {
        uint64_t budget_id = budgets.available_primary_key();
        budget_id = (budget_id > 0) ? budget_id : 1;

        if (amount < sum_children_budget) {
            amount = sum_children_budget;
        }

        budgets.emplace(_self, [&](auto & new_budget){
            new_budget.budget_id = budget_id;
            new_budget.account_id = account_id;
            new_budget.amount = amount;
            new_budget.budget_period_id = dates_id;
            new_budget.budget_type_id = budget_type_id;
            new_budget.budget_creation_date = eosio::current_time_point().sec_since_epoch();
            new_budget.budget_update_date = eosio::current_time_point().sec_since_epoch();
        });
    } else {
        auto itr_budget = budgets.find(budgets_id);
        check(itr_budget != budgets.end(),contract_names::budgets.to_string() + ": the budget does not exist.");

        budgets.modify(itr_budget, _self, [&](auto & modified_budget){
            modified_budget.amount += amount;
            modified_budget.budget_update_date = eosio::current_time_point().sec_since_epoch();
        });
    }

    if (parent_id > 0) {
        if (modify_parents) {
            rcalcbudgets (actor, project_id, account_id, dates_id);
        }
        else if (parent_has_budget){
            check(amount >= sum_children_budget, 
               contract_names::budgets.to_string() + ": the parent " + to_string(account_id) + " can not have less budget than its children. amount = " + amount.to_string() + " sum_children = " + sum_children_budget.to_string());
            check(amount <= parent_budget,contract_names::budgets.to_string() + ": the child can not have more budget than its parent, account_id = " + to_string(account_id) + " parent_budget = " + parent_budget.to_string() + ".");
        }
    }
}

void budgets::remove_budget_amount (uint64_t project_id, uint64_t budget_id, asset amount) {

    budget_tables budgets(_self, project_id);
    account_tables accounts(contract_names::accounts, project_id);

    auto itr_budget = budgets.find(budget_id);
    uint64_t account_id = 0;
    uint64_t parent_id = 0;
    uint64_t budget_period_id = 0;

    while (itr_budget != budgets.end()) {
        account_id = itr_budget -> account_id;
        budget_period_id = itr_budget -> budget_period_id;
        
        budgets.modify(itr_budget, _self, [&](auto & modified_budget){
            modified_budget.amount -= amount;
        });

        auto itr_account = accounts.find(account_id);
        check(itr_account != accounts.end(),contract_names::budgets.to_string() + ": the account does not exist.");

        budget_id = 0;

        auto budgets_by_period = budgets.get_index<"byaccount"_n>();
        auto itr_budgets_by_period = budgets_by_period.find(itr_account -> parent_id);

        while (itr_budgets_by_period != budgets_by_period.end()) {
            if (itr_budgets_by_period -> account_id == itr_account -> parent_id && itr_budgets_by_period -> budget_period_id == budget_period_id) {
                budget_id = itr_budgets_by_period -> budget_id;
                break;
            }
            itr_budgets_by_period++;
        }

        itr_budget = budgets.find(budget_id);
    }
}

uint64_t budgets::get_id_budget_type (string budget_name) {
    auto itr =  budget_types.begin();

    while (itr != budget_types.end()) {
        if (itr -> type_name == budget_name) {
            return itr -> budget_type_id;
        }
    }

    return 0;
}


ACTION budgets::reset () {
    require_auth(_self);
    
    for (int i = 0; i < RESET_IDS; i++) {
        budget_tables budgets(_self, i);
        auto itr_budgets = budgets.begin();
        while (itr_budgets != budgets.end()) {
            itr_budgets = budgets.erase(itr_budgets);
        }

        budget_period_tables budget_periods(_self, i);
        auto itr_budget_periods = budget_periods.begin();
        while (itr_budget_periods != budget_periods.end()) {
            itr_budget_periods = budget_periods.erase(itr_budget_periods);
        }
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


ACTION budgets::rcalcbudgets (name actor, uint64_t project_id, uint64_t account_id, uint64_t budget_period_id) {

    require_auth(actor);

    budget_tables budgets(_self, project_id);
    budget_period_tables budget_periods(_self, project_id);
    account_tables accounts(contract_names::accounts, project_id);

    auto accnt = accounts.find(account_id);
    check(accnt != accounts.end(), contract_names::budgets.to_string() + ": the account does not exist.");

    auto itr_budget_period = budget_periods.find(budget_period_id);
    check(itr_budget_period != budget_periods.end(), contract_names::budgets.to_string() + ": the period does not exist.");

    uint64_t parent_id = account_id;
    uint64_t budget_id;
    asset sum_children_budget;

    if (actor != _self) {

        action (
            permission_level(contract_names::permissions, "active"_n),
            contract_names::permissions,
            "checkledger"_n,
            std::make_tuple(actor, project_id, accnt -> ledger_id)
        ).send();

        // action (
        //     permission_level(contract_names::permissions, "active"_n),
        //     contract_names::permissions,
        //     "checkprmissn"_n,
        //     std::make_tuple(actor, project_id, ACTION_NAMES.BUDGETS_RECALCULATE)
        // ).send();
    }

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

        auto budgets_by_period = budgets.get_index<"byperiod"_n>();
        auto itr_budgets_by_period = budgets_by_period.find(budget_period_id);

        while (itr_budgets_by_period != budgets_by_period.end() && itr_budgets_by_period -> budget_period_id == budget_period_id) {

            if (itr_budgets_by_period -> account_id == parent_id) {
                budget_id = itr_budgets_by_period -> budget_id;
                if (children.empty()) {
                    break;
                }
            }

            if (children.find(itr_budgets_by_period -> account_id) != children.end()) {
                sum_children_budget += itr_budgets_by_period -> amount;
            } 

            itr_budgets_by_period++;
        }

        if (budget_id == 0) {
            uint64_t new_budget_id = budgets.available_primary_key();
            new_budget_id = (new_budget_id > 0) ? new_budget_id : 1;

            budgets.emplace(_self, [&](auto & new_budget){
                new_budget.budget_id = new_budget_id;
                new_budget.account_id = parent_id;
                new_budget.amount = sum_children_budget;
                new_budget.budget_type_id = itr_budget_period -> budget_type_id;
                new_budget.budget_period_id = budget_period_id;
                new_budget.budget_creation_date = eosio::current_time_point().sec_since_epoch();
                new_budget.budget_update_date = eosio::current_time_point().sec_since_epoch();
            });
        } else {
            auto itr_budget = budgets.find(budget_id);
            check(itr_budget != budgets.end(),contract_names::budgets.to_string() + ": the budget does not exist.");
            
            if (sum_children_budget < itr_budget -> amount) {
                sum_children_budget = itr_budget -> amount;
            }

            budgets.modify(itr_budget, _self, [&](auto & modified_budget){
                modified_budget.amount = sum_children_budget;
                modified_budget.budget_update_date = eosio::current_time_point().sec_since_epoch();
            });
        }

        auto itr_accounts = accounts.find(parent_id);
        parent_id = itr_accounts -> parent_id;
    }
}

ACTION budgets::addbudget (  name actor,
                             uint64_t project_id,
                             uint64_t account_id,
                             asset amount,
                             uint64_t budget_type_id,
                             uint64_t begin_date,
                             uint64_t end_date,
                             bool modify_parents ) {

    require_auth(actor);

    account_tables accounts(contract_names::accounts, project_id);

    auto accnt_itr = accounts.find(account_id);
    check(accnt_itr != accounts.end(),contract_names::budgets.to_string() + ": the account does not exist.");


    if (actor != _self) {
        action (
            permission_level(contract_names::permissions, "active"_n),
            contract_names::permissions,
            "checkledger"_n,
            std::make_tuple(actor, project_id, accnt_itr -> ledger_id)
        ).send();
            
        // action (
        //     permission_level(contract_names::permissions, "active"_n),
        //     contract_names::permissions,
        //     "checkprmissn"_n,
        //     std::make_tuple(actor, project_id, ACTION_NAMES.BUDGETS_ADD)
        // ).send();
    }

    // the project type must be total
    if (budget_type_id != get_id_budget_type(BUDGET_TYPES.TOTAL)) {
        check(begin_date < end_date,contract_names::budgets.to_string() + ": the begin date can not be grater than the end date.");
    } else {
        begin_date = 0;
        end_date = 0;
    }

    check_asset(amount,contract_names::budgets);

    create_budget_aux(actor, project_id, account_id, amount, budget_type_id, begin_date, end_date, modify_parents);
}


ACTION budgets::editbudget ( name actor,
                              uint64_t project_id,
                              uint64_t budget_id,
                              asset amount,
                              uint64_t budget_type_id,
                              uint64_t begin_date,
                              uint64_t end_date,
                              bool modify_parents ) {

    require_auth(actor);

    budget_tables budgets(_self, project_id);
    account_tables accounts(contract_names::accounts, project_id);

    auto budget_itr = budgets.find(budget_id);
    check(budget_itr != budgets.end(),contract_names::budgets.to_string() + ": the budget does not exist.");

    check_asset(amount,contract_names::budgets);

    auto accnt = accounts.find(budget_itr -> account_id);
    check(accnt != accounts.end(), contract_names::budgets.to_string() + ": the account does not exist.");

    if (actor != _self) {
        action (
            permission_level(contract_names::permissions, "active"_n),
            contract_names::permissions,
            "checkledger"_n,
            std::make_tuple(actor, project_id, accnt -> ledger_id)
        ).send();

        // action (
        //     permission_level(contract_names::permissions, "active"_n),
        //     contract_names::permissions,
        //     "checkprmissn"_n,
        //     std::make_tuple(actor, project_id, ACTION_NAMES.BUDGETS_EDIT)
        // ).send();
    }

     // the project type must be total
    if (budget_type_id != get_id_budget_type(BUDGET_TYPES.TOTAL)) {
        check(begin_date < end_date,contract_names::budgets.to_string() + ": the begin date can not be grater than the end date.");
    } else {
        begin_date = 0;
        end_date = 0;
    }

    deletebudget(actor, project_id, budget_id, modify_parents);
    create_budget_aux(actor, project_id, budget_itr -> account_id, amount, budget_type_id, begin_date, end_date, modify_parents);
}


ACTION budgets::deletebudget (name actor, uint64_t project_id, uint64_t budget_id, bool modify_parents) {
    require_auth(actor);

    budget_tables budgets(_self, project_id);
    account_tables accounts(contract_names::accounts, project_id);

    uint64_t budget_period_id = 0;
    auto budget_itr = budgets.find(budget_id);
    check(budget_itr != budgets.end(),contract_names::budgets.to_string() + ": the budget does not exist.");

    auto accnt = accounts.find(budget_itr -> account_id);
    check(accnt != accounts.end(), contract_names::budgets.to_string() + ": the account does not exist.");

    if (actor != _self) {

        action (
            permission_level(contract_names::permissions, "active"_n),
            contract_names::permissions,
            "checkledger"_n,
            std::make_tuple(actor, project_id, accnt -> ledger_id)
        ).send();

        // action (
        //     permission_level(contract_names::permissions, "active"_n),
        //     contract_names::permissions,
        //     "checkprmissn"_n,
        //     std::make_tuple(actor, project_id, ACTION_NAMES.BUDGETS_REMOVE)
        // ).send();
    }

    budget_period_id = budget_itr -> budget_period_id;

    if (modify_parents) {
        remove_budget_amount(project_id, budget_id, budget_itr -> amount);
    }

    // delete the budget entry
    budgets.erase(budget_itr);

    // delete if there is no other entry of budgets dates
    auto budgets_by_period = budgets.get_index<"byperiod"_n>();
    auto itr_budgets_by_period = budgets_by_period.find(budget_period_id);

    if (itr_budgets_by_period == budgets_by_period.end()) {
        budget_period_tables budget_periods(_self, project_id);
        auto itr_date = budget_periods.find(budget_period_id);
        budget_periods.erase(itr_date);
    }
}


ACTION budgets::delbdgtsacct (uint64_t project_id, uint64_t account_id) {
    require_auth(_self);

    account_tables accounts(contract_names::accounts, project_id);
    budget_tables budgets(_self, project_id);

    uint64_t budget_period_id = 0;

    auto budgets_by_accounts = budgets.get_index<"byaccount"_n>();
    auto budget_itr = budgets_by_accounts.find(account_id);

    while (budget_itr != budgets_by_accounts.end() && budget_itr -> account_id == account_id) {
        budget_period_id = budget_itr -> budget_period_id;

        budget_itr = budgets_by_accounts.erase(budget_itr);

        // delete if there is no other entry of budgets dates
        auto budgets_by_period = budgets.get_index<"byperiod"_n>();
        auto itr_budgets_by_period = budgets_by_period.find(budget_period_id);

        if (itr_budgets_by_period == budgets_by_period.end()) {
            budget_period_tables budget_periods(_self, project_id);
            auto itr_date = budget_periods.find(budget_period_id);
            budget_periods.erase(itr_date);
        }
    }
}


EOSIO_DISPATCH(budgets, (reset)(addbudget)(deletebudget)(editbudget)(rcalcbudgets)(delbdgtsacct));
