using namespace eosio;

// scoped by projects
#define DEFINE_LEDGER_TABLE                            \
  TABLE ledger_table                                   \
  {                                                    \
    uint64_t ledger_id;                                \
    uint64_t entity_id;                                \
    string description;                                \
                                                       \
    uint64_t primary_key() const { return ledger_id; } \
    uint64_t by_entity() const { return entity_id; }   \
  };

#define DEFINE_LEDGER_TABLE_MULTI_INDEX                                                                   \
  typedef eosio::multi_index<"ledgers"_n, ledger_table,                                                   \
                             indexed_by<"byentity"_n,                                                     \
                                        const_mem_fun<ledger_table, uint64_t, &ledger_table::by_entity>>> \
      ledger_tables;