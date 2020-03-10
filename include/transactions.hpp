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
			name owner;
			string project_name;
			string description;
			asset initial_goal;

			uint64_t primary_key() const { return project_id; }
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

