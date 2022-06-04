using namespace eosio;

// scoped by project
#define DEFINE_ROLE_TABLE                            \
  TABLE role_table                                   \
  {                                                  \
    uint64_t role_id;                                \
    string role_name;                                \
    uint64_t permissions; /* 1 1 1 1 0 0 0 0 */      \
                                                     \
    uint64_t primary_key() const { return role_id; } \
  };
  
#define DEFINE_ROLE_TABLE_MULTI_INDEX               \
  typedef eosio::multi_index<"roles"_n, role_table> \
      role_tables;