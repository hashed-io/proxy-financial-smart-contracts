#pragma once

#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>

#include <util.hpp>

#include <common/constants.hpp>
#include <common/data_types.hpp>
#include <common/action_names.hpp>

#include <accounts/account_types.hpp>
#include <accounts/account_subtypes.hpp>

#include <projects/project_status.hpp>
#include <projects/entity_types.hpp>
#include <projects/investment_status.hpp>
#include <projects/project_class.hpp>
#include <projects/transfer_status.hpp>

#include <common/tables/project.hpp>
#include <common/tables/user.hpp>
#include <common/tables/entity.hpp>
#include <common/tables/investment.hpp>
#include <common/tables/fund_transfer.hpp>

using namespace eosio;
using namespace std;

CONTRACT projects : public contract
{

public:
    using contract::contract;
    projects(name receiver, name code, datastream<const char *> ds)
        : contract(receiver, code, ds),
          projects_table(receiver, receiver.value),
          users(receiver, receiver.value),
          entities(receiver, receiver.value),
          investments(receiver, receiver.value),
          transfers(receiver, receiver.value)
    {
    }

    DEFINE_PROJECT_TABLE

    DEFINE_PROJECT_TABLE_MULTI_INDEX

    DEFINE_USER_TABLE

    DEFINE_USER_TABLE_MULTI_INDEX

    DEFINE_ENTITY_TABLE

    DEFINE_ENTITY_TABLE_MULTI_INDEX

    DEFINE_INVESTMENT_TABLE

    DEFINE_INVESTMENT_TABLE_MULTI_INDEX

    DEFINE_FUND_TRANSFER_TABLE

    DEFINE_FUND_TRANSFER_TABLE_MULTI_INDEX

    ACTION reset();

    ACTION resetusers();

    ACTION addproject(const eosio::name & actor,
                      const std::string & project_class,
                      const std::string & project_name,
                      const std::string & description,
                      const eosio::asset & total_project_cost,
                      const eosio::asset & debt_financing,
                      const uint8_t & term,
                      const uint16_t & interest_rate,
                      const std::string & loan_agreement, // url
                      const eosio::asset & total_equity_financing,
                      const eosio::asset & total_gp_equity,
                      const eosio::asset & private_equity,
                      const uint16_t & annual_return,
                      const std::string & project_co_lp, // url
                      const uint64_t & project_co_lp_date,
                      const uint64_t & projected_completion_date,
                      const uint64_t & projected_stabilization_date,
                      const uint64_t & anticipated_year_sale_refinance);

    ACTION editproject(const eosio::name &actor,
                       const uint64_t &project_id,
                       const std::string &project_class,
                       const std::string &project_name,
                       const std::string &description,
                       const eosio::asset &total_project_cost,
                       const eosio::asset &debt_financing,
                       const uint8_t &term,
                       const uint16_t &interest_rate,
                       const std::string &loan_agreement, // url
                       const eosio::asset &total_equity_financing,
                       const eosio::asset &total_gp_equity,
                       const eosio::asset &private_equity,
                       const uint16_t &annual_return,
                       const std::string &project_co_lp, // url
                       const uint64_t &project_co_lp_date,
                       const uint64_t &projected_completion_date,
                       const uint64_t &projected_stabilization_date,
                       const uint64_t &anticipated_year_sale_refinance);

    ACTION deleteprojct(name actor, uint64_t project_id);

    ACTION checkuserdev(name user);

    ACTION addtestuser(name user, string user_name, uint64_t entity_id);

    ACTION addentity(const eosio::name &actor,
                     const std::string &entity_name,
                     const std::string &description,
                     const eosio::name &role);

    ACTION approveprjct(name actor,
                        uint64_t project_id,
                        string fund_lp,
                        asset total_fund_offering_amount,
                        uint64_t total_number_fund_offering,
                        asset price_per_fund_unit);

    ACTION invest(name actor,
                  uint64_t project_id,
                  asset total_investment_amount,
                  uint64_t quantity_units_purchased,
                  uint16_t annual_preferred_return,
                  uint64_t signed_agreement_date,
                  string subscription_package);

    ACTION editinvest(name actor,
                      uint64_t investment_id,
                      asset total_investment_amount,
                      uint64_t quantity_units_purchased,
                      uint16_t annual_preferred_return,
                      uint64_t signed_agreement_date,
                      string subscription_package);

    ACTION deleteinvest(name actor, uint64_t investment_id);

    ACTION approveinvst(name actor, uint64_t investment_id);

    ACTION maketransfer(name actor, asset amount, uint64_t investment_id, string proof_of_transfer, uint64_t transfer_date);

    ACTION edittransfer(name actor,
                        uint64_t transfer_id,
                        asset amount,
                        string proof_of_transfer,
                        uint64_t transfer_date);

    ACTION deletetrnsfr(name actor, uint64_t transfer_id);

    ACTION confrmtrnsfr(name actor, uint64_t transfer_id, string proof_of_transfer);

    ACTION changestatus(uint64_t project_id, uint64_t status);

private:
    project_tables projects_table;
    user_tables users;
    entity_tables entities;
    investment_tables investments;
    fund_transfer_tables transfers;

    void check_user_role(eosio::name user, eosio::name role);
    void delete_transfer_aux(uint64_t transfer_id);
    uint64_t get_user_entity(name actor);
};
