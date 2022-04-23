#include "../common/constants.hpp"

#include <set>
#include <string>

using namespace std;

class AccountCategories
{
public:
    const uint64_t NONE = common::accouts::categories::none;
    const uint64_t HARD_COST = common::accouts::categories::hard_cost;
    const uint64_t SOFT_COST = common::accouts::categories::soft_cost;

    AccountCategories()
    {
        constants.insert(NONE);
        constants.insert(HARD_COST);
        constants.insert(SOFT_COST);
    }

    bool is_valid_constant(uint64_t constant)
    {
        auto itr = constants.find(constant);
        return (itr != constants.end()) ? true : false;
    }

private:
    set<uint64_t> constants;
} ACCOUNT_CATEGORIES;
