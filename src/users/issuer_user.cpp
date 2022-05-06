#include <users/issuer_user.hpp>

void Issuer::create_impl(const eosio::name &account)
{
  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);

  user_t.modify(user_itr, contract_name, [&](auto &item)
                { item.entity_id = 1; });
}

void Issuer::update_impl(const eosio::name &account)
{
  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);
}

void Issuer::assign_impl(const eosio::name &account, const uint64_t &project_id)
{
  projects::project_tables project_t(contract_name, contract_name.value);
  auto project_itr = project_t.find(project_id);

  project_t.modify(project_itr, contract_name, [&](auto &item)
                   { item.issuer = account; });
  
  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);
  //TODO: check if there is a prev issuer assigned to the project
  //review statement
  check(project_itr -> issuer.size() == 0, "There can only be one issuer per project!")


  user_t.modify(user_itr, contract_name, [&](auto &item)
                { item.related_projects.push_back(project_id); });
}
