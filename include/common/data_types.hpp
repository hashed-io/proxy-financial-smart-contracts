#pragma once

#include <eosio/system.hpp>
#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

#include <vector>
#include <variant>

namespace common
{
  namespace types
  {

    typedef std::variant<std::monostate, int64_t, double, eosio::name, eosio::asset, std::string, bool, eosio::time_point> variant_value;
    // typedef vector<uint64_t> projects_vector;
    // typedef vector<uint64_t> projects_users;

    struct url_information
    {
      std::string filename;
      std::string address;
    };

    struct account_types
    {
      std::string type_name;
      std::string account_class;
      uint64_t category;
    };

    struct transaction_subtypes // account types
    {
      eosio::name account;
      eosio::asset amount;
    };

    struct transaction_amount // account id refers if is Asset... etc
    {
      uint64_t account_id;
      int64_t amount;
    };

    struct transaction_param
    {
      uint64_t id;
      uint64_t date;
      std::vector<transaction_amount> amounts;
      std::string description;
      std::vector<url_information> supporting_files;
      uint64_t flag;
    };

  }
}