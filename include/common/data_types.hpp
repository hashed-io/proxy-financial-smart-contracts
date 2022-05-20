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

    struct extended_url_information
    { // ! store budget expenditures
      std::vector<url_information> supporting_files;
      std::string description;
      uint64_t date;
      eosio::asset amount;
    }; 

    struct extended_url_information_param
    { // ! store budget expenditures
      std::vector<url_information> supporting_files;
      std::string description;
      uint64_t date;
      eosio::asset amount;
      uint8_t add_file; // remove = 0, create = 1, edit = 2
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
      uint64_t id; // ! user
      uint64_t date; // ! user
      std::vector<transaction_amount> amounts;  // ! user
      std::string description;
      std::vector<url_information> supporting_files; // ! user
      uint64_t flag;
    };

  }
}