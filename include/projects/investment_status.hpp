#include <set>
#include <string>

using namespace std;

class InvestmentStatus {
    public:
        const uint8_t PENDING = 1; // "Pending"
        const uint8_t FUNDING = 2; // "Funding"
        const uint8_t FUNDED = 3; // "Funded"

        InvestmentStatus () {
            constants.insert(PENDING);
            constants.insert(FUNDING);
            constants.insert(FUNDED);
        }

        bool is_valid_constant (uint8_t constant) {
            auto itr = constants.find(constant);
            return (itr != constants.end()) ? true : false;
        }
    private:
        set<uint8_t> constants;
} INVESTMENT_STATUS;
