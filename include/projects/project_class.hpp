#include "../common/constants.hpp"

#include <set>
#include <string>

using namespace std;

class ProjectClass
{
public:
    const string NNN = common::projects::type::nnn;
    const string MULTIFAMILY = common::projects::type::multifamily;
    const string OFFICE = common::projects::type::office;
    const string INDUSTRIAL = common::projects::type::industrial;
    const string MASTER_PLANNED_COMMUNITY = common::projects::type::master_planned_community;
    const string MEDICAL = common::projects::type::medical;
    const string HOTEL = common::projects::type::hotel;

    ProjectClass()
    {
        constants.insert(NNN);
        constants.insert(MULTIFAMILY);
        constants.insert(OFFICE);
        constants.insert(INDUSTRIAL);
        constants.insert(MASTER_PLANNED_COMMUNITY);
        constants.insert(MEDICAL);
        constants.insert(HOTEL);
    }

    bool is_valid_constant(string constant)
    {
        auto itr = constants.find(constant);
        return (itr != constants.end()) ? true : false;
    }

private:
    set<string> constants;
} PROJECT_CLASS;
