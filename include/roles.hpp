#include <set>
#include <string>

using namespace std;

class Roles {
    public:
        const string OWNER = "Owner";
        const string MANAGER = "Manager";
        const string ACCOUNTANT = "Accountant";

        Roles () {
            constants.insert(OWNER);
            constants.insert(MANAGER);
            constants.insert(ACCOUNTANT);
        }

        bool is_valid_constant (string constant) {
            auto itr = constants.find(constant);
            return (itr != constants.end()) ? true : false;
        }
    private:
        set<string> constants;
} ROLES;
