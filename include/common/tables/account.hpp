using namespace eosio;

// ! scoped by project_id
// Budget Expenditures
#define DEFINE_ACCOUNT_TABLE                                      \
  TABLE account_table                                             \
  {                                                               \
    uint64_t account_id;                                          \
    uint64_t parent_id;                                           \
    uint16_t num_children;                                        \
    std::string account_name;    /* Budget Expenditures name*/    \
    std::string account_subtype; /* Asset, Expense, Income ... */ \
    eosio::asset increase_balance;                                \
    eosio::asset decrease_balance;                                \
    symbol account_symbol;                                        \
    uint64_t ledger_id;                                           \
    std::string description;                                      \
    uint64_t naics_code;                                          \
    uint64_t job_multiplayer;                                     \
    uint64_t account_category;                                    \
                                                                  \
    uint64_t primary_key() const { return account_id; }           \
    uint64_t by_parent() const { return parent_id; }              \
    uint64_t by_ledger() const { return ledger_id; }              \
    uint64_t by_category() const { return account_category; }     \
  };

#define DEFINE_ACCOUNT_TABLE_MULTI_INDEX                                                                    \
  typedef eosio::multi_index<"accounts"_n, account_table,                                                   \
                             indexed_by<"byparent"_n,                                                       \
                                        const_mem_fun<account_table, uint64_t, &account_table::by_parent>>, \
                             indexed_by<"byledger"_n,                                                       \
                                        const_mem_fun<account_table, uint64_t, &account_table::by_ledger>>> \
      account_tables;