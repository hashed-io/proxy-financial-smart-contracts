#include "../common/constants.hpp"

#include <set>

using namespace std;

class EntityTypes // its more like a rol
{
public:
    const eosio::name INVESTOR = common::projects::entity::investor;
    const eosio::name DEVELOPER = common::projects::entity::developer;
    const eosio::name FUND = common::projects::entity::fund;

    EntityTypes()
    {
        constants.insert(INVESTOR);
        constants.insert(DEVELOPER);
        constants.insert(FUND);
    }

    bool is_valid_constant(eosio::name constant)
    {
        auto itr = constants.find(constant);
        return (itr != constants.end()) ? true : false;
    }

private:
    set<eosio::name> constants;
} ENTITY_TYPES;
