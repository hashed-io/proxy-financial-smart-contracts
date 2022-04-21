using namespace eosio;

TABLE type_table
{
  uint64_t type_id;
  std::string type_name;
  std::string account_class;

  uint64_t primary_key() const { return type_id; }
};

typedef eosio::multi_index<"accnttypes"_n, type_table> type_tables;