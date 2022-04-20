#include <set>
#include <string>

using namespace std;

class ProjectClass {
    public:
        const string NNN = "NNN";
        const string MULTIFAMILY = "MULTIFAMILY";
        const string OFFICE = "OFFICE";
        const string INDUSTRIAL = "INDUSTRIAL";
        const string MASTER_PLANNED_COMMUNITY = "MASTER PLANNED COMMUNITY";
        const string MEDICAL = "MEDICAL";
        const string HOTEL = "HOTEL";

        ProjectClass () {
            constants.insert(NNN);
            constants.insert(MULTIFAMILY);
            constants.insert(OFFICE);
            constants.insert(INDUSTRIAL);
            constants.insert(MASTER_PLANNED_COMMUNITY);
            constants.insert(MEDICAL);
            constants.insert(HOTEL);
        }

        bool is_valid_constant (string constant) {
            auto itr = constants.find(constant);
            return (itr != constants.end()) ? true : false;
        }
    private:
        set<string> constants;
} PROJECT_CLASS;
