#pragma once

#include "base_drawdown.hpp"


class EB5Drawdown : public Drawdown {

  public:

    using Drawdown::Drawdown;

  protected:

    virtual void create_impl(const eosio::name &drawdown_type, const uint64_t &drawdown_number);
    virtual void update_impl(const uint64_t &drawdown_id, const eosio::asset &total_amount);

};
