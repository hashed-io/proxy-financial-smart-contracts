#pragma once

#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>

#include <common/constants.hpp>
#include <common/data_types.hpp>
#include <common/action_names.hpp>

#include <util.hpp>

#include <accounts/account_types.hpp>
#include <accounts/account_subtypes.hpp>
#include <accounts/account_categories.hpp>

#include <budgets/budget_types.hpp>

#include <common/tables/account.hpp>
#include <common/tables/account_type.hpp>
#include <common/tables/ledger.hpp>
#include <common/tables/project.hpp>
#include <common/tables/user.hpp>
#include <common/tables/entity.hpp>
#include <common/tables/budget.hpp>

using namespace eosio;
using namespace std;

CONTRACT accounts : public contract
{

public:
    using contract::contract;
    accounts(name receiver, name code, datastream<const char *> ds)
        : contract(receiver, code, ds),
          account_types(receiver, receiver.value),
          projects_table(common::contracts::projects, common::contracts::projects.value),
          users(common::contracts::projects, common::contracts::projects.value),
          entities(common::contracts::projects, common::contracts::projects.value)
    {
    }

    DEFINE_ACCOUNT_TABLE

    DEFINE_ACCOUNT_TABLE_MULTI_INDEX

    DEFINE_BUDGET_TABLE

    DEFINE_BUDGET_TABLE_MULTI_INDEX

    DEFINE_ENTITY_TABLE

    DEFINE_ENTITY_TABLE_MULTI_INDEX

    DEFINE_LEDGER_TABLE

    DEFINE_LEDGER_TABLE_MULTI_INDEX

    DEFINE_PROJECT_TABLE

    DEFINE_PROJECT_TABLE_MULTI_INDEX

    DEFINE_USER_TABLE

    DEFINE_USER_TABLE_MULTI_INDEX

    DEFINE_TYPE_TABLE

    DEFINE_TYPE_TABLE_MULTI_INDEX

    ACTION reset();

    ACTION init();

    ACTION addledger(const uint64_t &project_id,
                     const uint64_t &entity_id);

    ACTION initaccounts(const uint64_t &project_id);

    ACTION addaccount(const eosio::name &actor,
                      const uint64_t &project_id,
                      const std::string &account_name,
                      const uint64_t &parent_id,
                      const eosio::symbol &account_currency,
                      const std::string &description,
                      const uint64_t &account_category,
                      const eosio::asset &budget_amount,
                      const uint64_t &naics_code,
                      const uint64_t &jobs_multiplier);

    ACTION editaccount(const eosio::name &actor,
                       const uint64_t &project_id,
                       const uint64_t &account_id,
                       const std::string &account_name,
                       const std::string &description,
                       const uint64_t &account_category,
                       const eosio::asset &budget_amount,
                       const uint64_t &naics_code,
                       const uint64_t &jobs_multiplier);

    ACTION deleteaccnt(const eosio::name &actor,
                       const uint64_t &project_id,
                       const uint64_t &account_id);

    ACTION addbalance(const uint64_t &project_id,
                      const uint64_t &account_id,
                      const eosio::asset &amount);

    ACTION subbalance(const uint64_t &project_id,
                      const uint64_t &account_id,
                      const eosio::asset &amount);

    ACTION canceladd(const uint64_t &project_id,
                     const uint64_t &account_id,
                     const eosio::asset &amount);

    ACTION cancelsub(const uint64_t &project_id,
                     const uint64_t &account_id,
                     const eosio::asset &amount);

    ACTION deleteaccnts(const uint64_t &project_id);

private:
    const vector<std::string> hard_cost_accounts = {
        common::accouts::subtypes::hardcost::construction,
        common::accouts::subtypes::hardcost::furniture_fixtures_allowance,
        common::accouts::subtypes::hardcost::hard_cost_contingency_allowance};

    const vector<std::string> soft_cost_accounts = {
        common::accouts::subtypes::softcost::architect_design,
        common::accouts::subtypes::softcost::building_permits_impact_fees,
        common::accouts::subtypes::softcost::developer_reimbursable,
        common::accouts::subtypes::softcost::builder_risk_insurance,
        common::accouts::subtypes::softcost::environment_soils_survey,
        common::accouts::subtypes::softcost::testing_inspections,
        common::accouts::subtypes::softcost::legal_professional,
        common::accouts::subtypes::softcost::real_estate_taxes_owners_liability_insurance,
        common::accouts::subtypes::softcost::predevelopment_fee,
        common::accouts::subtypes::softcost::equity_management_fee,
        common::accouts::subtypes::softcost::bank_origination_fee,
        common::accouts::subtypes::softcost::lender_debt_placement_fee,
        common::accouts::subtypes::softcost::title_appraisal_feasibility_plan_review_closing,
        common::accouts::subtypes::softcost::interest_carry_during_construction,
        common::accouts::subtypes::softcost::ops_stabilization_interest_carry_reserve,
        common::accouts::subtypes::softcost::sales_marketing,
        common::accouts::subtypes::softcost::preopening_expenses,
        common::accouts::subtypes::softcost::contingency};

    const vector<pair<std::string, std::string>> account_types_v = {
        make_pair(ACCOUNT_SUBTYPES.ASSETS, ACCOUNT_TYPES.DEBIT),
        make_pair(ACCOUNT_SUBTYPES.EQUITY, ACCOUNT_TYPES.CREDIT),
        make_pair(ACCOUNT_SUBTYPES.EXPENSES, ACCOUNT_TYPES.DEBIT),
        make_pair(ACCOUNT_SUBTYPES.INCOME, ACCOUNT_TYPES.CREDIT),
        make_pair(ACCOUNT_SUBTYPES.LIABILITIES, ACCOUNT_TYPES.CREDIT)};

    const vector<std::string> ledger_v = {
        "Developer ledger",
        "Fund ledger"};

    account_type_tables account_types;
    project_tables projects_table;
    user_tables users;
    entity_tables entities;

    void change_balance(const uint64_t &project_id,
                        const uint64_t &account_id,
                        const asset &amount,
                        const bool &increase,
                        const bool &cancel);

    void add_account(const uint64_t &entity_id,
                     const uint64_t &project_id,
                     const std::string &account_name,
                     const uint64_t &parent_id,
                     const eosio::symbol &account_currency,
                     const std::string &description,
                     const uint64_t &account_category,
                     const eosio::asset &budget_amount);
};
