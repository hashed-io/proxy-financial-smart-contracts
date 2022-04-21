#include <../common/constants.hpp>

#include <set>
#include <string>

using namespace std;

class DrawdownTypes {
    public:
        const string EB5 = "EB-5";
        const string CONSTRUCTION_LOAN = "Construction Loan";
        const string DEVELOPER_EQUITY = "Developer Equity";

        DrawdownTypes () {
            constants.insert(EB5);
            constants.insert(CONSTRUCTION_LOAN);
            constants.insert(DEVELOPER_EQUITY);
        }

        bool is_valid_constant (string constant) {
            auto itr = constants.find(constant);
            return (itr != constants.end()) ? true : false;
        }
    private:
        set<string> constants;
} DRAWDOWN_TYPES;
