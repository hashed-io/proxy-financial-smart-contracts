using namespace eosio;

#define DEFINE_ENTITY_TABLE                            \
  TABLE entity_table                                   \
  {                                                    \
    uint64_t entity_id;                                \
    string entity_name;                                \
    string description;                                \
    eosio::name role;                                  \
                                                       \
    uint64_t primary_key() const { return entity_id; } \
  };

#define DEFINE_ENTITY_TABLE_MULTI_INDEX                  \
  typedef eosio::multi_index<"entities"_n, entity_table> \
      entity_tables;