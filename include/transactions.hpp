#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
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
			  projects(contract_names::projects, contract_names::projects.value)
			  {}

		ACTION reset ();

		ACTION transact ( name actor, 
						  uint64_t project_id, 
						  uint64_t from, 
						  uint64_t to, 
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
			string account_name;
			uint8_t type;
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

		typedef eosio::multi_index <"transactions"_n, transaction_table> transaction_tables;

		typedef eosio::multi_index <"accounts"_n, account_table,
			indexed_by<"byparent"_n,
			const_mem_fun<account_table, uint64_t, &account_table::by_parent>>
		> account_tables;

		typedef eosio::multi_index <"projects"_n, project_table> project_tables;
		
		project_tables projects;

};

