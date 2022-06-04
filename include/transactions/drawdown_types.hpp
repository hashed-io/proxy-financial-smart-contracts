#include "../common/constants.hpp"

#include <set>
#include <string>

using namespace std;

class DrawdownTypes
{
public:
    const string EB5 = common::transactions::drawdown::type_EB5;
    const string CONSTRUCTION_LOAN = common::transactions::drawdown::type_construction_loan;
    const string DEVELOPER_EQUITY = common::transactions::drawdown::type_developer_equity;

    DrawdownTypes()
    {
        constants.insert(EB5);
        constants.insert(CONSTRUCTION_LOAN);
        constants.insert(DEVELOPER_EQUITY);
    }

    bool is_valid_constant(string constant)
    {
        auto itr = constants.find(constant);
        return (itr != constants.end()) ? true : false;
    }

private:
    set<string> constants;
} DRAWDOWN_TYPES;
