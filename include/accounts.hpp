#pragma once

#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>

#include <common/constants.hpp>
#include <common/data_types.hpp>
#include <common/action_names.hpp>

#include <util.hpp>

#include <accounts/account_types.hpp>
#include <accounts/account_subtypes.hpp>
#include <accounts/account_categories.hpp>

#include <budgets/budget_types.hpp>

#include <common/tables/account.hpp>
#include <common/tables/type.hpp>
#include <common/tables/ledger.hpp>
#include <common/tables/project.hpp>
#include <common/tables/user.hpp>
#include <common/tables/entity.hpp>
#include <common/tables/budget.hpp>

using namespace eosio;
using namespace std;

CONTRACT accounts : public contract {

    public:

        using contract::contract;
        accounts(name receiver, name code, datastream<const char*> ds)
            : contract(receiver, code, ds),
              account_types(receiver, receiver.value),
              projects_table(common::contracts::projects, common::contracts::projects.value),
              users(common::contracts::projects, common::contracts::projects.value),
              entities(common::contracts::projects, common::contracts::projects.value)
              {}

        DEFINE_ACCOUNT_TABLE

        DEFINE_ACCOUNT_TABLE_MULTI_INDEX

        DEFINE_BUDGET_TABLE
        
        DEFINE_BUDGET_TABLE_MULTI_INDEX

        DEFINE_ENTITY_TABLE

        DEFINE_ENTITY_TABLE_MULTI_INDEX

        DEFINE_LEDGER_TABLE

        DEFINE_LEDGER_TABLE_MULTI_INDEX

        DEFINE_PROJECT_TABLE

        DEFINE_PROJECT_TABLE_MULTI_INDEX

        DEFINE_USER_TABLE

        DEFINE_USER_TABLE_MULTI_INDEX

        DEFINE_TYPE_TABLE

	    DEFINE_TYPE_TABLE_MULTI_INDEX

        ACTION reset ();

        ACTION addledger (uint64_t project_id, uint64_t entity_id);

        ACTION initaccounts (uint64_t project_id);

        ACTION addaccount ( name actor,
                            uint64_t project_id,
                            std::string account_name,
                            uint64_t parent_id,
                            symbol account_currency,
                            std::string description,
                            uint64_t account_category,
                            asset budget_amount );

		ACTION editaccount ( name actor,
                             uint64_t project_id,
                             uint64_t account_id,
                             std::string account_name,
                             std::string description,
                             uint64_t account_category,
                             asset budget_amount );

		ACTION deleteaccnt (name actor, uint64_t project_id, uint64_t account_id);

		ACTION addbalance (uint64_t project_id, uint64_t account_id, asset amount);

		ACTION subbalance (uint64_t project_id, uint64_t account_id, asset amount);

		ACTION canceladd (uint64_t project_id, uint64_t account_id, asset amount);

		ACTION cancelsub (uint64_t project_id, uint64_t account_id, asset amount);

		ACTION deleteaccnts (uint64_t project_id);
    

    private:

        const vector< pair<std::string, std::string> > account_types_v = {
			make_pair(ACCOUNT_SUBTYPES.ASSETS, ACCOUNT_TYPES.DEBIT),
			make_pair(ACCOUNT_SUBTYPES.EQUITY, ACCOUNT_TYPES.CREDIT),
			make_pair(ACCOUNT_SUBTYPES.EXPENSES, ACCOUNT_TYPES.DEBIT),
			make_pair(ACCOUNT_SUBTYPES.INCOME, ACCOUNT_TYPES.CREDIT),
			make_pair(ACCOUNT_SUBTYPES.LIABILITIES, ACCOUNT_TYPES.CREDIT)
		};

        const vector <std::string> ledger_v = {
            "Developer ledger",
            "Fund ledger"
        };


        type_tables account_types;
        project_tables projects_table;
        user_tables users;
        entity_tables entities;

		void change_balance (uint64_t project_id, uint64_t account_id, asset amount, bool increase, bool cancel);
};









