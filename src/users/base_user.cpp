#include <users/base_user.hpp>

void User::check_requirements()
{
}

void User::create(const eosio::name &user, const std::string &user_name, const eosio::name &role, const std::string &description)
{
}

void User::update(const eosio::name &user, const std::string &user_name, const eosio::name &role, const std::string &description, const uint64_t &encripted_data)
{
}

void User::assign(const eosio::name &user, const uint64_t &project_id)
{

  assign_impl(user, project_id);
}

void User::unassign(const eosio::name &user, const uint64_t &project_id)
{
}

void User::remove(const eosio::name &user)
{
}
