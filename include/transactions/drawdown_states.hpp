#include "../common/constants.hpp"

#include <set>
#include <string>

using namespace std;

class DrawdownStates
{
public:
    const uint64_t OPEN = common::transactions::drawdown::status_open;
    const uint64_t CLOSE = common::transactions::drawdown::status_close;

    DrawdownStates()
    {
        constants.insert(OPEN);
        constants.insert(CLOSE);
    }

    bool is_valid_constant(uint64_t constant)
    {
        auto itr = constants.find(constant);
        return (itr != constants.end()) ? true : false;
    }

private:
    set<uint64_t> constants;
} DRAWDOWN_STATES;
