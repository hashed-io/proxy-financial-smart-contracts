using namespace eosio;

// scoped by project_id
#define DEFINE_BUDGET_TABLE                                 \
  TABLE budget_table                                        \
  {                                                         \
    uint64_t budget_id;                                     \
    uint64_t account_id;                                    \
    eosio::asset amount;                                    \
    uint64_t budget_creation_date;                          \
    uint64_t budget_update_date;                            \
    uint64_t budget_period_id;                              \
    uint64_t budget_type_id;                                \
                                                            \
    uint64_t primary_key() const { return budget_id; }      \
    uint64_t by_account() const { return account_id; }      \
    uint64_t by_period() const { return budget_period_id; } \
    uint64_t by_type() const { return budget_type_id; }     \
  };

#define DEFINE_BUDGET_TABLE_MULTI_INDEX                                                                    \
  typedef eosio::multi_index<"budgets"_n, budget_table,                                                    \
                             indexed_by<"byaccount"_n,                                                     \
                                        const_mem_fun<budget_table, uint64_t, &budget_table::by_account>>, \
                             indexed_by<"byperiod"_n,                                                      \
                                        const_mem_fun<budget_table, uint64_t, &budget_table::by_period>>,  \
                             indexed_by<"bytype"_n,                                                        \
                                        const_mem_fun<budget_table, uint64_t, &budget_table::by_type>>>    \
      budget_tables;