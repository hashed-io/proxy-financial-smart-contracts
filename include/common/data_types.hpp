#pragma once

#include <eosio/system.hpp>
#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

namespace common
{
  namespace types
  {

    typedef std::variant<std::monostate, int64_t, double, eosio::name, eosio::asset, std::string, bool, eosio::time_point> variant_value;

    struct url_information
    {
      std::string filename;
      std::string address;
    };

    struct transaction_subtypes
    {
      eosio::name account;
      eosio::asset amount;
    };

  }
}