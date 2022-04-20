#include <set>
#include <string>

using namespace std;

class AccountCategories {
    public:
        const uint64_t NONE = 1;
        const uint64_t HARD_COST = 2;
        const uint64_t SOFT_COST = 3;

        AccountCategories () {
            constants.insert(NONE);
            constants.insert(HARD_COST);
            constants.insert(SOFT_COST);
        }

        bool is_valid_constant (uint64_t constant) {
            auto itr = constants.find(constant);
            return (itr != constants.end()) ? true : false;
        }
    private:
        set<uint64_t> constants;
} ACCOUNT_CATEGORIES;
