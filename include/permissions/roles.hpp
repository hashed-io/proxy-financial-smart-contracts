#include "../common/constants.hpp"

#include <set>
#include <string>

using namespace std;

class Roles
{
public:
    const string OWNER = common::permissions::roles::owner;
    const string MANAGER = common::permissions::roles::manager;
    const string ACCOUNTANT = common::permissions::roles::accountant;

    Roles()
    {
        constants.insert(OWNER);
        constants.insert(MANAGER);
        constants.insert(ACCOUNTANT);
    }

    bool is_valid_constant(string constant)
    {
        auto itr = constants.find(constant);
        return (itr != constants.end()) ? true : false;
    }

private:
    set<string> constants;
} ROLES;
