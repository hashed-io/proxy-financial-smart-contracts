#include "../data_types.hpp"

using namespace eosio;

// ! scoped by project_id
#define DEFINE_DRAWDOWN_TABLE                                                                  \
  TABLE drawdown_table                                                                         \
  {                                                                                            \
    uint64_t drawdown_id;                                                                      \
    uint64_t drawdown_number; /* Number of drawdown of each type*/                             \
    std::string type_str;                                                                      \
    eosio::name type;                                                                          \
    eosio::asset total_amount;                                                                 \
    vector<common::types::extended_url_information> files;                                     \
    uint64_t state; /* Add signed transactions */                                              \
    uint64_t open_date;                                                                        \
    uint64_t close_date;                                                                       \
    eosio::name creator;                                                                       \
                                                                                               \
    uint64_t primary_key() const { return drawdown_id; }                                       \
    uint64_t by_type() const { return type.value; }                                            \
    uint64_t by_state() const { return state; }                                                \
    uint64_t by_date() const { return open_date; }                                             \
    uint128_t by_type_creation() const { return (uint128_t(type.value) << 64) + (open_date); } \
    uint128_t by_close_type() const { return (uint128_t(close_date) << 64) + (type.value); }   \
  };

#define DEFINE_DRAWDOWN_TABLE_MULTI_INDEX                                                                             \
  typedef eosio::multi_index<"drawdowns"_n, drawdown_table,                                                           \
                             indexed_by<"bytype"_n,                                                                   \
                                        const_mem_fun<drawdown_table, uint64_t, &drawdown_table::by_type>>,           \
                             indexed_by<"bytypecreate"_n,                                                             \
                                        const_mem_fun<drawdown_table, uint128_t, &drawdown_table::by_type_creation>>, \
                             indexed_by<"byclosetype"_n,                                                              \
                                        const_mem_fun<drawdown_table, uint128_t, &drawdown_table::by_close_type>>,    \
                             indexed_by<"bystate"_n,                                                                  \
                                        const_mem_fun<drawdown_table, uint64_t, &drawdown_table::by_state>>>          \
      drawdown_tables;