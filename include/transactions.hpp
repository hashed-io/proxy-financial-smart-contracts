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
			  account_types(receiver, receiver.value),
			  roles(receiver, receiver.value),
			  action_permissions(receiver, receiver.value)
			  {}

		ACTION reset ();

		// ACTION transact (  name actor, 
		// 				   uint64_t project_id, 
		// 				   uint64_t from, 
		// 				   uint64_t to, 
		// 				   string description, 
		// 				   asset amount, 
		// 				   bool increase,
		// 				   vector<string> supporting_urls
		// 				);

		

		// ACTION addaccount ( name actor,
		// 				  	uint64_t project_id, 
		// 				  	string account_name, 
		// 				  	uint64_t parent, 
		// 				  	uint8_t type, 
		// 				  	symbol account_currency
		// 				  );


	private:
		

		enum AccountClass : uint8_t { DEBIT = 1, CREDIT = 0 };
		enum Permissions  : uint8_t { OWNER = 0, MANAGER = 1, ACCOUNTANT = 2 };

		const vector< pair<string, uint8_t> > account_types_v = {
			make_pair("Assets", AccountClass::DEBIT),
			make_pair("Equity", AccountClass::CREDIT),
			make_pair("Expenses", AccountClass::DEBIT),
			make_pair("Income", AccountClass::CREDIT),
			make_pair("Liabilities", AccountClass::CREDIT)
		};

		const vector< pair<uint8_t, string> > roles_v = {
			make_pair(OWNER, "owner"),
			make_pair(MANAGER, "manager"),
			make_pair(ACCOUNTANT, "accountant")
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

		// scoped by project_id
		TABLE user_permission_table {
			name user;
			vector<uint8_t> roles;

			uint64_t primary_key() const { return user.value; }
		};

		TABLE action_permission_table {
			name action_p;
			vector<uint8_t> roles;

			uint64_t primary_key() const { return action_p.value; }
		};

		TABLE type_table {
			uint64_t type_id;
			string type_name;
			uint8_t account_class;

			uint64_t primary_key() const { return type_id; }
		};

		TABLE role_table {
			uint64_t role_id;
			string role_name;

			uint64_t primary_key() const { return role_id; }
		};

		

		typedef eosio::multi_index <"accounts"_n, account_table,
			indexed_by<"byparent"_n,
			const_mem_fun<account_table, uint64_t, &account_table::by_parent>>
		> account_tables;

		typedef eosio::multi_index <"transactions"_n, transaction_table> transaction_tables;

		typedef eosio::multi_index <"accnttypes"_n, type_table> type_tables;

		typedef eosio::multi_index <"userprmssion"_n, user_permission_table> user_permission_tables;

		typedef eosio::multi_index <"actnprmssion"_n, action_permission_table> action_permission_tables;

		typedef eosio::multi_index <"roles"_n, role_table> role_tables;

		project_tables projects;
		type_tables account_types;
		role_tables roles;
		action_permission_tables action_permissions;

		void check_asset(asset amount);
		bool check_permissions(name actor, uint64_t project_id, name function);
};

