#include <set>
#include <string>

using namespace std;

class AccountSubtypes {
    public:
        const string ASSETS = "Assets";
        const string EQUITY = "Equity";
        const string EXPENSES = "Expenses";
        const string INCOME = "Income";
        const string LIABILITIES = "Liabilities";

        AccountSubtypes () {
            constants.insert(ASSETS);
            constants.insert(EQUITY);
            constants.insert(EXPENSES);
            constants.insert(INCOME);
            constants.insert(LIABILITIES);
        }

        bool is_valid_constant (string constant) {
            auto itr = constants.find(constant);
            return (itr != constants.end()) ? true : false;
        }
    private:
        set<string> constants;
} ACCOUNT_SUBTYPES;