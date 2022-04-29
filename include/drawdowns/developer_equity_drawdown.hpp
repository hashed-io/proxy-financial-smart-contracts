#pragma once

#include "base_drawdown.hpp"


class DeveloperEquityDrawdown : public Drawdown {

  public:

    using Drawdown::Drawdown;

  protected:

    virtual void create_impl(const uint64_t &project_id, const eosio::name &drawdown_type);
    virtual void update_impl(const uint64_t &project_id, const uint64_t &drawdown_id);

};
