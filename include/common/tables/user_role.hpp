using namespace eosio;

// scoped by project
#define DEFINE_USER_ROLE_TABLE                          \
  TABLE user_role_table                                 \
  {                                                     \
    name user;                                          \
    uint64_t role_id;                                   \
                                                        \
    uint64_t primary_key() const { return user.value; } \
  };

#define DEFINE_USER_ROLE_TABLE_MULTI_INDEX                   \
  typedef eosio::multi_index<"userroles"_n, user_role_table> \
      user_role_tables;