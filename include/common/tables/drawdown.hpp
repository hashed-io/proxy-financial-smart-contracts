#include "../data_types.hpp"

using namespace eosio;

// scoped by project_id
#define DEFINE_DRAWDOWN_TABLE                            \
  TABLE drawdown_table                                   \
  {                                                      \
    uint64_t drawdown_id;                                \
    std::string type;                                    \
    eosio::asset total_amount;                           \
    vector<common::types::url_information> files;        \
    uint64_t state;                                      \
    uint64_t open_date;                                  \
    uint64_t close_date;                                 \
                                                         \
    uint64_t primary_key() const { return drawdown_id; } \
    uint64_t by_state() const { return state; }          \
  };

#define DEFINE_DRAWDOWN_TABLE_MULTI_INDEX                                                                    \
  typedef eosio::multi_index<"drawdowns"_n, drawdown_table,                                                  \
                             indexed_by<"bystate"_n,                                                         \
                                        const_mem_fun<drawdown_table, uint64_t, &drawdown_table::by_state>>> \
      drawdown_tables;