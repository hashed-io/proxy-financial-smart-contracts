#include <users/regional_center_user.hpp>

void RegionalCenter::create_impl(const eosio::name &account)
{
  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);

  user_t.modify(user_itr, contract_name, [&](auto &item)
                { item.entity_id = 5; });
}

void RegionalCenter::update_impl(const eosio::name &account)
{
  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);
}

void RegionalCenter::assign_impl(const eosio::name &account, const uint64_t &project_id)
{
  projects::project_tables project_t(contract_name, contract_name.value);
  auto project_itr = project_t.find(project_id);

  //TODO: check if there is a prev regional center assigned to the project
  check(project_itr -> regional_center.value == 0, "There can only be one regional center per project" );

  project_t.modify(project_itr, contract_name, [&](auto &item)
                   { item.regional_center = account; });
  
  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);

  user_t.modify(user_itr, contract_name, [&](auto &item)
                { item.related_projects.push_back(project_id); });
}

void RegionalCenter::unassign_impl(const eosio::name &account, const uint64_t &project_id)
{ 
  projects::project_tables project_t(contract_name, contract_name.value);
  auto project_itr = project_t.find(project_id);

  project_t.modify(project_itr, contract_name, [&](auto &item)
                   { item.regional_center = eosio::name();
                   });
}