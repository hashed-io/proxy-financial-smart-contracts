using namespace eosio;

#define DEFINE_FUND_TRANSFER_TABLE                            \
  TABLE fund_transfer_table                                   \
  {                                                           \
    uint64_t fund_transfer_id;                                \
    string proof_of_transfer;                                 \
    asset amount;                                             \
    uint64_t investment_id;                                   \
    name user;                                                \
    uint64_t status;                                          \
    uint64_t transfer_date;                                   \
    uint64_t updated_date;                                    \
    uint64_t confirmed_date;                                  \
    name confirmed_by;                                        \
                                                              \
    uint64_t primary_key() const { return fund_transfer_id; } \
    uint64_t by_investment() const { return investment_id; }  \
    uint64_t by_status() const { return status; }             \
  };

#define DEFINE_FUND_TRANSFER_TABLE_MULTI_INDEX                                                                              \
  typedef eosio::multi_index<"transfers"_n, fund_transfer_table,                                                            \
                             indexed_by<"byinvestment"_n,                                                                   \
                                        const_mem_fun<fund_transfer_table, uint64_t, &fund_transfer_table::by_investment>>, \
                             indexed_by<"bystatus"_n,                                                                       \
                                        const_mem_fun<fund_transfer_table, uint64_t, &fund_transfer_table::by_status>>>     \
      fund_transfer_tables;