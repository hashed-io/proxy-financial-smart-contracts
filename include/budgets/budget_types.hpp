#include <set>
#include <string>

using namespace std;

class BudgetTypes {
    public:
        const string TOTAL = "Total";
        const string ANNUALLY = "Annually";
        const string MONTHLY = "Monthly";
        const string WEEKLY = "Weekly";
        const string DAILY = "Daily";
        const string CUSTOM = "Custom";

        BudgetTypes () {
            constants.insert(TOTAL);
            constants.insert(ANNUALLY);
            constants.insert(MONTHLY);
            constants.insert(WEEKLY);
            constants.insert(DAILY);
            constants.insert(CUSTOM);
        }

        bool is_valid_constant (string constant) {
            auto itr = constants.find(constant);
            return (itr != constants.end()) ? true : false;
        }
    private:
        set<string> constants;
} BUDGET_TYPES;
