#pragma once

#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
#include <common.hpp>
#include <utility>
#include <roles.hpp>
#include <action_names.hpp>

using namespace eosio;
using namespace std;

CONTRACT permissions : public contract {

    public:

        using contract::contract;
        permissions(name receiver, name code, datastream<const char*> ds)
            : contract(receiver, code, ds),
              permissions_table(receiver, receiver.value),
              projects_table(contract_names::projects, contract_names::projects.value)
              {}

        ACTION reset();

        ACTION givepermissn (name actor, uint64_t project_id, name action_name, uint64_t role_id);

        ACTION removeprmssn (name actor, uint64_t project_id, name action_name, uint64_t role_id);

        ACTION checkprmissn(name user, uint64_t project_id, name action_name);

        ACTION assignrole(name actor, name user, uint64_t project_id, uint64_t role_id);

        ACTION initroles (uint64_t project_id);

        ACTION addrole (name actor, uint64_t project_id, string role_name, uint64_t permissions);

        ACTION removerole (name actor, uint64_t project_id, uint64_t role_id);

    private:

        const vector< pair<name, uint64_t> > default_permissions = {
            make_pair(ACTION_NAMES.ACCOUNTS_ADD, 1),                        // 1    
            make_pair(ACTION_NAMES.ACCOUNTS_REMOVE, 2),                     // 1    
            make_pair(ACTION_NAMES.ACCOUNTS_EDIT, 4),                       // 1    
            make_pair(ACTION_NAMES.TRANSACTIONS_ADD, 8),                    // 1    
            make_pair(ACTION_NAMES.TRANSACTIONS_REMOVE, 16),                // 1
            make_pair(ACTION_NAMES.TRANSACTIONS_EDIT, 32),                  // 1
            make_pair(ACTION_NAMES.PROJECTS_REMOVE, 64),                    // 0
            make_pair(ACTION_NAMES.PROJECTS_EDIT, 128),                     // 0
            make_pair(ACTION_NAMES.PERMISSIONS_ADD_PERMISSION, 256),        // 1
            make_pair(ACTION_NAMES.PERMISSIONS_ADD_ROLE, 512),              // 1
            make_pair(ACTION_NAMES.PERMISSIONS_ASSIGN, 1024),               // 1
            make_pair(ACTION_NAMES.PERMISSIONS_REMOVE_PERMISSION, 2048),    // 1
            make_pair(ACTION_NAMES.PERMISSIONS_REMOVE_ROLE, 4096)           // 1
        };

        const vector< pair<string, uint64_t> > default_roles = {
            make_pair(ROLES.OWNER, 8191),       // 1111111111111
            make_pair(ROLES.MANAGER, 7999),     // 1111100111111
            make_pair(ROLES.ACCOUNTANT, 56)     // 0000000111111
        };


        // scoped by project
        TABLE role_table {
            uint64_t role_id;
            string role_name;
            uint64_t permissions; // 1 1 1 1 0 0 0 0

            uint64_t primary_key() const { return role_id; }
        };

        // scoped by project
        TABLE user_role_table {
            name user;
            uint64_t role_id;

            uint64_t primary_key() const { return user.value; }
        };

        TABLE permission_table {
            name action_name;
            uint64_t permissions; // 0 0 0 0 0 1 0 0 0

            uint64_t primary_key() const { return action_name.value; }
        };

        TABLE project_table {
			uint64_t project_id;
			name owner;
			string project_name;
			string description;
			asset initial_goal;

			uint64_t primary_key() const { return project_id; }
		};

        typedef eosio::multi_index <"roles"_n, role_table> role_tables;

        typedef eosio::multi_index <"userroles"_n, user_role_table> user_role_tables;

        typedef eosio::multi_index <"permissions"_n, permission_table> permission_tables;

        typedef eosio::multi_index <"projects"_n, project_table> project_tables;

        permission_tables permissions_table;
        project_tables projects_table;

        void toggle_permission (bool add, uint64_t project_id, name action_name, uint64_t role_id);
        void validate_max_permissions (name user, uint64_t project_id, uint64_t permissions);

};

