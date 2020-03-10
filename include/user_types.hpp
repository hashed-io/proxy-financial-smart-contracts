#include <set>
#include <string>

using namespace std;

class UserTypes {
    public:
        const string INVESTOR = "Investor";
        const string DEVELOPER = "Developer";
        const string FUND = "Fund";

        UserTypes () {
            constants.insert(INVESTOR);
            constants.insert(DEVELOPER);
            constants.insert(FUND);
        }

        bool is_valid_constant (string constant) {
            auto itr = constants.find(constant);
            return (itr != constants.end()) ? true : false;
        }
    private:
        set<string> constants;
} USER_TYPES;
