#pragma once

#include "base_drawdown.hpp"

class ConstructionLoanDrawdown : public Drawdown
{

public:
  using Drawdown::Drawdown;

protected:
  virtual void create_impl(const eosio::name &drawdown_type, const uint64_t &drawdown_number);
  virtual void update_impl(const uint64_t &drawdown_id, const eosio::asset &total_amount, const bool &is_add_balance);
  virtual void edit_impl(const uint64_t &drawdown_id,
                         vector<common::types::encrypted_url_information> supporting_files,
                         const std::string &description,
                         const uint64_t &date,
                         const eosio::asset &amount,
                         const uint8_t &add_file);
};
