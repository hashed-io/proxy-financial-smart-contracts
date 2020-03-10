#include <set>
#include <string>

using namespace std;

class ProjectStatus {
    public:
        const string AWAITING_FUND_APPROVAL = "Awaiting Fund Approval";
        const string READY_FOR_INVESTMENT = "Ready for Investment";
        const string INVESTMENT_GOAL_REACHED = "Investment Goal Reached";
        const string COMPLETED = "Completed";

        ProjectStatus () {
            constants.insert(AWAITING_FUND_APPROVAL);
            constants.insert(READY_FOR_INVESTMENT);
            constants.insert(INVESTMENT_GOAL_REACHED);
            constants.insert(COMPLETED);
        }

        bool is_valid_constant (string constant) {
            auto itr = constants.find(constant);
            return (itr != constants.end()) ? true : false;
        }
    private:
        set<string> constants;
} PROJECT_STATUS;