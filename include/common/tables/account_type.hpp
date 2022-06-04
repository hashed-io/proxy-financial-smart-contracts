using namespace eosio;

#define DEFINE_TYPE_TABLE                             \
  TABLE account_type_table                            \
  {                                                   \
    uint64_t type_id;                                 \
    std::string type_name;                            \
    std::string account_class;                        \
    uint64_t category;                                \
                                                      \
    uint64_t primary_key() const { return type_id; }  \
    uint64_t by_category() const { return category; } \
  };

#define DEFINE_TYPE_TABLE_MULTI_INDEX                                                                                   \
  typedef eosio::multi_index<"accnttypes"_n, account_type_table,                                                        \
                             indexed_by<"bycategory"_n,                                                                 \
                                        const_mem_fun<account_type_table, uint64_t, &account_type_table::by_category>>> \
      account_type_tables;