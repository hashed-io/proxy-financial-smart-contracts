#include "../data_types.hpp"

using namespace eosio;

// scoped by project_id
#define DEFINE_TRANSACTION_TABLE                                  \
  TABLE transaction_table                                         \
  {                                                               \
    uint64_t transaction_id;                                      \
    eosio::name actor;                                            \
    uint64_t timestamp;                                           \
    std::string description;                                      \
    uint64_t drawdown_id; /* this may change? */                  \
    eosio::asset total_amount;                                    \
    uint64_t transaction_category;                                \
    vector<common::types::transaction_subtypes> accounting;       \
    vector<common::types::url_information> supporting_files;      \
                                                                  \
    uint64_t primary_key() const { return transaction_id; }       \
    uint64_t by_drawdown() const { return drawdown_id; }          \
    uint64_t by_category() const { return transaction_category; } \
  };

#define DEFINE_TRANSACTION_TABLE_MULTI_INDEX                                                                          \
  typedef eosio::multi_index<"transactions"_n, transaction_table,                                                     \
                             indexed_by<"bydrawdown"_n,                                                               \
                                        const_mem_fun<transaction_table, uint64_t, &transaction_table::by_drawdown>>, \
                             indexed_by<"bycategory"_n,                                                               \
                                        const_mem_fun<transaction_table, uint64_t, &transaction_table::by_category>>> \
      transaction_tables;