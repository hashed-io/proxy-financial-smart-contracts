#include <permissions.hpp>


void permissions::toggle_permission (bool add, uint64_t project_id, name action_name, uint64_t role_id) {

    role_tables roles(_self, project_id);

    auto itr_role = roles.find(role_id);
    check(itr_role != roles.end(), contract_names::permissions.to_string() + ": the role with the id = " + std::to_string(role_id) + " does not exist.");

    auto itr_action = permissions_table.find(action_name.value);
    check(itr_action != permissions_table.end(), contract_names::permissions.to_string() + ": the action does not exist.");

    roles.modify(itr_role, _self, [&](auto & modified_role){
        if (
            add && !(modified_role.permissions & itr_action -> permissions) ||
            !add && (modified_role.permissions & itr_action -> permissions)
        ) {
            modified_role.permissions ^= itr_action -> permissions;
        }
    });
}

void permissions::validate_max_permissions (name user, uint64_t project_id, uint64_t permissions) {
    user_role_tables userroles(_self, project_id);

    auto itr_userrole = userroles.find(user.value);
    check(itr_userrole != userroles.end(), contract_names::permissions.to_string() + ": the user does not have an entry in the roles table.");

    role_tables roles(_self, project_id);

    auto itr_role = roles.find(itr_userrole -> role_id);
    check(itr_role != roles.end(), contract_names::permissions.to_string() + ": the role does not exist.");

    check((itr_role -> permissions | permissions) == itr_role -> permissions, 
            contract_names::permissions.to_string() + ": the user " + user.to_string() + " does not have permissions to do this.");
}

ACTION permissions::reset () {
    require_auth(_self);

    auto itr_permissions = permissions_table.begin();
    while (itr_permissions != permissions_table.end()) {
        itr_permissions = permissions_table.erase(itr_permissions);
    }

    auto itr_default_permissions = default_permissions.begin();
    while (itr_default_permissions != default_permissions.end()) {
        permissions_table.emplace(_self, [&](auto & new_permission){
            new_permission.action_name = itr_default_permissions -> first;
            new_permission.permissions = itr_default_permissions -> second;
        });
        itr_default_permissions++;
    }

    for (int i = 0; i < RESET_IDS; i++) {
        role_tables roles(_self, i);
        auto itr_role = roles.begin();
        while (itr_role != roles.end()) {
            itr_role = roles.erase(itr_role);
        }
    }

    for (int i = 0; i < RESET_IDS; i++) {
        user_role_tables userroles(_self, i);
        auto itr_userrole = userroles.begin();
        while (itr_userrole != userroles.end()) {
            itr_userrole = userroles.erase(itr_userrole);
        }
    }
}

ACTION permissions::initroles (uint64_t project_id) {
    require_auth(_self);

    role_tables roles(_self, project_id);

    for (auto itr = default_roles.begin(); itr < default_roles.end(); itr++) {
        roles.emplace(_self, [&](auto & new_role){
            new_role.role_id = roles.available_primary_key();
            new_role.role_name = itr -> first;
            new_role.permissions = itr -> second;
        });
    }
}

ACTION permissions::assignrole (name actor, name user, uint64_t project_id, uint64_t role_id) {
    require_auth(actor);

    if (actor != _self) {
        checkprmissn (actor, project_id, ACTION_NAMES.PERMISSIONS_ASSIGN);
    }

    auto itr_project = projects_table.find(project_id);
    check(itr_project != projects_table.end(), contract_names::permissions.to_string() + ": the project does not exist.");

    role_tables roles(_self, project_id);

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
    user_role_tables userroles(_self, project_id);

    auto itr_userrole = userroles.find(user.value);
    check(itr_userrole != userroles.end(), contract_names::permissions.to_string() + ": the user does not have an entry in the roles table.");

    auto itr_permission = permissions_table.find(action_name.value);
    check(itr_permission != permissions_table.end(), contract_names::permissions.to_string() + ": the permission does not exist.");

    role_tables roles(_self, project_id);

    auto itr_role = roles.find(itr_userrole -> role_id);
    check(itr_role != roles.end(), contract_names::permissions.to_string() + ": the role does not exist.");

    check((itr_role -> permissions & itr_permission -> permissions) > 0, 
            contract_names::permissions.to_string() + ": the user " + user.to_string() + " does not have permissions to do this.");
}


// give permission to a certain role
ACTION permissions::givepermissn (name actor, uint64_t project_id, name action_name, uint64_t role_id) {
    require_auth(actor);

    if (actor != _self) {
        checkprmissn (actor, project_id, ACTION_NAMES.PERMISSIONS_ADD_PERMISSION);

        auto itr_action = permissions_table.find(action_name.value);
        check(itr_action != permissions_table.end(), contract_names::permissions.to_string() + ": the action does not exist.");
        validate_max_permissions (actor, project_id, itr_action -> permissions);
    }

    toggle_permission(true, project_id, action_name, role_id);
}


ACTION permissions::removeprmssn (name actor, uint64_t project_id, name action_name, uint64_t role_id) {
    require_auth(actor);

    check(role_id != 0, contract_names::permissions.to_string() + ": can not remove permissions from owner.");

    if (actor != _self) {
        checkprmissn (actor, project_id, ACTION_NAMES.PERMISSIONS_REMOVE_PERMISSION);

        auto itr_action = permissions_table.find(action_name.value);
        check(itr_action != permissions_table.end(), contract_names::permissions.to_string() + ": the action does not exist.");
        validate_max_permissions (actor, project_id, itr_action -> permissions);
    }

    toggle_permission(false, project_id, action_name, role_id);
}


ACTION permissions::addrole (name actor, uint64_t project_id, string role_name, uint64_t permissions) {
    require_auth(actor);

    checkprmissn (actor, project_id, ACTION_NAMES.PERMISSIONS_ADD_ROLE);
    validate_max_permissions (actor, project_id, permissions);

    role_tables roles(_self, project_id);

    auto itr_role = roles.begin();
    while (itr_role != roles.end()) {
        check(itr_role -> role_name != role_name, contract_names::permissions.to_string() + ": the role already");
        itr_role++;
    }

    roles.emplace(_self, [&](auto & new_role){
        new_role.role_id = roles.available_primary_key();
        new_role.role_name = role_name;
        new_role.permissions = permissions;
    });
}

// give them a weight?
ACTION permissions::removerole (name actor, uint64_t project_id, uint64_t role_id) {
    require_auth(actor);

    check(role_id != 0, contract_names::permissions.to_string() + ": can not remove the owner role.");

    role_tables roles(_self, project_id);

    auto itr_roles = roles.find(role_id);
    check(itr_roles != roles.end(), contract_names::permissions.to_string() + ": the role does not exist.");

    roles.erase(itr_roles);
}


EOSIO_DISPATCH(permissions, (reset)(assignrole)(checkprmissn)(givepermissn)(removeprmssn)(initroles)(addrole)(removerole));

