#pragma once

#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
#include <common.hpp>
#include <account_types.hpp>
#include <account_subtypes.hpp>
#include <action_names.hpp>
#include <drawdown_states.hpp>
#include <account_categories.hpp>
#include <utility>
#include <vector>
#include <string>

using namespace eosio;
using namespace std;

struct transaction_amount {
	uint64_t account_id;
	int64_t amount;
};

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
						  vector<transaction_amount> amounts,
						  uint64_t date,
						  string description,
						  bool is_drawdown,
						  vector<url_information> supporting_files );

		ACTION deletetrxn ( name actor, uint64_t project_id, uint64_t transaction_id );

		ACTION edittrxn ( name actor, 
						  uint64_t project_id,
						  uint64_t transaction_id,
						  vector<transaction_amount> amounts,
						  uint64_t date,
						  string description,
						  bool is_drawdown,
						  vector<url_information> supporting_files );

		ACTION deletetrxns (uint64_t project_id);

		ACTION submitdrwdn (name actor, uint64_t project_id, vector<url_information> files);

		ACTION initdrawdown (uint64_t project_id);

		ACTION toggledrdwn (uint64_t project_id, uint64_t drawdown_id);

	private:

		// scoped by project_id
		TABLE transaction_table {
			uint64_t transaction_id;
			name actor;
			uint64_t timestamp;
			string description;
			uint64_t drawdown_id;
			asset total_amount;
			uint64_t transaction_category;
			vector<url_information> supporting_files;

			uint64_t primary_key() const { return transaction_id; }
			uint64_t by_drawdown() const { return drawdown_id; }
			uint64_t by_category() const { return transaction_category; }
		};

		// scoped by project_id
		TABLE account_transaction_table {
			uint64_t accnt_transaction_id;
			uint64_t account_id;
			uint64_t transaction_id;
			int64_t amount;

			uint64_t primary_key() const { return accnt_transaction_id; }
			uint64_t by_account() const { return account_id; }
			uint64_t by_transaction() const { return transaction_id; }
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
            uint64_t ledger_id;
            string description;
            uint64_t account_category;

			uint64_t primary_key() const { return account_id; }
			uint64_t by_parent() const { return parent_id; }
            uint64_t by_ledger() const { return ledger_id; }
            uint64_t by_category() const { return account_category; }
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

		// scoped by project_id
		TABLE drawdown_table {
			uint64_t drawdown_id;
			asset total_amount;
			vector<url_information> files;
			uint64_t state;
			uint64_t open_date;
			uint64_t close_date;

			uint64_t primary_key() const { return drawdown_id; }
			uint64_t by_state() const { return state; }
		};

		typedef eosio::multi_index <"transactions"_n, transaction_table,
			indexed_by<"bydrawdown"_n,
			const_mem_fun<transaction_table, uint64_t, &transaction_table::by_drawdown>>,
			indexed_by<"bycategory"_n,
			const_mem_fun<transaction_table, uint64_t, &transaction_table::by_category>>
		> transaction_tables;

		typedef eosio::multi_index <"accnttrx"_n, account_transaction_table,
			indexed_by<"byaccount"_n,
			const_mem_fun<account_transaction_table, uint64_t, &account_transaction_table::by_account>>,
			indexed_by<"bytrxns"_n,
			const_mem_fun<account_transaction_table, uint64_t, &account_transaction_table::by_transaction>>	
		> account_transaction_tables;

		typedef eosio::multi_index <"accounts"_n, account_table,
			indexed_by<"byparent"_n,
			const_mem_fun<account_table, uint64_t, &account_table::by_parent>>,
            indexed_by<"byledger"_n,
            const_mem_fun<account_table, uint64_t, &account_table::by_ledger>>
		> account_tables;

		typedef eosio::multi_index <"projects"_n, project_table> project_tables;

		typedef eosio::multi_index <"accnttypes"_n, type_table> type_tables;

		typedef eosio::multi_index <"drawdowns"_n, drawdown_table,
			indexed_by<"bystate"_n,
			const_mem_fun<drawdown_table, uint64_t, &drawdown_table::by_state>>
		> drawdown_tables;
		
		project_tables projects;
		type_tables account_types;

		void delete_transaction (name actor, uint64_t project_id, uint64_t transaction_id);
		
		void make_transaction ( name actor,
								uint64_t transaction_id, 
								uint64_t project_id, 
								vector<transaction_amount> & amounts,
								uint64_t & date,
								string & description,
								bool & is_drawdown,
								vector<url_information> & supporting_files );

};

