#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
#include <vector>
#include <string>

using namespace eosio;
using namespace std;


CONTRACT transactions : public contract {

	public:
		using contract::contract;
		transactions(name receiver, name code, datastream<const char*> ds)
			: contract(receiver, code, ds),
			  projects(receiver, receiver.value)
			  {}

		ACTION reset ();

		ACTION transact (  name actor, 
						   uint64_t project_id, 
						   uint64_t from, 
						   uint64_t to, 
						   string description, 
						   asset amount, 
						   bool increase,
						   vector<string> supporting_urls
						);

		ACTION addproject ( name actor,
							string project_name,
							string description,
							asset initial_goal 
						  );

		ACTION addaccount ( name actor,
						  	uint64_t project_id, 
						  	string account_name, 
						  	uint64_t parent, 
						  	uint8_t type, 
						  	symbol account_currency
						  );


	private:
		const symbol currency = symbol("USD", 4); // array of currencies?
		const name contract_name = "proxycap"_n;
		const name app_permission = "active"_n;

		enum AccountType : uint8_t { debit = 0, credit = 1 };

		TABLE project_table {
			uint64_t project_id;
			name owner; // should have an owner?
			string project_name;
			string description;
			asset initial_goal;

			uint64_t primary_key() const { return project_id; }
		};

		// scoped by project_id
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

		// scoped by project_id
		TABLE transaction_table {
			uint64_t transaction_id;
			uint64_t from;
			uint64_t to;
			uint8_t from_increase;
			// uint8_t credit_increase;
			asset amount;
			name actor;
			uint64_t timestamp;
			string description;
			vector<string> supporting_urls; // vector<strings> ??

			uint64_t primary_key() const { return transaction_id; }
		};

		typedef eosio::multi_index <"projects"_n, project_table> project_tables;

		typedef eosio::multi_index <"accounts"_n, account_table,
			indexed_by<"byparent"_n,
			const_mem_fun<account_table, uint64_t, &account_table::by_parent>>
		> account_tables;

		typedef eosio::multi_index <"transactions"_n, transaction_table> transaction_tables;


		project_tables projects;


		void check_asset(asset amount);
};

