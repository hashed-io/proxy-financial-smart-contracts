#pragma once

#include <transactions.hpp>

#include "../common/data_types.hpp"

class Drawdown
{
public:
  Drawdown(uint64_t _project_id, transactions &_contract) : project_id(_project_id), m_contract(_contract), contract_name(_contract.get_self()){};

  virtual ~Drawdown(){};

  virtual void check_requirements();

  virtual void create(const eosio::name &drawdown_type, const uint64_t &drawdown_number);
  virtual void update(const uint64_t &drawdown_id, const eosio::asset &total_amount);

  virtual void submit(const uint64_t &drawdown_id, const std::vector<common::types::url_information> &files);

  virtual void approve(const uint64_t &drawdown_id);
  virtual void reject(const uint64_t &drawdown_id);

protected:
  virtual void create_impl(const eosio::name &drawdown_type, const uint64_t &drawdown_number) = 0;
  virtual void update_impl(const uint64_t &drawdown_id, const eosio::asset &total_amount) = 0;

  uint64_t project_id;
  transactions &m_contract;
  eosio::name contract_name;
};