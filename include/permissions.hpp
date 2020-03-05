#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
#include <common.hpp>
#include <account_types.hpp>
#include <account_subtypes.hpp>

using namespace eosio;
using namespace std;

CONTRACT permissions : public contract {

    public:
        using contract::contract;
        permissions(name receiver, name code, datastream<const char*> ds)
            : contract(receiver, code, ds),
              account_types(receiver, receiver.value),
              projects_table(contract_names::projects, contract_names::projects.value)
              {}

        ACTION reset ();
 

    private:

};








