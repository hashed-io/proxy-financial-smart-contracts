#pragma once

#include "eb5_drawdown.hpp"
#include "construction_loan_drawdown.hpp"
#include "developer_equity_drawdown.hpp"

#include "../common/constants.hpp"

class DrawdownFactory
{

public:
  static Drawdown *Factory(const uint64_t &project_id, transactions &_contract, const eosio::name &type)
  {
    switch (type.value)
    {
    case common::transactions::drawdown::type::eb5.value:
      return new EB5Drawdown(project_id, _contract);

    case common::transactions::drawdown::type::construction_loan.value:
      return new ConstructionLoanDrawdown(project_id, _contract);

    case common::transactions::drawdown::type::developer_equity.value:
      return new DeveloperEquityDrawdown(project_id, _contract);

    default:
      break;
    }

    eosio::check(false, "Unknown drawdown type " + type.to_string());
    return nullptr;
  }
};
