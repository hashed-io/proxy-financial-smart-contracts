#include <users/investor_user.hpp>

void Investor::create_impl(const eosio::name &account)
{
  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);

  user_t.modify(user_itr, contract_name, [&](auto &item)
                { item.entity_id = 2; });
}

void Investor::update_impl(const eosio::name &account)
{
  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);
}

void Investor::assign_impl(const eosio::name &account, const uint64_t &project_id)
{
  projects::project_tables project_t(contract_name, contract_name.value);
  auto project_itr = project_t.find(project_id);

  project_t.modify(project_itr, contract_name, [&](auto &item)
                   { item.investors.push_back(account); });

  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);

  // TODO check if has another related project check relatedprojects.size() < 1
  check(user_itr->related_projects.size() < 1, "Investor can only can manage one project!");

  user_t.modify(user_itr, contract_name, [&](auto &item)
                { item.related_projects.push_back(project_id); });
}
