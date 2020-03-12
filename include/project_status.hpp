#include <set>
#include <string>

using namespace std;

class ProjectStatus {
    public:
        const uint8_t AWAITING_FUND_APPROVAL = 1; // "Awaiting Fund Approval"
        const uint8_t READY_FOR_INVESTMENT = 2; // "Ready for Investment"
        const uint8_t INVESTMENT_GOAL_REACHED = 3; // "Investment Goal Reached"
        const uint8_t COMPLETED = 4; // "Completed"

        ProjectStatus () {
            constants.insert(AWAITING_FUND_APPROVAL);
            constants.insert(READY_FOR_INVESTMENT);
            constants.insert(INVESTMENT_GOAL_REACHED);
            constants.insert(COMPLETED);
        }

        bool is_valid_constant (uint8_t constant) {
            auto itr = constants.find(constant);
            return (itr != constants.end()) ? true : false;
        }
    private:
        set<uint8_t> constants;
} PROJECT_STATUS;