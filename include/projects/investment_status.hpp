#include "../common/constants.hpp"

#include <set>
#include <string>

using namespace std;

class InvestmentStatus
{
public:
    const uint8_t PENDING = common::projects::investment::pending;
    const uint8_t FUNDING = common::projects::investment::funding;
    const uint8_t FUNDED = common::projects::investment::funded;

    InvestmentStatus()
    {
        constants.insert(PENDING);
        constants.insert(FUNDING);
        constants.insert(FUNDED);
    }

    bool is_valid_constant(uint8_t constant)
    {
        auto itr = constants.find(constant);
        return (itr != constants.end()) ? true : false;
    }

private:
    set<uint8_t> constants;
} INVESTMENT_STATUS;
