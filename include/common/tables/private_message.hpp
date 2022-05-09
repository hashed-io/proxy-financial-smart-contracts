using namespace eosio;

#define DEFINE_PRIVATE_MESSAGE_TABLE                                                    \
  TABLE private_message_table                                                           \
  {                                                                                     \
    uint64_t id;                                                                        \
    uint64_t buy_offer_id;                                                              \
    eosio::name sender;                                                                 \
    eosio::name receiver;                                                               \
    std::string iv;                                                                     \
    std::string ephem_key;                                                              \
    std::string message;                                                                \
    eosio::checksum256 mac;                                                             \
                                                                                        \
    uint64_t primary_key() const { return id; }                                         \
    uint128_t by_buy_id() const { return (uint128_t(buy_offer_id) << 64) + id; }        \
    uint128_t by_sender_id() const { return (uint128_t(sender.value) << 64) + id; }     \
    uint128_t by_receiver_id() const { return (uint128_t(receiver.value) << 64) + id; } \
  };

#define DEFINE_PRIVATE_MESSAGE_TABLE_MULTI_INDEX                                                                                  \
  typedef eosio::multi_index<name("pmessages"), private_message_table,                                                            \
                             indexed_by<name("bybuyid"),                                                                          \
                                        const_mem_fun<private_message_table, uint128_t, &private_message_table::by_buy_id>>,      \
                             indexed_by<name("bysenderid"),                                                                       \
                                        const_mem_fun<private_message_table, uint128_t, &private_message_table::by_sender_id>>,   \
                             indexed_by<name("byreceiverid"),                                                                     \
                                        const_mem_fun<private_message_table, uint128_t, &private_message_table::by_receiver_id>>> \
      private_message_tables;