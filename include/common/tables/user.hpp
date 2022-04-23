using namespace eosio;

#define DEFINE_USER_TABLE                                  \
  TABLE user_table                                         \
  {                                                        \
    name account;                                          \
    string user_name;                                      \
    uint64_t entity_id;                                    \
    string type;                                           \
                                                           \
    uint64_t primary_key() const { return account.value; } \
    uint64_t by_entity() const { return entity_id; }       \
  };

#define DEFINE_USER_TABLE_MULTI_INDEX                                                                 \
  typedef eosio::multi_index<"users"_n, user_table,                                                   \
                             indexed_by<"byentity"_n,                                                 \
                                        const_mem_fun<user_table, uint64_t, &user_table::by_entity>>> \
      user_tables;