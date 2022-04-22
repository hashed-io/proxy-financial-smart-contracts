#include "../common/constants.hpp"

#include <set>
#include <string>

using namespace std;

class EntityTypes
{
public:
    const string INVESTOR = common::projects::entity::investor;
    const string DEVELOPER = common::projects::entity::developer;
    const string FUND = common::projects::entity::fund;

    EntityTypes()
    {
        constants.insert(INVESTOR);
        constants.insert(DEVELOPER);
        constants.insert(FUND);
    }

    bool is_valid_constant(string constant)
    {
        auto itr = constants.find(constant);
        return (itr != constants.end()) ? true : false;
    }

private:
    set<string> constants;
} ENTITY_TYPES;
