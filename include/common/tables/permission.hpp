using namespace eosio;

// scoped by contract

#define DEFINE_PERMISSION_TABLE                                \
  TABLE permission_table                                       \
  {                                                            \
    name action_name;                                          \
    uint64_t permissions; /* 0 0 0 0 0 1 0 0 0 */              \
                                                               \
    uint64_t primary_key() const { return action_name.value; } \
  };

#define DEFINE_PERMISSION_TABLE_MULTI_INDEX                     \
  typedef eosio::multi_index<"permissions"_n, permission_table> \
      permission_tables;