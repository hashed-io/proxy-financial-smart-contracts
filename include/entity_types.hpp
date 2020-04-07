#include <set>
#include <string>

using namespace std;

class EntityTypes {
    public:
        const string INVESTOR = "Investor";
        const string DEVELOPER = "Developer";
        const string FUND = "Fund";

        EntityTypes () {
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
} ENTITY_TYPES;
