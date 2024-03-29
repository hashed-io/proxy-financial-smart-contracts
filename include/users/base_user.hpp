#pragma once

#include <projects.hpp>

#include "../common/data_types.hpp"
#include "../common/constants.hpp"

class User
{
public:
  User(projects &_contract) : m_contract(_contract), contract_name(_contract.get_self()){};

  virtual ~User(){};

  virtual void check_requirements();

  virtual void create(const eosio::name &account, const std::string &user_name, const eosio::name &role, const std::string &description);
  virtual void update(const eosio::name &account, const std::string &user_name, const eosio::name &role, const std::string &description, const uint64_t &encripted_data);

  virtual void assign(const eosio::name &account, const uint64_t &project_id);
  virtual void unassign(const eosio::name &account, const uint64_t &project_id);

  virtual void remove(const eosio::name &account);

protected:
  virtual void create_impl(const eosio::name &account) = 0;
  virtual void update_impl(const eosio::name &account) = 0;
  virtual void assign_impl(const eosio::name &account, const uint64_t &project_id) = 0;
  virtual void unassign_impl(const eosio::name &account, const uint64_t &project_id) = 0;

  projects &m_contract;
  eosio::name contract_name;
};