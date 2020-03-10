#include <set>
#include <string>

using namespace std;

class InvestmentStatus {
    public:
        const string PENDING = "Pending";
        const string FUNDING = "Funding";
        const string FUNDED = "Funded";

        InvestmentStatus () {
            constants.insert(PENDING);
            constants.insert(FUNDING);
            constants.insert(FUNDED);
        }

        bool is_valid_constant (string constant) {
            auto itr = constants.find(constant);
            return (itr != constants.end()) ? true : false;
        }
    private:
        set<string> constants;
} INVESTMENT_STATUS;
