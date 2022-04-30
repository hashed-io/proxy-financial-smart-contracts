#include <users/investor_user.hpp>

void Investor::update_impl(const eosio::name &account)
{
  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);
}

void Investor::assign_impl(const eosio::name &account, const uint64_t &project_id)
{
  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);

  check(user_itr->related_projects.size() < 1, "Investor can only can manage one project!");

  user_t.modify(user_itr, contract_name, [&](auto &item)
                { item.related_projects.push_back(project_id); });
}
