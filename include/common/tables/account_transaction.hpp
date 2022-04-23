using namespace eosio;

// scoped by project_id
#define DEFINE_ACCOUNT_TRANSACTION_TABLE                          \
  TABLE account_transaction_table                                 \
  {                                                               \
    uint64_t accnt_transaction_id;                                \
    uint64_t account_id;                                          \
    uint64_t transaction_id;                                      \
    int64_t amount;                                               \
                                                                  \
    uint64_t primary_key() const { return accnt_transaction_id; } \
    uint64_t by_account() const { return account_id; }            \
    uint64_t by_transaction() const { return transaction_id; }    \
  };

#define DEFINE_ACCOUNT_TRANSACTION_TABLE_MULTI_INDEX                                                                                     \
  typedef eosio::multi_index<"accnttrx"_n, account_transaction_table,                                                                    \
                             indexed_by<"byaccount"_n,                                                                                   \
                                        const_mem_fun<account_transaction_table, uint64_t, &account_transaction_table::by_account>>,     \
                             indexed_by<"bytrxns"_n,                                                                                     \
                                        const_mem_fun<account_transaction_table, uint64_t, &account_transaction_table::by_transaction>>> \
      account_transaction_tables;