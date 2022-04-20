#include <set>
#include <string>

using namespace std;

class DrawdownStates {
    public:
        const uint64_t OPEN = 1;
        const uint64_t CLOSE = 2;

        DrawdownStates () {
            constants.insert(OPEN);
            constants.insert(CLOSE);
        }

        bool is_valid_constant (uint64_t constant) {
            auto itr = constants.find(constant);
            return (itr != constants.end()) ? true : false;
        }
    private:
        set<uint64_t> constants;
} DRAWDOWN_STATES;
