#pragma once

#include "base_user.hpp"


class Builder : public User {

  public:

    using User::User;

  protected:

    virtual void update_impl(const eosio::name &account);
    virtual void assign_impl(const eosio::name &account, const uint64_t &project_id);

};
