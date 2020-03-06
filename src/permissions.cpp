#include <permissions.hpp>

ACTION permissions::reset () {
    require_auth(_self);

    auto itr_permissions = permissions_table.begin();
    while (itr_permissions != permissions_table.end()) {
        itr_permissions = permissions_table.erase(itr_permissions);
    }

    auto itr_roles = roles.begin();
    while (itr_roles != roles.end()) {
        itr_roles = roles.erase(itr_roles);
    }

    auto itr_default_permissions = default_permissions.begin();
    while (itr_default_permissions != default_permissions.end()) {
        permissions_table.emplace(_self, [&](auto & new_permission){
            new_permission.action_name = itr_default_permissions -> first;
            new_permission.permissions = itr_default_permissions -> second;
        });
        itr_default_permissions++;
    }

    auto itr_default_roles = default_roles.begin();
    while (itr_default_roles != default_roles.end()) {
        roles.emplace(_self, [&](auto & new_role){
            new_role.role_id = roles.available_primary_key();
            new_role.role_name = itr_default_roles -> first;
            new_role.permissions = itr_default_roles -> second;
        });
        itr_default_roles++;
    }
}

ACTION permissions::assignrole (name actor, name user, uint64_t project_id, uint64_t role_id) {
    require_auth(actor);

    if (actor != _self) {
        //================================//
        //== check for permissions here ==//
        //================================//
        print("must check for permissions");
    }

    auto itr_project = projects_table.find(project_id);
    check(itr_project != projects_table.end(), contract_names::permissions.to_string() + ": the project does not exist.");

    auto itr_role = roles.find(role_id);
    check(itr_role != roles.end(), contract_names::permissions.to_string() + ": the role does not exist.");

    user_role_tables userroles(_self, project_id);

    auto itr_user = userroles.find(user.value);

    if (itr_user == userroles.end()) {
        userroles.emplace(_self, [&](auto & new_userrole){
            new_userrole.user = user;
            new_userrole.role_id = role_id;
        });
    } else {
        userroles.modify(itr_user, _self, [&](auto & modified_userrole){
            modified_userrole.role_id = role_id;
        });
    }
}

ACTION permissions::checkprmissn (name user, uint64_t project_id, name action_name) {
    require_auth(_self);

    user_role_tables userroles(_self, project_id);

    auto itr_userrole = userroles.find(user.value);
    check(itr_userrole != userroles.end(), contract_names::permissions.to_string() + ": the user does not have an entry in the roles table.");

    auto itr_permission = permissions_table.find(action_name.value);
    check(itr_permission != permissions_table.end(), contract_names::permissions.to_string() + ": the permission does not exist.");

    auto itr_role = roles.find(itr_userrole -> role_id);
    check(itr_role != roles.end(), contract_names::permissions.to_string() + ": the role does not exist.");

    check((itr_role -> permissions & itr_permission -> permissions) > 0, 
            contract_names::permissions.to_string() + ": the user " + user.to_string() + " does not have permissions to do this.");
}

ACTION permissions::givepermissn (name actor, name action_name, uint64_t role_id) {
    require_auth(actor);

    if (actor != _self) {
        //================================//
        //== check for permissions here ==//
        //================================//
        print("must check for permissions");
    }

    auto itr_role = roles.find(role_id);
    check(itr_role != roles.end(), contract_names::permissions.to_string() + ": the role with the id = " + std::to_string(role_id) + " does not exist.");

    auto itr_action = permissions_table.find(action_name.value);
    check(itr_action != permissions_table.end(), contract_names::permissions.to_string() + ": the action does not exist.");

    roles.modify(itr_role, _self, [&](auto & modified_role){
        modified_role.permissions |= itr_action -> permissions;
    });
}


EOSIO_DISPATCH(permissions, (reset)(assignrole)(checkprmissn)(givepermissn));

