using namespace eosio;

#define DEFINE_USER_PUBLIC_KEY_TABLE                       \
  TABLE user_public_key_table                              \
  {                                                        \
    eosio::name account;                                   \
    std::string public_key;                                \
                                                           \
    uint64_t primary_key() const { return account.value; } \
  };

#define DEFINE_USER_PUBLIC_KEY_TABLE_MULTI_INDEX \
  typedef eosio::multi_index<name("userspkeys"), user_public_key_table> user_public_key_tables;