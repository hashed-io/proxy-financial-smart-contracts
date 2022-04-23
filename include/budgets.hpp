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
#include <budgets/budget_types.hpp>

#include <common/tables/budget.hpp>
#include <common/tables/budget_period.hpp>
#include <common/tables/budget_type.hpp>
#include <common/tables/account.hpp>


using namespace eosio;
using namespace std;

CONTRACT budgets : public contract {

    public:

        using contract::contract;
        budgets(name receiver, name code, datastream<const char*> ds)
            : contract(receiver, code, ds),
              budget_types(receiver, receiver.value)
              {}

        DEFINE_BUDGET_TABLE

        DEFINE_BUDGET_TABLE_MULTI_INDEX

        DEFINE_BUDGET_PERIOD_TABLE

        DEFINE_BUDGET_PERIOD_TABLE_MULTI_INDEX

        DEFINE_BUDGET_TYPE_TABLE

        DEFINE_BUDGET_TYPE_TABLE_MULTI_INDEX

        DEFINE_ACCOUNT_TABLE

        DEFINE_ACCOUNT_TABLE_MULTI_INDEX
        
        ACTION reset ();

        ACTION addbudget ( name actor,
                           uint64_t project_id,
                           uint64_t account_id,
                           asset amount,
                           uint64_t budget_type_id,
                           uint64_t begin_date,
                           uint64_t end_date,
                           bool modify_parents );

        ACTION editbudget ( name actor,
                            uint64_t project_id,
                            uint64_t budget_id,
                            asset amount,
                            uint64_t budget_type_id,
                            uint64_t begin_date,
                            uint64_t end_date,
                            bool modify_parents );

        ACTION deletebudget (name actor, uint64_t project_id, uint64_t budget_id, bool modify_parents);

        ACTION rcalcbudgets (name actor, uint64_t project_id, uint64_t account_id, uint64_t budget_period_id);

        ACTION delbdgtsacct (uint64_t project_id, uint64_t account_id);
    

    private:

        const vector< pair<string, string> > budget_types_v = {
            make_pair(BUDGET_TYPES.TOTAL, "Total budget of the account"),
            make_pair(BUDGET_TYPES.ANNUALLY, "Anual budget of the account"),
            make_pair(BUDGET_TYPES.MONTHLY, "Budget for the month"),
            make_pair(BUDGET_TYPES.WEEKLY, "Budget for the week"),
            make_pair(BUDGET_TYPES.DAILY, "Budget for the day"),
            make_pair(BUDGET_TYPES.CUSTOM, "Budget for a given period of time")
        };

        budget_type_tables budget_types;

        bool overlap(uint64_t begin, uint64_t end, uint64_t new_begin, uint64_t new_end);
        bool match (uint64_t begin, uint64_t end, uint64_t new_begin, uint64_t new_end);
        uint64_t get_id_budget_type (string budget_name);
        
        void create_budget_aux ( name actor,
                                 uint64_t project_id,
                                 uint64_t account_id,
                                 asset amount,
                                 uint64_t budget_type_id,
                                 uint64_t begin_date,
                                 uint64_t end_date,
                                 bool modify_parents );

        void remove_budget_amount (uint64_t project_id, uint64_t budget_id, asset amount);
};

