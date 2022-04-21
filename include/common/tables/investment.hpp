using namespace eosio;

#define DEFINE_INVESTMENT_TABLE                            \
  TABLE investment_table                                   \
  {                                                        \
    uint64_t investment_id;                                \
    name user;                                             \
    uint64_t project_id;                                   \
    asset total_investment_amount;                         \
    uint64_t quantity_units_purchased; /* decimal? */      \
    uint16_t annual_preferred_return;  /* decimal */       \
    uint64_t signed_agreement_date;                        \
                                                           \
    asset total_confirmed_transfered_amount;               \
    asset total_unconfirmed_transfered_amount;             \
    uint16_t total_confirmed_transfers;                    \
    uint16_t total_unconfirmed_transfers;                  \
                                                           \
    string subscription_package;                           \
    uint64_t status;                                       \
    name approved_by;                                      \
    uint64_t approved_date;                                \
    uint64_t investment_date;                              \
                                                           \
    uint64_t primary_key() const { return investment_id; } \
    uint64_t by_user() const { return user.value; }        \
    uint64_t by_status() const { return status; }          \
    uint64_t by_projectid() const { return project_id; }   \
  };

#define DEFINE_INVESTMENT_TABLE_MULTI_INDEX                                                                          \
  typedef eosio::multi_index<"investments"_n, investment_table,                                                      \
                             indexed_by<"byuser"_n,                                                                  \
                                        const_mem_fun<investment_table, uint64_t, &investment_table::by_user>>,      \
                             indexed_by<"bystatus"_n,                                                                \
                                        const_mem_fun<investment_table, uint64_t, &investment_table::by_status>>,    \
                             indexed_by<"byprojectid"_n,                                                             \
                                        const_mem_fun<investment_table, uint64_t, &investment_table::by_projectid>>> \
      investment_tables;
