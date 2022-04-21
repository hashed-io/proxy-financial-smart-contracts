using namespace eosio;

#define DEFINE_BUDGET_TYPE_TABLE                            \
  TABLE budget_type_table                                   \
  {                                                         \
    uint64_t budget_type_id;                                \
    std::string type_name;                                  \
    std::string description;                                \
                                                            \
    uint64_t primary_key() const { return budget_type_id; } \
  };

#define DEFINE_BUDGET_TYPE_TABLE_MULTI_INDEX                     \
  typedef eosio::multi_index<"budgettypes"_n, budget_type_table> \
      budget_type_tables;