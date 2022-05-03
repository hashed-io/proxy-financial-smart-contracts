#include <users/base_user.hpp>

void User::check_requirements()
{
  projects::user_tables user_t(contract_name, contract_name.value);
}

void User::create(const eosio::name &account, const std::string &user_name, const eosio::name &role, const std::string &description)
{
  projects::user_tables user_t(contract_name, contract_name.value);

  user_t.emplace(contract_name, [&](auto &item)
                 {
                   item.account = account;
                   item.user_name = user_name;
                   item.role = role;
                   item.description = description; });

  create_imp(account);
}

void User::update(const eosio::name &account, const std::string &user_name, const eosio::name &role, const std::string &description, const uint64_t &encripted_data)
{
  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);

  user_t.modify(user_itr, contract_name, [&](auto &item)
                {
                   item.user_name = user_name;
                   item.description = description; });

  update_impl(account);
}

void User::assign(const eosio::name &account, const uint64_t &project_id)
{
  projects::project_tables project_t(contract_name, contract_name.value);
  auto project_itr = project_t.find(project_id);

  check(project_itr != project_t.end(), common::contracts::projects.to_string() + ": the project does not exist.");

  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);

  for (size_t i = 0; i < user_itr->related_projects.size(); i++)
  {
    check(user_itr->related_projects[i] != project_id, "User already assigned to this project!");
  }

  assign_impl(account, project_id);
}

void User::unassign(const eosio::name &account, const uint64_t &project_id)
{
  projects::project_tables project_t(contract_name, contract_name.value);
  auto project_itr = project_t.find(project_id);

  check(project_itr != project_t.end(), common::contracts::projects.to_string() + ": the project does not exist.");

  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);

  bool is_assigned = false;
  for (size_t i = 0; i < user_itr->related_projects.size(); i++)
  {
    if(user_itr->related_projects[i] == project_id) {
      is_assigned = true;
    }
  }

  check(!is_assigned, "User is not assigned to this project!");

  user_t.modify(user_itr, contract_name, [&](auto & item){
    item.related_projects.erase(std::remove(item.related_projects.begin(), item.related_projects.end(), project_id), item.related_projects.end());
  });

}

void User::remove(const eosio::name &account)
{
  projects::user_tables user_t(contract_name, contract_name.value);
  auto user_itr = user_t.find(account.value);

  user_t.erase(user_itr);
}
