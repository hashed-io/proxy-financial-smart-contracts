#pragma once

#include "base_user.hpp"

class Builder : public User
{

public:
  using User::User;

protected:
  virtual void create_impl(const eosio::name &account);
  virtual void update_impl(const eosio::name &account);
  virtual void assign_impl(const eosio::name &account, const uint64_t &project_id);
  virtual void unassign_impl(const eosio::name &account, const uint64_t &project_id);
};
