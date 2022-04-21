using namespace eosio;

#define DEFINE_TYPE_TABLE                            \
  TABLE type_table                                   \
  {                                                  \
    uint64_t type_id;                                \
    std::string type_name;                           \
    std::string account_class;                       \
                                                     \
    uint64_t primary_key() const { return type_id; } \
  };

  
#define DEFINE_TYPE_TABLE_MULTI_INDEX                    \
  typedef eosio::multi_index<"accnttypes"_n, type_table> \
      type_tables;