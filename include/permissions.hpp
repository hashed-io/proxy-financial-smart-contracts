#pragma once

#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>

#include <common/constants.hpp>
#include <common/data_types.hpp>
#include <common/action_names.hpp>

#include <util.hpp>

#include <permissions/roles.hpp>

#include <common/tables/project.hpp>
#include <common/tables/user.hpp>
#include <common/tables/role.hpp>
#include <common/tables/user_role.hpp>
#include <common/tables/permission.hpp>
#include <common/tables/ledger.hpp>

#include <utility>

using namespace eosio;
using namespace std;

CONTRACT permissions : public contract {

    public:

        using contract::contract;
        permissions(name receiver, name code, datastream<const char*> ds)
            : contract(receiver, code, ds),
              permissions_table(receiver, receiver.value),
              projects_table(common::contracts::projects, common::contracts::projects.value),
              users(common::contracts::projects, common::contracts::projects.value)
              {}

        DEFINE_PROJECT_TABLE
        
        DEFINE_PROJECT_TABLE_MULTI_INDEX

        DEFINE_USER_TABLE

        DEFINE_USER_TABLE_MULTI_INDEX

        DEFINE_ROLE_TABLE

        DEFINE_ROLE_TABLE_MULTI_INDEX

        DEFINE_USER_ROLE_TABLE

        DEFINE_USER_ROLE_TABLE_MULTI_INDEX

        DEFINE_PERMISSION_TABLE

        DEFINE_PERMISSION_TABLE_MULTI_INDEX

        DEFINE_LEDGER_TABLE

        DEFINE_LEDGER_TABLE_MULTI_INDEX


        ACTION reset();

        ACTION clear();

        ACTION addaction(name action_name);

        ACTION givepermissn (name actor, uint64_t project_id, name action_name, uint64_t role_id);

        ACTION removeprmssn (name actor, uint64_t project_id, name action_name, uint64_t role_id);

        ACTION checkprmissn (name user, uint64_t project_id, name action_name);

        ACTION checkledger (name user, uint64_t project_id, uint64_t ledger_id);

        ACTION assignrole(name actor, name user, uint64_t project_id, uint64_t role_id);

        ACTION initroles (uint64_t project_id);

        ACTION addrole (name actor, uint64_t project_id, string role_name, uint64_t permissions);

        ACTION removerole (name actor, uint64_t project_id, uint64_t role_id);

        ACTION deletepmssns (uint64_t project_id);

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
            make_pair(ACTION_NAMES.PERMISSIONS_REMOVE_ROLE, 4096),          // 1
            make_pair(ACTION_NAMES.BUDGETS_ADD, 8192),
            make_pair(ACTION_NAMES.BUDGETS_REMOVE, 16384),
            make_pair(ACTION_NAMES.BUDGETS_EDIT, 32768),
            make_pair(ACTION_NAMES.BUDGETS_RECALCULATE, 65536)
        };

        const vector< pair<string, uint64_t> > default_roles = {
            make_pair(ROLES.OWNER, 131071),         // 11111111111111111
            make_pair(ROLES.MANAGER, 130879),       // 11111111100111111
            make_pair(ROLES.ACCOUNTANT, 122943)     // 11110000000111111
        };

        permission_tables permissions_table;
        project_tables projects_table;
        user_tables users;

        void toggle_permission (bool add, uint64_t project_id, name action_name, uint64_t role_id);
        void validate_max_permissions (name user, uint64_t project_id, uint64_t permissions);

};

