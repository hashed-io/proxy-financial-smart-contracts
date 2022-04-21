using namespace eosio;

// scoped by project
#define DEFINE_BUDGET_PERIOD_TABLE                            \
  TABLE budget_period_table                                   \
  {                                                           \
    uint64_t budget_period_id;                                \
    uint64_t begin_date;                                      \
    uint64_t end_date;                                        \
    uint64_t budget_type_id;                                  \
                                                              \
    uint64_t primary_key() const { return budget_period_id; } \
    uint64_t by_type() const { return budget_type_id; }       \
    uint64_t by_begin() const { return begin_date; }          \
    uint64_t by_end() const { return end_date; }              \
  };

#define DEFINE_BUDGET_PERIOD_TABLE_MULTI_INDEX                                                                         \
  typedef eosio::multi_index<"budgetpriods"_n, budget_period_table,                                                    \
                             indexed_by<"bytype"_n,                                                                    \
                                        const_mem_fun<budget_period_table, uint64_t, &budget_period_table::by_type>>,  \
                             indexed_by<"bybegin"_n,                                                                   \
                                        const_mem_fun<budget_period_table, uint64_t, &budget_period_table::by_begin>>, \
                             indexed_by<"byend"_n,                                                                     \
                                        const_mem_fun<budget_period_table, uint64_t, &budget_period_table::by_end>>>   \
      budget_period_tables;