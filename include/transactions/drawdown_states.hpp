#include "../common/constants.hpp"

#include <set>
#include <string>

using namespace std;

class DrawdownStates
{
public:
    const uint64_t OPEN = common::transactions::drawdown::status_open;
    const uint64_t CLOSE = common::transactions::drawdown::status_close;

    const uint64_t DAFT = common::transactions::drawdown::status::daft;
    const uint64_t SUBMITTED = common::transactions::drawdown::status::submitted;
    const uint64_t REVIEWED = common::transactions::drawdown::status::reviewed;
    const uint64_t APPROVED = common::transactions::drawdown::status::approved;

    DrawdownStates()
    {
        constants.insert(OPEN);
        constants.insert(CLOSE);
        
        constants.insert(DAFT);
        constants.insert(SUBMITTED);
        constants.insert(REVIEWED);
        constants.insert(APPROVED);
    }

    bool is_valid_constant(uint64_t constant)
    {
        auto itr = constants.find(constant);
        return (itr != constants.end()) ? true : false;
    }

private:
    set<uint64_t> constants;
} DRAWDOWN_STATES;
