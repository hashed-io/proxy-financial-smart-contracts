using namespace eosio;

#define DEFINE_PROJECT_TABLE                               \
  TABLE project_table                                      \
  {                                                        \
    uint64_t project_id;                                   \
    uint64_t developer_id;                                 \
                                                           \
    eosio::name owner; /* who is a project owner? */       \
    eosio::name builder;                                   \
    vector<eosio::name> investors;                         \
    eosio::name issuer;                                    \
    eosio::name regional_center;                           \
                                                           \
    std::string project_name;                              \
    std::string description;                               \
    std::string image; /* CID*/                            \
                                                           \
    uint64_t created_date;                                 \
    uint64_t close_date;                                   \
    uint64_t status;                                       \
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