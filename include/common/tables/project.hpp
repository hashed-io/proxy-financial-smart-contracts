using namespace eosio;

#define DEFINE_PROJECT_TABLE                               \
  TABLE project_table                                      \
  {                                                        \
    uint64_t project_id;                                   \
    uint64_t developer_id;                                 \
    eosio::name owner; /* who is a project owner? */       \
    std::string project_class;                             \
    std::string project_name;                              \
    std::string description;                               \
    uint64_t created_date;                                 \
    uint64_t status;                                       \
    eosio::name builder;                                   \
    vector<eosio::name> investors;                         \
    esoio::name issuer;                           \
    eosio::name regional_center;                   \
                                                           \
    eosio::asset total_project_cost;                       \
    eosio::asset debt_financing;                           \
    uint8_t term;                                          \
    uint16_t interest_rate;     /* decimal 2 */            \
    std::string loan_agreement; /* url */                  \
                                                           \
    eosio::asset total_equity_financing;                   \
    eosio::asset total_gp_equity;                          \
    eosio::asset private_equity;                           \
    uint16_t annual_return;    /* decimal 2 */             \
    std::string project_co_lp; /* url */                   \
    uint64_t project_co_lp_date;                           \
                                                           \
    uint64_t projected_completion_date;                    \
    uint64_t projected_stabilization_date;                 \
    uint64_t anticipated_year_sale_refinance;              \
                                                           \
    std::string fund_lp; /* url */                         \
    eosio::asset total_fund_offering_amount;               \
    uint64_t total_number_fund_offering;                   \
    eosio::asset price_per_fund_unit;                      \
    uint64_t approved_date;                                \
    eosio::name approved_by;                               \
                                                           \
    uint64_t primary_key() const { return project_id; }    \
    uint64_t by_owner() const { return owner.value; }      \
    uint64_t by_developer() const { return developer_id; } \
    uint64_t by_status() const { return status; }          \
  };

#define DEFINE_PROJECT_TABLE_MULTI_INDEX                                                                       \
  typedef eosio::multi_index<"projects"_n, project_table,                                                      \
                             indexed_by<"byowner"_n,                                                           \
                                        const_mem_fun<project_table, uint64_t, &project_table::by_owner>>,     \
                             indexed_by<"bydeveloper"_n,                                                       \
                                        const_mem_fun<project_table, uint64_t, &project_table::by_developer>>, \
                             indexed_by<"bystatus"_n,                                                          \
                                        const_mem_fun<project_table, uint64_t, &project_table::by_status>>>    \
      project_tables;