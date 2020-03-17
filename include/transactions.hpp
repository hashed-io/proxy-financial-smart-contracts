#pragma once

#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
#include <common.hpp>
#include <account_types.hpp>
#include <account_subtypes.hpp>
#include <action_names.hpp>
#include <utility>
#include <vector>
#include <string>

using namespace eosio;
using namespace std;


CONTRACT transactions : public contract {

	public:

		using contract::contract;
		transactions(name receiver, name code, datastream<const char*> ds)
			: contract(receiver, code, ds),
			  projects(contract_names::projects, contract_names::projects.value),
			  account_types(contract_names::accounts, contract_names::accounts.value)
			  {}

		ACTION reset ();

		ACTION transact ( name actor, 
						  uint64_t project_id, 
						  uint64_t from, 
						  uint64_t to,
						  uint64_t date,
						  string description, 
						  asset amount, 
						  bool increase,
						  vector<string> supporting_urls );

		ACTION deletetrxn ( name actor, uint64_t project_id, uint64_t transaction_id );

		ACTION edittrxn ( name actor,
						  uint64_t project_id, 
						  uint64_t transaction_id,
						  uint64_t date,
						  string description,
						  asset amount,
						  bool increase,
						  vector<string> supporting_urls );

		ACTION deletetrxns (uint64_t project_id);

	private:

		// scoped by project_id
		TABLE transaction_table {
			uint64_t transaction_id;
			uint64_t from;
			uint64_t to;
			uint8_t from_increase;
			asset amount;
			name actor;
			uint64_t timestamp;
			string description;
			vector<string> supporting_urls;

			uint64_t primary_key() const { return transaction_id; }
		};

		// scoped by project_id, table from accounts contract
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

		TABLE type_table {
			uint64_t type_id;
			string type_name;
			string account_class;

			uint64_t primary_key() const { return type_id; }
		};

		typedef eosio::multi_index <"transactions"_n, transaction_table> transaction_tables;

		typedef eosio::multi_index <"accounts"_n, account_table,
			indexed_by<"byparent"_n,
			const_mem_fun<account_table, uint64_t, &account_table::by_parent>>
		> account_tables;

		typedef eosio::multi_index <"projects"_n, project_table> project_tables;

		typedef eosio::multi_index <"accnttypes"_n, type_table> type_tables;
		
		project_tables projects;
		type_tables account_types;


		name get_action_from (string type_from, bool increase);
		name get_action_to (string type_from, string type_to, bool increase);
		string get_account_type (uint64_t project_id, uint64_t account_id);
		name get_cancel_action (name action_to_be_canceled);
		void delete_transaction (uint64_t project_id, uint64_t transaction_id);
		
		void make_transaction ( name actor, uint64_t project_id, uint64_t from, uint64_t to,
								uint64_t date, string description, asset amount, bool increase,
								vector<string> supporting_urls );

};

