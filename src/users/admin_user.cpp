#include <users/admin_user.hpp>

void Admin::create_impl(const eosio::name &account)
{
  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);

  user_t.modify(user_itr, contract_name, [&](auto &item)
                { item.entity_id = 1; });
}

void Admin::update_impl(const eosio::name &account)
{
  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);
}

void Admin::assign_impl(const eosio::name &account, const uint64_t &project_id)
{
  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);

  user_t.modify(user_itr, contract_name, [&](auto &item)
                { item.related_projects.push_back(project_id); });
}
