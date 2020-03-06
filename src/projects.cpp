#include <projects.hpp>

ACTION projects::reset () {
    require_auth(_self);

    auto itr_p = projects_table.begin();
	while (itr_p != projects_table.end()) {
		itr_p = projects_table.erase(itr_p);
	}
}

ACTION projects::addproject ( name actor,
							  string project_name,
							  string description,
							  asset initial_goal ) {

    require_auth(actor);
    check_asset(initial_goal, contract_names::projects);

	auto itr_p = projects_table.begin();
	while (itr_p != projects_table.end()) {
		check(project_name != itr_p -> project_name, contract_names::projects.to_string() + ": there is already a project with that name.");
        itr_p++;
	}

    uint64_t new_project_id = projects_table.available_primary_key();

	projects_table.emplace(_self, [&](auto & new_project) {
		new_project.project_id = new_project_id;
		new_project.owner = actor;
		new_project.project_name = project_name;
		new_project.description = description;
		new_project.initial_goal = initial_goal;
	});

    action(
        permission_level(contract_names::accounts, "active"_n),
        contract_names::accounts,
        "initaccounts"_n,
        std::make_tuple(new_project_id)
    ).send();
}


EOSIO_DISPATCH(projects, (reset)(addproject));
