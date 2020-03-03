#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
#include <constants.hpp>

using namespace eosio;
using namespace std;

CONTRACT projects : public contract {

    public:

        using contract::contract;
        projects(name receiver, name code, datastream<const char*> ds)
            : contract(receiver, code, ds),
              projects_table(receiver, receiver.value)
              {}

        ACTION reset ();

        ACTION addproject ( name actor,
							string project_name,
							string description,
							asset initial_goal );
        
        // ACTION removeprojct ();

        // ACTION editproject ();


    private:

        TABLE project_table {
			uint64_t project_id;
			name owner;
			string project_name;
			string description;
			asset initial_goal;

			uint64_t primary_key() const { return project_id; }
		};

        typedef eosio::multi_index <"projects"_n, project_table> project_tables;

        project_tables projects_table;

};
















