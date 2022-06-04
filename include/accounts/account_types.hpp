#include "../common/constants.hpp"

#include <set>
#include <string>

using namespace std;

class AccountTypes
{
public:
    const string DEBIT = common::accouts::types::debit;
    const string CREDIT = common::accouts::types::credit;

    AccountTypes()
    {
        constants.insert(DEBIT);
        constants.insert(CREDIT);
    }

    bool is_valid_constant(string constant)
    {
        auto itr = constants.find(constant);
        return (itr != constants.end()) ? true : false;
    }

private:
    set<string> constants;
} ACCOUNT_TYPES;
