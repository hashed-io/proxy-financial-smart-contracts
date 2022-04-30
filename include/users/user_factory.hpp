#pragma once

#include "admin_user.hpp"
#include "builder_user.hpp"
#include "investor_user.hpp"

#include "../common/constants.hpp"

class UserFactory
{

public:
  static User *Factory(projects &_contract, const eosio::name &type)
  {
    switch (type.value)
    {
    case common::projects::entity::fund.value:
      return new Admin(_contract);

    case common::projects::entity::developer.value:
      return new Builder(_contract);

    case common::projects::entity::investor.value:
      return new Investor(_contract);

    default:
      break;
    }

    eosio::check(false, "Unknown user type " + type.to_string());
    return nullptr;
  }
};
