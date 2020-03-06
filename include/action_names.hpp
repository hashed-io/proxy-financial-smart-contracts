#include <set>
#include <string>

using namespace std;

class ActionNames {
    public:
        const name ACCOUNTS_ADD = "addaccount"_n;
        const name ACCOUNTS_REMOVE = "deleteaccnt"_n;
        const name ACCOUNTS_EDIT = "editaccount"_n;
        const name TRANSACTIONS_ADD = "transact"_n;
        const name TRANSACTIONS_REMOVE = "deletetrxn"_n;
        const name TRANSACTIONS_EDIT = "edittrxn"_n;
        const name PROJECTS_REMOVE = "nothing"_n;
        const name PROJECTS_EDIT = "nothing"_n;

        ActionNames () {
            constants.insert(ACCOUNTS_ADD);
            constants.insert(ACCOUNTS_REMOVE);
            constants.insert(ACCOUNTS_EDIT);
            constants.insert(TRANSACTIONS_ADD);
            constants.insert(TRANSACTIONS_REMOVE);
            constants.insert(TRANSACTIONS_EDIT);
        }

        bool is_valid_constant (name constant) {
            auto itr = constants.find(constant);
            return (itr != constants.end()) ? true : false;
        }
    private:
        set<name> constants;
} ACTION_NAMES;
