#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
#include <constants.hpp>

using namespace eosio;
using namespace std;

CONTRACT accounts : public contract {

    public:

        using contract::contract;
        accounts(name receiver, name code, datastream<const char*> ds)
            : contract(receiver, code, ds),
              account_types(receiver, receiver.value),
              projects_table(contract_names::projects, contract_names::projects.value)
              {}
        
        ACTION reset ();

        ACTION initaccounts (uint64_t project_id);

        ACTION addaccount ( name actor,
                            uint64_t project_id, 
                            string account_name, 
                            uint64_t parent_id, 
                            uint8_t type, 
                            symbol account_currency );
    

    private:

        enum AccountClass : uint8_t { DEBIT = 1, CREDIT = 0 };

        const vector< pair<string, uint8_t> > account_types_v = {
			make_pair("Assets", AccountClass::DEBIT),
			make_pair("Equity", AccountClass::CREDIT),
			make_pair("Expenses", AccountClass::DEBIT),
			make_pair("Income", AccountClass::CREDIT),
			make_pair("Liabilities", AccountClass::CREDIT)
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

        TABLE type_table {
			uint64_t type_id;
			string type_name;
			uint8_t account_class;

			uint64_t primary_key() const { return type_id; }
		};

        TABLE project_table {
			uint64_t project_id;
			name owner;
			string project_name;
			string description;
			asset initial_goal;

			uint64_t primary_key() const { return project_id; }
		};

        typedef eosio::multi_index <"accounts"_n, account_table,
			indexed_by<"byparent"_n,
			const_mem_fun<account_table, uint64_t, &account_table::by_parent>>
		> account_tables;

        typedef eosio::multi_index <"accnttypes"_n, type_table> type_tables;

        typedef eosio::multi_index <"projects"_n, project_table> project_tables;

        type_tables account_types;
        project_tables projects_table;

};









