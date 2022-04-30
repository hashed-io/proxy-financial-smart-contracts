#pragma once

#include "base_user.hpp"


class Admin : public User {

  public:

    using User::User;

  protected:

    virtual void update_impl(const eosio::name &user);
    virtual void assign_impl(const eosio::name &user, const uint64_t &project_id);

};
