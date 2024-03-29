#include <accounts.hpp>

void accounts::change_balance(const uint64_t &project_id,
                              const uint64_t &account_id,
                              const asset &amount,
                              const bool &increase,
                              const bool &cancel)
{
    account_tables accounts(_self, project_id);

    auto itr_account = accounts.find(account_id);
    check(itr_account != accounts.end(), common::contracts::accounts.to_string() + ": the account does not exist.");
    check(itr_account->num_children == 0, common::contracts::accounts.to_string() + ": can not add balance to a parent account.");

    uint64_t parent_id = 0;
    while (itr_account != accounts.end())
    {
        parent_id = itr_account->parent_id;
        accounts.modify(itr_account, _self, [&](auto &modified_account)
                        {
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
            } });
        itr_account = accounts.find(parent_id);
    }
}

ACTION accounts::helpdelete(const eosio::name &actor,
                            const uint64_t &project_id,
                            const uint64_t &account_id)
{
    require_auth(has_auth(actor) ? actor : _self);
    auto admin_itr = users.find(actor.value);
    check(admin_itr->role == common::projects::entity::fund, actor.to_string() + ": helpdelete, is not an admin!");

    auto project = projects_table.find(project_id);
    check(project != projects_table.end(), common::contracts::accounts.to_string() + ": helpdelete, the project where the account is trying to be deleted does not exist.");

    account_tables accounts(_self, project_id);
    auto account = accounts.find(account_id);

    check(account != accounts.end(), common::contracts::accounts.to_string() + ": helpdelete, the account does not exist.");

    accounts.erase(account);
}

ACTION accounts::reset()
{
    require_auth(_self);

    for (int i = 0; i < common::reset_ids; i++)
    {
        account_tables accounts(_self, i);
        auto itr_accounts = accounts.begin();
        while (itr_accounts != accounts.end())
        {
            itr_accounts = accounts.erase(itr_accounts);
        }

        ledger_tables ledger_t(_self, i);
        auto itr_ledger = ledger_t.begin();
        while (itr_ledger != ledger_t.end())
        {
            itr_ledger = ledger_t.erase(itr_ledger);
        }
    }

    auto itr_types = account_types.begin();
    while (itr_types != account_types.end())
    {
        itr_types = account_types.erase(itr_types);
    }
}

ACTION accounts::clear()
{
    require_auth(_self);

    for (int i = 0; i < common::reset_ids; i++)
    {
        account_tables accounts(_self, i);
        auto itr_accounts = accounts.begin();
        while (itr_accounts != accounts.end())
        {
            itr_accounts = accounts.erase(itr_accounts);
        }

        ledger_tables ledgers(_self, i);
        auto itr_ledger = ledgers.begin();
        while (itr_ledger != ledgers.end())
        {
            itr_ledger = ledgers.erase(itr_ledger);
        }
    }

    auto itr_types = account_types.begin();
    while (itr_types != account_types.end())
    {
        itr_types = account_types.erase(itr_types);
    }
}

ACTION accounts::init()

{
    reset();

    vector<common::types::account_types> account_types_vv;

    account_types_vv.push_back((common::types::account_types){common::accouts::categories::names::hard_cost, common::accouts::types::credit, common::accouts::categories::hard_cost});
    account_types_vv.push_back((common::types::account_types){common::accouts::categories::names::soft_cost, common::accouts::types::credit, common::accouts::categories::soft_cost});

    for (int i = 0; i < account_types_vv.size(); i++)
    {
        account_types.emplace(_self, [&](auto &item)
                              {
			item.type_id = i + 1;
			item.type_name = account_types_vv[i].type_name;
			item.account_class = account_types_vv[i].account_class;
            item.category = account_types_vv[i].category; });
    }
}
ACTION accounts::migration(const uint64_t &project_id)
{
    require_auth(_self);
    eosio::transaction tx;

    auto project_itr = projects_table.find(project_id);

    action call_1(
        permission_level{_self, "active"_n},
        common::contracts::accounts,
        "editaccount"_n,
        std::make_tuple(project_itr->owner,
                        project_id,
                        6,
                        "Architectural, Engineering and Related Services",
                        "Children account",
                        3,
                        eosio::asset(1661879500, common::currency),
                        5413,
                        133179));
    tx.actions.emplace_back(call_1);

    action call_2(
        permission_level{_self, "active"_n},
        common::contracts::accounts,
        "editaccount"_n,
        std::make_tuple(project_itr->owner,
                project_id,
                4,
                "Furniture, Fixtures & Equipment Purchases",
                "Children account",
                3,
                eosio::asset(1600247400, common::currency),
                42316423364236,
                59169));
    tx.actions.emplace_back(call_2);
    
    action call_3(
        permission_level{_self, "active"_n},
        common::contracts::accounts,
        "editaccount"_n,
        std::make_tuple(project_itr->owner,
                        project_id,
                        4,
                        "Furniture, Fixtures & Equipment Purchases",
                        "Children account",
                        2,
                        eosio::asset(1600247400, common::currency),
                        4232,
                        59169));
    tx.actions.emplace_back(call_3);


    action call_4(
        permission_level{_self, "active"_n},
        common::contracts::accounts,
        "editaccount"_n,
        std::make_tuple(project_itr->owner,
                        project_id,
                        3,
                        "Construction",
                        "Children account",
                        2,
                        eosio::asset(13621004900, common::currency),
                        2362,
                        138432));
    tx.actions.emplace_back(call_4);

    action call_5(
        permission_level{_self, "active"_n},
        common::contracts::accounts,
        "deleteaccnt"_n,
        std::make_tuple(project_itr->owner, project_id, 16));
    tx.actions.emplace_back(call_5);

    action call_6(
        permission_level{_self, "active"_n},
        common::contracts::accounts,
        "deleteaccnt"_n,
        std::make_tuple(project_itr->owner, project_id, 9));
    tx.actions.emplace_back(call_6);

    action call_7(
        permission_level{_self, "active"_n},
        common::contracts::accounts,
        "deleteaccnt"_n,
        std::make_tuple(project_itr->owner, project_id, 21));
    tx.actions.emplace_back(call_7);


    action call_9(
        permission_level{_self, "active"_n},
        common::contracts::accounts,
        "deleteaccnt"_n,
        std::make_tuple(project_itr->owner, project_id, 17));
    tx.actions.emplace_back(call_9);
    
    tx.delay_sec = 1;
    tx.send(project_itr->owner.value, _self);
}

ACTION accounts::addledger(const uint64_t &project_id,
                           const uint64_t &entity_id)
{

    // ! ledger is now for project

    require_auth(_self);

    auto project = projects_table.find(project_id);
    check(project != projects_table.end(), common::contracts::accounts.to_string() + ": project does not exist.");

    ledger_tables ledger_t(_self, project_id);
    account_tables account_t(_self, project_id);

    auto itr_entity = entities.find(entity_id);
    check(itr_entity != entities.end(), common::contracts::accounts.to_string() + ": the entity does not exist.");

    // TODO check if exists a ledger for the project
    // TODO make the ledger global for builder and admin
    // ! only admin can modify it ( the accounts )

    // auto itr_ledger = ledger_t.begin();
    // while (itr_ledger != ledger_t.end())
    // {
    //     check(itr_ledger->entity_id != entity_id,
    //           common::contracts::accounts.to_string() + ": there is a ledger for the entity = " + to_string(entity_id) + ", project_id = " + to_string(project_id) + ".");
    //     itr_ledger++;
    // }

    uint64_t ledger_id = ledger_t.available_primary_key();
    ledger_id = (ledger_id > 0) ? ledger_id : 1;

    ledger_t.emplace(_self, [&](auto &new_ledger)
                     {
        new_ledger.ledger_id = ledger_id;
        new_ledger.entity_id = entity_id;
        new_ledger.description = "Ledger for the " + (itr_entity -> role.to_string()) + " " + itr_entity -> entity_name; });

    auto account_types_itr = account_types.begin();
    while (account_types_itr != account_types.end())
    {
        uint64_t new_account_id = get_valid_index(account_t.available_primary_key());

        account_t.emplace(_self, [&](auto &new_account)
                          {
            new_account.account_id = new_account_id; 
            new_account.parent_id = 0;
            new_account.ledger_id = ledger_id;
            new_account.num_children = 0;
            new_account.account_name = account_types_itr -> type_name;
            new_account.account_subtype = account_types_itr -> type_name;
            new_account.increase_balance = asset(0, common::currency);
            new_account.decrease_balance = asset(0, common::currency);
            new_account.account_symbol = common::currency;
            new_account.description = account_types_itr -> type_name;
            new_account.account_category = account_types_itr->category; });

        account_types_itr++;
    }

    // TODO create child accounts here

    auto accounts_by_ledger = account_t.get_index<"byledger"_n>();
    auto account_itr = accounts_by_ledger.find(ledger_id);

    uint64_t hard_cost_parent = 0;
    uint64_t soft_cost_parent = 0;

    while (account_itr != accounts_by_ledger.end())
    {
        if (hard_cost_parent != 0 && soft_cost_parent != 0)
        {
            break;
        }
        if (account_itr->account_name == common::accouts::categories::names::hard_cost)
        {
            hard_cost_parent = account_itr->account_id;
        }

        if (account_itr->account_name == common::accouts::categories::names::soft_cost)
        {
            soft_cost_parent = account_itr->account_id;
        }

        account_itr++;
    }

    for (size_t i = 0; i < hard_cost_accounts.size(); i++)
    { // ! creates the hard cost accounts

        add_account(entity_id,
                    project_id,
                    hard_cost_accounts[i],
                    hard_cost_parent,
                    common::currency,
                    "Children account",
                    common::accouts::categories::hard_cost,
                    asset(0, common::currency));
    }

    for (size_t i = 0; i < soft_cost_accounts.size(); i++)
    { // ! creates the soft cost accounts

        add_account(entity_id,
                    project_id,
                    soft_cost_accounts[i],
                    soft_cost_parent,
                    common::currency,
                    "Children account",
                    common::accouts::categories::soft_cost,
                    asset(0, common::currency));
    }
}

ACTION accounts::initaccounts(const uint64_t &project_id)
{
    require_auth(_self);

    auto project = projects_table.find(project_id);
    check(project != projects_table.end(), common::contracts::accounts.to_string() + ": project does not exist.");

    account_tables accounts(_self, project_id);

    auto itr_types = account_types.begin();
    while (itr_types != account_types.end())
    {
        uint64_t new_account_id = accounts.available_primary_key();
        new_account_id = (new_account_id > 0) ? new_account_id : 1;

        accounts.emplace(_self, [&](auto &new_account)
                         {
            new_account.account_id = new_account_id; 
            new_account.parent_id = 0;
            new_account.num_children = 0;
            new_account.account_name = itr_types -> type_name;
            new_account.account_subtype = itr_types -> type_name;
            new_account.increase_balance = asset(0, common::currency);
            new_account.decrease_balance = asset(0, common::currency);
            new_account.account_symbol = common::currency; });
        itr_types++;
    }
}

ACTION accounts::addbalance(const uint64_t &project_id,
                            const uint64_t &account_id,
                            const eosio::asset &amount)
{
    require_auth(_self);
    check_asset(amount, common::contracts::accounts);

    change_balance(project_id, account_id, amount, true, false);
}

ACTION accounts::subbalance(const uint64_t &project_id,
                            const uint64_t &account_id,
                            const eosio::asset &amount)
{
    require_auth(_self);
    check_asset(amount, common::contracts::accounts);

    change_balance(project_id, account_id, amount, false, false);
}

ACTION accounts::canceladd(const uint64_t &project_id,
                           const uint64_t &account_id,
                           const eosio::asset &amount)
{
    require_auth(_self);
    check_asset(amount, common::contracts::accounts);

    change_balance(project_id, account_id, amount, true, true);
}

ACTION accounts::cancelsub(const uint64_t &project_id,
                           const uint64_t &account_id,
                           const eosio::asset &amount)
{
    require_auth(_self);
    check_asset(amount, common::contracts::accounts);

    change_balance(project_id, account_id, amount, false, true);
}

ACTION accounts::editaccount(const eosio::name &actor,
                             const uint64_t &project_id,
                             const uint64_t &account_id,
                             const std::string &account_name,
                             const std::string &description,
                             const uint64_t &account_category,
                             const eosio::asset &budget_amount,
                             const uint64_t &naics_code,
                             const uint64_t &jobs_multiplier)
{

    require_auth(has_auth(actor) ? actor : _self);

    check(account_name.length() > 0, common::contracts::accounts.to_string() + ": the account name can not be an empty string.");
    check(ACCOUNT_CATEGORIES.is_valid_constant(account_category), common::contracts::accounts.to_string() + ": the account category is invalid.");

    auto itr_project = projects_table.find(project_id);
    check(itr_project != projects_table.end(), common::contracts::accounts.to_string() + ": the project does not exist.");

    account_tables accounts(_self, project_id);

    auto itr_account = accounts.find(account_id);
    check(itr_account != accounts.end(), common::contracts::accounts.to_string() + ": editaccount -> the account does not exist.");
    check(itr_account->parent_id != 0, common::contracts::accounts.to_string() + ": editaccount -> parent account can not be edited.");

    check(budget_amount >= asset(0, common::currency), _self.to_string() + ": addaccount -> the amount cannot be negative.");

    // action(
    //     permission_level(common::contracts::permissions, "active"_n),
    //     common::contracts::permissions,
    //     "checkledger"_n,
    //     std::make_tuple(actor, project_id, itr_account->ledger_id))
    //     .send();

    auto accounts_by_ledger = accounts.get_index<"byledger"_n>();
    auto itr_accounts = accounts_by_ledger.find(itr_account->ledger_id);
    while ((itr_accounts != accounts_by_ledger.end()) && (itr_accounts->ledger_id == itr_account->ledger_id))
    {
        if (itr_accounts->account_id != account_id)
        {
            check(itr_accounts->account_name != account_name, common::contracts::accounts.to_string() + ": that name has been already taken.");
        }
        itr_accounts++;
    }

    accounts.modify(itr_account, _self, [&](auto &modified_account)
                    {
        modified_account.account_name = account_name;
        modified_account.description = description;
        modified_account.account_category = account_category; 
        modified_account.naics_code = naics_code;
        modified_account.jobs_multiplier = jobs_multiplier; });

    budget_tables budgets(common::contracts::budgets, project_id);
    auto budgets_by_account = budgets.get_index<"byaccount"_n>();
    auto itr_budget = budgets_by_account.find(account_id);

    uint64_t budget_id = 0;

    while (itr_budget != budgets_by_account.end() && itr_budget->account_id == account_id)
    {
        if (itr_budget->budget_type_id == 1)
        {
            budget_id = itr_budget->budget_id;
            break;
        }
        itr_budget++;
    }

    // TODO: send timestamp corresponding to the updating date
    uint64_t date = 0;
    // uint64_t begind_date = itr_budget->begin_date;
    uint64_t budget_type_id = 1;

    if (budget_id > 0)
    {
        action(
            permission_level(common::contracts::budgets, "active"_n),
            common::contracts::budgets,
            "editbudget"_n,
            std::make_tuple(common::contracts::budgets, project_id, budget_id, budget_amount, budget_type_id, date, date, true))
            .send();
    }
    else
    {
        action(
            permission_level(common::contracts::budgets, "active"_n),
            common::contracts::budgets,
            "addbudget"_n,
            std::make_tuple(common::contracts::budgets, project_id, account_id, budget_amount, budget_type_id, date, date, true))
            .send();
    }
}

ACTION accounts::deleteaccnt(const eosio::name &actor,
                             const uint64_t &project_id,
                             const uint64_t &account_id)
{
    const eosio::name contract_caller = has_auth(actor) ? actor : _self;
    require_auth(contract_caller);

    auto project = projects_table.find(project_id);
    check(project != projects_table.end(), common::contracts::accounts.to_string() + ": the project where the account is trying to be deleted does not exist.");

    account_tables accounts(_self, project_id);

    auto account = accounts.find(account_id);
    check(account != accounts.end(), common::contracts::accounts.to_string() + ": deleteaccnt, the account does not exist.");
    check(account->parent_id != 0, common::contracts::accounts.to_string() + ": deleteaccnt -> parent account can not be deleted.");

    // action(
    //     permission_level(common::contracts::permissions, "active"_n),
    //     common::contracts::permissions,
    //     "checkledger"_n,
    //     std::make_tuple(actor, project_id, account->ledger_id))
    //     .send();

    check(account->num_children == 0, common::contracts::accounts.to_string() + ": the account has subaccounts and can not be deleted.");
    check(account->increase_balance == asset(0, common::currency), common::contracts::accounts.to_string() + ": the account has an increase balance grater than 0 and can not be deleted.");
    check(account->decrease_balance == asset(0, common::currency), common::contracts::accounts.to_string() + ": the account has a decrease balance grater than 0 and can not be deleted.");

    auto parent = accounts.find(account->parent_id);
    check(parent != accounts.end(), common::contracts::accounts.to_string() + ": the parent account does not exist.");

    budget_tables budgets(common::contracts::budgets, project_id);
    auto budgets_by_account = budgets.get_index<"byaccount"_n>();
    auto itr_budgets_by_account = budgets_by_account.find(account_id);

    action(
        permission_level(common::contracts::budgets, "active"_n),
        common::contracts::budgets,
        "deletebudget"_n,
        std::make_tuple(actor, project_id, itr_budgets_by_account->budget_id, true))
        .send();

    accounts.modify(parent, _self, [&](auto &modified_account)
                    { modified_account.num_children -= 1; });

    action(
        permission_level(contract_caller, "active"_n),
        _self,
        "helpdelete"_n,
        std::make_tuple(actor, project_id, account_id))
        .send();
}

ACTION accounts::addaccount(const eosio::name &actor,
                            const uint64_t &project_id,
                            const std::string &account_name,
                            const uint64_t &parent_id,
                            const eosio::symbol &account_currency,
                            const std::string &description,
                            const uint64_t &account_category,
                            const eosio::asset &budget_amount,
                            const uint64_t &naics_code,
                            const uint64_t &jobs_multiplier)
{

    require_auth(has_auth(actor) ? actor : _self);

    auto admin_itr = users.find(actor.value);
    check(admin_itr->role == common::projects::entity::fund, actor.to_string() + " is not an admin!");

    auto project_itr = projects_table.find(project_id);
    check(project_itr != projects_table.end(), "The project does not exists");

    auto user_itr = users.find(project_itr->owner.value);
    check(user_itr != users.end(), common::contracts::accounts.to_string() + ": the user does not exist.");

    ledger_tables ledger_t(_self, project_id);
    auto ledger_t_by_entity = ledger_t.get_index<"byentity"_n>();
    auto itr_ledger = ledger_t_by_entity.find(admin_itr->entity_id);

    check(itr_ledger != ledger_t_by_entity.end(), common::contracts::accounts.to_string() + ": there is no ledger associated with that entity.");

    auto project_exists = projects_table.find(project_id);
    check(project_exists != projects_table.end(), common::contracts::accounts.to_string() + ": the project where the account is trying to be placed does not exist.");

    account_tables accounts(_self, project_id);

    auto accounts_by_ledger = accounts.get_index<"byledger"_n>();
    auto itr_accounts = accounts_by_ledger.find(itr_ledger->ledger_id);

    while (itr_accounts != accounts_by_ledger.end() && itr_accounts->ledger_id == itr_ledger->ledger_id)
    {
        check(itr_accounts->account_name != account_name, common::contracts::accounts.to_string() + ": the name of the account already exists.");
        itr_accounts++;
    }

    check(ACCOUNT_CATEGORIES.is_valid_constant(account_category), common::contracts::accounts.to_string() + ": the account category is invalid.");

    check(account_currency == common::currency, common::contracts::accounts.to_string() + ": the currency must be the same.");
    check(budget_amount >= asset(0, common::currency), _self.to_string() + ": addaccount -> the amount cannot be negative.");

    check(parent_id != 0, common::contracts::accounts.to_string() + ": addaccount -> the parent id must be grater than zero.");

    check(parent_id == 1 || parent_id == 2, common::contracts::accounts.to_string() + ": addaccount -> the given parent_id does not exist");

    auto parent = accounts.find(parent_id);
    check(parent != accounts.end(), common::contracts::accounts.to_string() + ": the parent account does not exist.");

    if (parent->num_children == 0)
    {
        check(parent->increase_balance == asset(0, common::currency) && parent->decrease_balance == asset(0, common::currency),
              common::contracts::accounts.to_string() + ": the parent's balance is not zero.");
    }

    check(parent->ledger_id == itr_ledger->ledger_id, common::contracts::accounts.to_string() + ": the ledger must be the same as the parent account.");

    uint64_t new_account_id = accounts.available_primary_key();
    new_account_id = (new_account_id > 0) ? new_account_id : 1;

    accounts.emplace(_self, [&](auto &new_account)
                     {
		new_account.account_id = new_account_id; 
		new_account.parent_id = parent_id;
        new_account.ledger_id = itr_ledger -> ledger_id;
		new_account.account_name = account_name;
		new_account.account_subtype = parent -> account_subtype;
		new_account.increase_balance = asset(0, common::currency);
		new_account.decrease_balance = asset(0, common::currency);
		new_account.account_symbol = common::currency;
        new_account.description = description;
        new_account.naics_code = naics_code;
        new_account.jobs_multiplier = jobs_multiplier;
        new_account.account_category = account_category; });

    accounts.modify(parent, _self, [&](auto &modified_account)
                    { modified_account.num_children += 1; });

    if (budget_amount >= asset(0, common::currency))
    {
        uint64_t budget_type_id = 1;
        uint64_t date = 0;
        action(
            permission_level(common::contracts::budgets, "active"_n),
            common::contracts::budgets,
            "addbudget"_n,
            std::make_tuple(common::contracts::budgets, project_id, new_account_id, budget_amount, budget_type_id, date, date, true))
            .send();
    }
}

ACTION accounts::deleteaccnts(const uint64_t &project_id)
{
    require_auth(_self);

    account_tables accounts(_self, project_id);

    auto itr_account = accounts.begin();
    while (itr_account != accounts.end())
    {
        action(
            permission_level(common::contracts::budgets, "active"_n),
            common::contracts::budgets,
            "delbdgtsacct"_n,
            std::make_tuple(project_id, itr_account->account_id))
            .send();
        itr_account = accounts.erase(itr_account);
    }

    ledger_tables ledger_t(_self, project_id);
    auto itr_ledger = ledger_t.begin();
    while (itr_ledger != ledger_t.end())
    {
        itr_ledger = ledger_t.erase(itr_ledger);
    }
}

void accounts::add_account(const uint64_t &entity_id,
                           const uint64_t &project_id,
                           const std::string &account_name,
                           const uint64_t &parent_id,
                           const eosio::symbol &account_currency,
                           const std::string &description,
                           const uint64_t &account_category,
                           const eosio::asset &budget_amount)
{

    ledger_tables ledger_t(_self, project_id);
    auto ledger_t_by_entity = ledger_t.get_index<"byentity"_n>();
    auto itr_ledger = ledger_t_by_entity.find(entity_id);
    check(itr_ledger != ledger_t_by_entity.end(), common::contracts::accounts.to_string() + ": there is no ledger associated with that entity.");

    auto project_exists = projects_table.find(project_id);
    check(project_exists != projects_table.end(), common::contracts::accounts.to_string() + ": the project where the account is trying to be placed does not exist.");

    account_tables accounts(_self, project_id);

    auto accounts_by_ledger = accounts.get_index<"byledger"_n>();
    auto itr_accounts = accounts_by_ledger.find(itr_ledger->ledger_id);

    while (itr_accounts != accounts_by_ledger.end() && itr_accounts->ledger_id == itr_ledger->ledger_id)
    {
        check(itr_accounts->account_name != account_name, common::contracts::accounts.to_string() + ": the name of the account already exists.");
        itr_accounts++;
    }

    check(ACCOUNT_CATEGORIES.is_valid_constant(account_category), common::contracts::accounts.to_string() + ": the account category is invalid.");

    check(account_currency == common::currency, common::contracts::accounts.to_string() + ": the currency must be the same.");
    check(budget_amount >= asset(0, common::currency), _self.to_string() + ": add_account -> the amount cannot be negative.");

    check(parent_id != 0, common::contracts::accounts.to_string() + ": add_account -> the parent id must be grater than zero.");

    auto parent = accounts.find(parent_id);
    check(parent != accounts.end(), common::contracts::accounts.to_string() + " the parent account does not exist.");

    if (parent->num_children == 0)
    {
        check(parent->increase_balance == asset(0, common::currency) && parent->decrease_balance == asset(0, common::currency),
              common::contracts::accounts.to_string() + ": the parent's balance is not zero.");
    }

    check(parent->ledger_id == itr_ledger->ledger_id, common::contracts::accounts.to_string() + ": the ledger must be the same as the parent account.");

    uint64_t new_account_id = accounts.available_primary_key();
    new_account_id = (new_account_id > 0) ? new_account_id : 1;

    accounts.emplace(_self, [&](auto &new_account)
                     {
		new_account.account_id = new_account_id; 
		new_account.parent_id = parent_id;
        new_account.ledger_id = itr_ledger -> ledger_id;
		new_account.account_name = account_name;
		new_account.account_subtype = parent -> account_subtype;
		new_account.increase_balance = asset(0, common::currency);
		new_account.decrease_balance = asset(0, common::currency);
		new_account.account_symbol = common::currency;
        new_account.description = description;
        new_account.account_category = account_category; });

    accounts.modify(parent, _self, [&](auto &modified_account)
                    { modified_account.num_children += 1; });

    if (budget_amount >= asset(0, common::currency))
    {
        uint64_t budget_type_id = 1;
        uint64_t date = 0;
        action(
            permission_level(common::contracts::budgets, "active"_n),
            common::contracts::budgets,
            "addbudget"_n,
            std::make_tuple(common::contracts::budgets, project_id, new_account_id, budget_amount, budget_type_id, date, date, true))
            .send();
    }
}
