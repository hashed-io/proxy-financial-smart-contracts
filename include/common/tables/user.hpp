using namespace eosio;

#define DEFINE_USER_TABLE                                                                             \
  TABLE user_table                                                                                    \
  {                                                                                                   \
    eosio::name account;               /* eosio account name */                                       \
    std::string user_name;             /* a custom name for the user (this may be the actual name) */ \
    uint64_t entity_id;                /* this may be deprecated */                                   \
    eosio::name role;                  /* admin, builder, investor, issuer, regional center*/                                 \
    vector<uint64_t> related_projects; /* ids of projects */                                          \
    std::string description;           /* ids of projects */                                          \
                                                                                                      \
    uint64_t primary_key() const { return account.value; }                                            \
    uint64_t by_role() const { return role.value; }                                                   \
    uint64_t by_entity() const { return entity_id; }                                                  \
  };

#define DEFINE_USER_TABLE_MULTI_INDEX                                                                 \
  typedef eosio::multi_index<"users"_n, user_table,                                                   \
                             indexed_by<"byentity"_n,                                                 \
                                        const_mem_fun<user_table, uint64_t, &user_table::by_entity>>, \
                             indexed_by<"byrole"_n,                                                   \
                                        const_mem_fun<user_table, uint64_t, &user_table::by_role>>>   \
      user_tables;