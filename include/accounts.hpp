#pragma once

#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
#include <common.hpp>
#include <account_types.hpp>
#include <account_subtypes.hpp>

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
                            string subtype, 
                            symbol account_currency );

		ACTION editaccount (name actor, uint64_t project_id, uint64_t account_id, string new_name);

		ACTION deleteaccnt (name actor, uint64_t project_id, uint64_t account_id);

		ACTION addbalance (uint64_t project_id, uint64_t account_id, asset amount);

		ACTION subbalance (uint64_t project_id, uint64_t account_id, asset amount);

		ACTION canceladd (uint64_t project_id, uint64_t account_id, asset amount);

		ACTION cancelsub (uint64_t project_id, uint64_t account_id, asset amount);
    

    private:

        const vector< pair<string, string> > account_types_v = {
			make_pair(ACCOUNT_SUBTYPES.ASSETS, ACCOUNT_TYPES.DEBIT),
			make_pair(ACCOUNT_SUBTYPES.EQUITY, ACCOUNT_TYPES.CREDIT),
			make_pair(ACCOUNT_SUBTYPES.EXPENSES, ACCOUNT_TYPES.DEBIT),
			make_pair(ACCOUNT_SUBTYPES.INCOME, ACCOUNT_TYPES.CREDIT),
			make_pair(ACCOUNT_SUBTYPES.LIABILITIES, ACCOUNT_TYPES.CREDIT)
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


        // do I really need this?
        TABLE type_table {
			uint64_t type_id;
			string type_name;
			string account_class;

			uint64_t primary_key() const { return type_id; }
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

        typedef eosio::multi_index <"accounts"_n, account_table,
			indexed_by<"byparent"_n,
			const_mem_fun<account_table, uint64_t, &account_table::by_parent>>
		> account_tables;

        typedef eosio::multi_index <"accnttypes"_n, type_table> type_tables;

        typedef eosio::multi_index <"projects"_n, project_table> project_tables;

        type_tables account_types;
        project_tables projects_table;


		void change_balance (uint64_t project_id, uint64_t account_id, asset amount, bool increase, bool cancel);
};









