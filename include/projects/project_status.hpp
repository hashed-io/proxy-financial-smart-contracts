#include <set>
#include <string>

using namespace std;

class ProjectStatus
{
public:
    const uint8_t AWAITING_FUND_APPROVAL = common::projects::status::awaiting_fund_approval;
    const uint8_t READY_FOR_INVESTMENT = common::projects::status::ready_for_investment;
    const uint8_t INVESTMENT_GOAL_REACHED = common::projects::status::investment_goal_reached;
    const uint8_t COMPLETED = common::projects::status::completed;

    ProjectStatus()
    {
        constants.insert(AWAITING_FUND_APPROVAL);
        constants.insert(READY_FOR_INVESTMENT);
        constants.insert(INVESTMENT_GOAL_REACHED);
        constants.insert(COMPLETED);
    }

    bool is_valid_constant(uint8_t constant)
    {
        auto itr = constants.find(constant);
        return (itr != constants.end()) ? true : false;
    }

private:
    set<uint8_t> constants;
} PROJECT_STATUS;