#pragma once

#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
#include <common.hpp>
#include <account_types.hpp>
#include <account_subtypes.hpp>
#include <action_names.hpp>
#include <budget_types.hpp>

using namespace eosio;
using namespace std;

CONTRACT budgets : public contract {

    public:

        using contract::contract;
        budgets(name receiver, name code, datastream<const char*> ds)
            : contract(receiver, code, ds),
              budget_types(receiver, receiver.value)
              {}
        
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
        
        // scoped by project_id
        TABLE budget_table {
            uint64_t budget_id;
            uint64_t account_id;
            asset amount;
            uint64_t budget_creation_date;
            uint64_t budget_update_date;
            uint64_t budget_period_id;
            uint64_t budget_type_id;
            
            uint64_t primary_key() const { return budget_id; }
            uint64_t by_account() const { return account_id; }
            uint64_t by_period() const { return budget_period_id; }
            uint64_t by_type() const { return budget_type_id; }
        };

        // scoped by project
        TABLE budget_period_table {
            uint64_t budget_period_id;
            uint64_t begin_date;
            uint64_t end_date;
            uint64_t budget_type_id;

            uint64_t primary_key() const { return budget_period_id; }
            uint64_t by_type() const { return budget_type_id; }
            uint64_t by_begin() const { return begin_date; }
            uint64_t by_end() const { return end_date; }
        };

        TABLE budget_type_table {
            uint64_t budget_type_id;
            string type_name;
            string description;

            uint64_t primary_key() const { return budget_type_id; }
        };

        // scoped by project_id
        // this is taken from the accounts contract
		TABLE account_table {
			uint64_t account_id;
			uint64_t parent_id;
			uint16_t num_children;
			string account_name;
			string account_subtype;
			asset increase_balance;
			asset decrease_balance;
			symbol account_symbol;
            uint64_t ledger_id;
            string description;

			uint64_t primary_key() const { return account_id; }
			uint64_t by_parent() const { return parent_id; }
            uint64_t by_ledger() const { return ledger_id; }
		};
        

        typedef eosio::multi_index <"budgets"_n, budget_table,
            indexed_by<"byaccount"_n,
            const_mem_fun<budget_table, uint64_t, &budget_table::by_account>>,
            indexed_by<"byperiod"_n,
            const_mem_fun<budget_table, uint64_t, &budget_table::by_period>>,
            indexed_by<"bytype"_n,
            const_mem_fun<budget_table, uint64_t, &budget_table::by_type>>
        > budget_tables;

        typedef eosio::multi_index <"budgetpriods"_n, budget_period_table,
            indexed_by<"bytype"_n,
            const_mem_fun<budget_period_table, uint64_t, &budget_period_table::by_type>>,
            indexed_by<"bybegin"_n,
            const_mem_fun<budget_period_table, uint64_t, &budget_period_table::by_begin>>,
            indexed_by<"byend"_n,
            const_mem_fun<budget_period_table, uint64_t, &budget_period_table::by_end>>
        > budget_period_tables;
        
        typedef eosio::multi_index <"budgettypes"_n, budget_type_table> budget_type_tables;

        typedef eosio::multi_index <"accounts"_n, account_table,
			indexed_by<"byparent"_n,
			const_mem_fun<account_table, uint64_t, &account_table::by_parent>>,
            indexed_by<"byledger"_n,
            const_mem_fun<account_table, uint64_t, &account_table::by_ledger>>
		> account_tables;

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

