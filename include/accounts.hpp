#pragma once

#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
#include <common.hpp>
#include <account_types.hpp>
#include <account_subtypes.hpp>
#include <action_names.hpp>
#include <account_categories.hpp>
#include <budget_types.hpp>

#include <vector>


using namespace eosio;
using namespace std;

CONTRACT accounts : public contract {

    public:

        using contract::contract;
        accounts(name receiver, name code, datastream<const char*> ds)
            : contract(receiver, code, ds),
              account_types(receiver, receiver.value),
              projects_table(contract_names::projects, contract_names::projects.value),
              users(contract_names::projects, contract_names::projects.value),
              entities(contract_names::projects, contract_names::projects.value)
              {}
        
        ACTION reset ();

        ACTION init();

        ACTION clean();

        ACTION addledger (uint64_t project_id, uint64_t ledger_id);

        // ACTION initaccounts (uint64_t project_id);

        ACTION addaccount ( name actor,
                            uint64_t project_id,
                            string account_name,
                            uint64_t parent_id,
                            symbol account_currency,
                            string description,
                            uint64_t account_category,
                            asset budget_amount );

		ACTION editaccount ( name actor,
                             uint64_t project_id,
                             uint64_t account_id,
                             string account_name,
                             string description,
                             uint64_t account_category,
                             asset budget_amount );

		ACTION deleteaccnt (name actor, uint64_t project_id, uint64_t account_id);

		ACTION addbalance (uint64_t project_id, uint64_t account_id, asset amount);

		ACTION subbalance (uint64_t project_id, uint64_t account_id, asset amount);

		ACTION canceladd (uint64_t project_id, uint64_t account_id, asset amount);

		ACTION cancelsub (uint64_t project_id, uint64_t account_id, asset amount);

		ACTION deleteaccnts (uint64_t project_id);
    

    private:

        const vector<std::string> hard_cost_accounts = {
            "Construction",
            "Furniture, Fixtures & Allowance",
            "Hard Cost contingency & Allowance"};

        const vector<std::string> soft_cost_accounts = {
            "Architect & Design",
            "Building Permits & Impact Fees",
            "Developer Reimbursable",
            "Builder Risk Insurance",
            "Environment / Soils / Survey",
            "Testing & Inspections",
            "Legal & Professional",
            "Real Estate Taxes & Owner's Liability Insurance",
            "Pre - Development Fee",
            "Equity Management Fee",
            "Bank Origination Fee",
            "Lender Debt Placement Fee",
            "Title, Appraisal, Feasibility, Plan Review & Closing",
            "Interest Carry during Construction",
            "Ops Stabilization & Interest Carry Reserve",
            "Sales & Marketing",
            "Pre - Opening Expenses",
            "Contingency"
            };

        const vector< pair<string, string> > account_types_v = {
			make_pair(ACCOUNT_SUBTYPES.ASSETS, ACCOUNT_TYPES.DEBIT),
			make_pair(ACCOUNT_SUBTYPES.EQUITY, ACCOUNT_TYPES.CREDIT),
			make_pair(ACCOUNT_SUBTYPES.EXPENSES, ACCOUNT_TYPES.DEBIT),
			make_pair(ACCOUNT_SUBTYPES.INCOME, ACCOUNT_TYPES.CREDIT),
			make_pair(ACCOUNT_SUBTYPES.LIABILITIES, ACCOUNT_TYPES.CREDIT)
		};

        const vector <string> ledger_v = {
            "Developer ledger",
            "Fund ledger"
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
            uint64_t ledger_id;
            string description;
            uint64_t account_category;

			uint64_t primary_key() const { return account_id; }
			uint64_t by_parent() const { return parent_id; }
            uint64_t by_ledger() const { return ledger_id; }
            uint64_t by_category() const { return account_category; }
		};

        TABLE type_table {
			uint64_t type_id;
			string type_name;
			string account_class;

			uint64_t primary_key() const { return type_id; }
		};
        
        // scoped by projects
        TABLE ledger_table {
            uint64_t ledger_id;
            uint64_t entity_id;
            string description;

            uint64_t primary_key() const { return ledger_id; }
            uint64_t by_entity() const { return entity_id; }
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

        TABLE user_table {
            name account;
            string user_name;
            uint64_t entity_id;
            string type;

            uint64_t primary_key() const { return account.value; }
        };

        TABLE entity_table {
            uint64_t entity_id;
            string entity_name;
            string description;
            string type;

            uint64_t primary_key() const { return entity_id; }
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

        typedef eosio::multi_index <"accounts"_n, account_table,
			indexed_by<"byparent"_n,
			const_mem_fun<account_table, uint64_t, &account_table::by_parent>>,
            indexed_by<"byledger"_n,
            const_mem_fun<account_table, uint64_t, &account_table::by_ledger>>
		> account_tables;

        typedef eosio::multi_index <"accnttypes"_n, type_table> type_tables;

        typedef eosio::multi_index <"projects"_n, project_table> project_tables;

        typedef eosio::multi_index <"users"_n, user_table> user_tables;

        typedef eosio::multi_index <"entities"_n, entity_table> entity_tables;

        typedef eosio::multi_index <"ledgers"_n, ledger_table,
            indexed_by<"byentity"_n,
            const_mem_fun<ledger_table, uint64_t, &ledger_table::by_entity>>
        > ledger_tables;

        typedef eosio::multi_index <"budgets"_n, budget_table,
            indexed_by<"byaccount"_n,
            const_mem_fun<budget_table, uint64_t, &budget_table::by_account>>,
            indexed_by<"byperiod"_n,
            const_mem_fun<budget_table, uint64_t, &budget_table::by_period>>,
            indexed_by<"bytype"_n,
            const_mem_fun<budget_table, uint64_t, &budget_table::by_type>>
        > budget_tables;

        type_tables account_types;
        project_tables projects_table;
        user_tables users;
        entity_tables entities;

		void change_balance (uint64_t project_id, uint64_t account_id, asset amount, bool increase, bool cancel);

        void add_account (const uint64_t &entity_id,
                            const uint64_t &project_id,
                            const std::string &account_name,
                            const uint64_t &parent_id,
                            const eosio::symbol &account_currency,
                            const std::string &description,
                            const uint64_t &account_category,
                            const eosio::asset &budget_amount);
};









