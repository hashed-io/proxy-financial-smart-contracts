#include <set>
#include <string>

using namespace std;

class TransferStatus {
    public:
        const uint8_t AWAITING_CONFIRMATION = 1;
        const uint8_t CONFIRMED = 2;

        TransferStatus () {
            constants.insert(AWAITING_CONFIRMATION);
            constants.insert(CONFIRMED);
        }

        bool is_valid_constant (uint8_t constant) {
            auto itr = constants.find(constant);
            return (itr != constants.end()) ? true : false;
        }
    private:
        set<uint8_t> constants;
} TRANSFER_STATUS;