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

CONTRACT accounts : public contract {

    public:

        using contract::contract;
        accounts(name receiver, name code, datastream<const char*> ds)
            : contract(receiver, code, ds),
              account_types(receiver, receiver.value),
              budget_types(receiver, receiver.value),
              projects_table(contract_names::projects, contract_names::projects.value)
              {}
        
        ACTION reset ();

        ACTION initaccounts (uint64_t project_id);

        ACTION addaccount ( name actor,
                            uint64_t project_id, 
                            string account_name, 
                            uint64_t parent_id, 
                            symbol account_currency );

		ACTION editaccount (name actor, uint64_t project_id, uint64_t account_id, string account_name);

		ACTION deleteaccnt (name actor, uint64_t project_id, uint64_t account_id);

		ACTION addbalance (uint64_t project_id, uint64_t account_id, asset amount);

		ACTION subbalance (uint64_t project_id, uint64_t account_id, asset amount);

		ACTION canceladd (uint64_t project_id, uint64_t account_id, asset amount);

		ACTION cancelsub (uint64_t project_id, uint64_t account_id, asset amount);

		ACTION deleteaccnts (uint64_t project_id);

        ACTION addbudget ( name actor,
                           uint64_t project_id,
                           uint64_t account_id,
                           asset amount,
                           uint64_t budget_type_id,
                           uint64_t date_begin,
                           uint64_t date_end,
                           bool modify_parents );

        ACTION editbudget ( name actor,
                            uint64_t project_id,
                            uint64_t budget_id,
                            asset amount,
                            uint64_t budget_type_id,
                            uint64_t date_begin,
                            uint64_t date_end,
                            bool modify_parents );

        ACTION deletebudget (name actor, uint64_t project_id, uint64_t budget_id, bool modify_parents);

        ACTION rcalcbudgets (name actor, uint64_t project_id, uint64_t account_id, uint64_t date_id);

        ACTION delbdgtsacct (uint64_t project_id, uint64_t account_id);
    

    private:

        const vector< pair<string, string> > account_types_v = {
			make_pair(ACCOUNT_SUBTYPES.ASSETS, ACCOUNT_TYPES.DEBIT),
			make_pair(ACCOUNT_SUBTYPES.EQUITY, ACCOUNT_TYPES.CREDIT),
			make_pair(ACCOUNT_SUBTYPES.EXPENSES, ACCOUNT_TYPES.DEBIT),
			make_pair(ACCOUNT_SUBTYPES.INCOME, ACCOUNT_TYPES.CREDIT),
			make_pair(ACCOUNT_SUBTYPES.LIABILITIES, ACCOUNT_TYPES.CREDIT)
		};

        const vector< pair<string, string> > budget_types_v = {
            make_pair(BUDGET_TYPES.TOTAL, "Total budget of the account"),
            make_pair(BUDGET_TYPES.ANNUALLY, "Anual budget of the account"),
            make_pair(BUDGET_TYPES.MONTHLY, "Budget for the month"),
            make_pair(BUDGET_TYPES.WEEKLY, "Budget for the week"),
            make_pair(BUDGET_TYPES.DAILY, "Budget for the day"),
            make_pair(BUDGET_TYPES.CUSTOM, "Budget for a given period of time")
        };

        // scoped by project_id
		TABLE account_table {
			uint64_t account_id;
			uint64_t parent_id;
			uint16_t num_children;
			string account_name;
			string account_subtype;
			asset increase_balance;
			asset decrease_balance;
			symbol account_symbol;

			uint64_t primary_key() const { return account_id; }
			uint64_t by_parent() const { return parent_id; }
		};
        
        // scoped by project_id
        TABLE budget_table {
            uint64_t budget_id;
            uint64_t account_id;
            asset amount;
            uint64_t budget_creation;
            uint64_t budget_update;
            uint64_t budget_date_id;
            
            uint64_t primary_key() const { return budget_id; }
            uint64_t by_account() const { return account_id; }
            uint64_t by_date() const { return budget_date_id; }
        };

        // scoped by project
        TABLE budget_date_table {
            uint64_t budget_date_id;
            uint64_t date_begin;
            uint64_t date_end;
            uint64_t budget_type_id;

            uint64_t primary_key() const { return budget_date_id; }
            uint64_t by_type() const { return budget_type_id; }
            uint64_t by_begin() const { return date_begin; }
            uint64_t by_end() const { return date_end; }
        };

        TABLE budget_type_table {
            uint64_t budget_type_id;
            string type_name;
            string description;

            uint64_t primary_key() const { return budget_type_id; }
        };

        TABLE type_table {
			uint64_t type_id;
			string type_name;
			string account_class;

			uint64_t primary_key() const { return type_id; }
		};

        // table from projects contract
        TABLE project_table {
			uint64_t project_id;
            uint64_t developer_id;
			name owner; // who is a project owner?
            string project_class;
            string project_name;
			string description;
            uint64_t created_date;
            uint64_t status;

            asset total_project_cost;
            asset debt_financing;
            uint8_t term;
            uint16_t interest_rate; // decimal 2
            string loan_agreement; // url

			asset total_equity_financing;
            asset total_gp_equity;
            asset private_equity;
            uint16_t annual_return; // decimal 2
            string project_co_lp; // url
            uint64_t project_co_lp_date;

            uint64_t projected_completion_date;
            uint64_t projected_stabilization_date;
            uint64_t anticipated_year_sale;

            string fund_lp; // url
            asset total_fund_offering_amount;
            uint64_t total_number_fund_offering;
            asset price_per_fund_unit;
            uint64_t approved_date;
            name approved_by;

			uint64_t primary_key() const { return project_id; }
            uint64_t by_owner() const { return owner.value; }
            uint64_t by_developer() const { return developer_id; }
            uint64_t by_status() const { return status; }
		};

        typedef eosio::multi_index <"accounts"_n, account_table,
			indexed_by<"byparent"_n,
			const_mem_fun<account_table, uint64_t, &account_table::by_parent>>
		> account_tables;

        typedef eosio::multi_index <"budgets"_n, budget_table,
            indexed_by<"byaccount"_n,
            const_mem_fun<budget_table, uint64_t, &budget_table::by_account>>,
            indexed_by<"bydate"_n,
            const_mem_fun<budget_table, uint64_t, &budget_table::by_date>>
        > budget_tables;

        typedef eosio::multi_index <"budgetdates"_n, budget_date_table,
            indexed_by<"bytype"_n,
            const_mem_fun<budget_date_table, uint64_t, &budget_date_table::by_type>>,
            indexed_by<"bybegin"_n,
            const_mem_fun<budget_date_table, uint64_t, &budget_date_table::by_begin>>,
            indexed_by<"byend"_n,
            const_mem_fun<budget_date_table, uint64_t, &budget_date_table::by_end>>
        > budget_date_tables;
        
        typedef eosio::multi_index <"budgettypes"_n, budget_type_table> budget_type_tables;

        typedef eosio::multi_index <"accnttypes"_n, type_table> type_tables;

        typedef eosio::multi_index <"projects"_n, project_table> project_tables;

        type_tables account_types;
        project_tables projects_table;
        budget_type_tables budget_types;


		void change_balance (uint64_t project_id, uint64_t account_id, asset amount, bool increase, bool cancel);
        bool overlap(uint64_t begin, uint64_t end, uint64_t new_begin, uint64_t new_end);
        bool match (uint64_t begin, uint64_t end, uint64_t new_begin, uint64_t new_end);
        uint64_t get_id_budget_type (string budget_name);
        
        void create_budget_aux ( name actor,
                                 uint64_t project_id,
                                 uint64_t account_id,
                                 asset amount,
                                 uint64_t budget_type_id,
                                 uint64_t date_begin,
                                 uint64_t date_end,
                                 bool modify_parents );

        void remove_budget_amount (uint64_t project_id, uint64_t budget_id, asset amount);
};









