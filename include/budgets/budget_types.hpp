#include "../common/constants.hpp"

#include <set>
#include <string>

using namespace std;

class BudgetTypes
{
public:
    const string TOTAL = common::budget::types::total;
    const string ANNUALLY = common::budget::types::annually;
    const string MONTHLY = common::budget::types::monthly;
    const string WEEKLY = common::budget::types::weekly;
    const string DAILY = common::budget::types::daily;
    const string CUSTOM = common::budget::types::custom;

    BudgetTypes()
    {
        constants.insert(TOTAL);
        constants.insert(ANNUALLY);
        constants.insert(MONTHLY);
        constants.insert(WEEKLY);
        constants.insert(DAILY);
        constants.insert(CUSTOM);
    }

    bool is_valid_constant(string constant)
    {
        auto itr = constants.find(constant);
        return (itr != constants.end()) ? true : false;
    }

private:
    set<string> constants;
} BUDGET_TYPES;
