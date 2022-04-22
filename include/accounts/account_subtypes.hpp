#include "../common/constants.hpp"

#include <set>
#include <string>

using namespace std;

class AccountSubtypes
{
public:
    const string ASSETS = common::accouts::subtypes::assets;
    const string EQUITY = common::accouts::subtypes::equity;
    const string EXPENSES = common::accouts::subtypes::expenses;
    const string INCOME = common::accouts::subtypes::income;
    const string LIABILITIES = common::accouts::subtypes::liabilities;

    AccountSubtypes()
    {
        constants.insert(ASSETS);
        constants.insert(EQUITY);
        constants.insert(EXPENSES);
        constants.insert(INCOME);
        constants.insert(LIABILITIES);
    }

    bool is_valid_constant(string constant)
    {
        auto itr = constants.find(constant);
        return (itr != constants.end()) ? true : false;
    }

private:
    set<string> constants;
} ACCOUNT_SUBTYPES;