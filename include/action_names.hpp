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
        const name PROJECTS_REMOVE = "deleteprojct"_n;
        const name PROJECTS_EDIT = "editproject"_n;
        const name PERMISSIONS_ADD_PERMISSION = "givepermissn"_n;
        const name PERMISSIONS_REMOVE_PERMISSION = "removeprmssn"_n;
        const name PERMISSIONS_ADD_ROLE = "addrole"_n;
        const name PERMISSIONS_REMOVE_ROLE = "removerole"_n;
        const name PERMISSIONS_ASSIGN = "assignrole"_n;
        const name BUDGETS_ADD = "addbudget"_n;
        const name BUDGETS_REMOVE = "editbudget"_n;
        const name BUDGETS_EDIT = "deletebudget"_n;
        const name BUDGETS_RECALCULATE = "rcalcbudgets"_n;

        ActionNames () {
            constants.insert(ACCOUNTS_ADD);
            constants.insert(ACCOUNTS_REMOVE);
            constants.insert(ACCOUNTS_EDIT);
            constants.insert(TRANSACTIONS_ADD);
            constants.insert(TRANSACTIONS_REMOVE);
            constants.insert(TRANSACTIONS_EDIT);
            constants.insert(PERMISSIONS_ADD_PERMISSION);
            constants.insert(PERMISSIONS_REMOVE_PERMISSION);
            constants.insert(PERMISSIONS_ADD_ROLE);
            constants.insert(PERMISSIONS_REMOVE_ROLE);
            constants.insert(PERMISSIONS_ASSIGN);
            constants.insert(BUDGETS_ADD);
            constants.insert(BUDGETS_REMOVE);
            constants.insert(BUDGETS_EDIT);
            constants.insert(BUDGETS_RECALCULATE);
        }

        bool is_valid_constant (name constant) {
            auto itr = constants.find(constant);
            return (itr != constants.end()) ? true : false;
        }
    private:
        set<name> constants;
} ACTION_NAMES;
