#pragma once

#include <eosio/eosio.hpp>

namespace common
{
  const eosio::symbol currency = eosio::symbol("USD", 2);
  const uint32_t reset_ids = 100;
  const int64_t microseconds_per_day = 86400000000;

  namespace contracts
  {
    // MAINNET CONTRACTS
    // constexpr eosio::name projects = "pxprj.sh"_n;
    // constexpr eosio::name accounts = "pxact.sh"_n;
    // constexpr eosio::name transactions = "pxtrx.sh"_n;
    // constexpr eosio::name permissions = "pxperm.sh"_n;
    // constexpr eosio::name budgets = "pxbud.sh"_n;

    // LOCAL CONTRACTS
    // constexpr eosio::name projects = "proxyprj"_n;
    // constexpr eosio::name accounts = "proxyact"_n;
    // constexpr eosio::name transactions = "proxytrx"_n;
    // constexpr eosio::name permissions = "proxyperm"_n;
    // constexpr eosio::name budgets = "proxybud"_n;

    // TESTNET CONTRACTS
    // constexpr eosio::name projects = "proxycappro1"_n;
    // constexpr eosio::name accounts = "proxycapacc1"_n;
    // constexpr eosio::name transactions = "proxycaptrx1"_n;
    // constexpr eosio::name permissions = "proxycapper1"_n;
    // constexpr eosio::name budgets = "proxycapbdg1"_n;

    // TESTNET CONTRACTS (NEW)
    constexpr eosio::name projects = "proxyv1prjct"_n;
    constexpr eosio::name accounts = "proxyv1accnt"_n;
    constexpr eosio::name transactions = "proxyv1trnsc"_n;
    constexpr eosio::name permissions = "proxyv1prmss"_n;
    constexpr eosio::name budgets = "proxyv1bdgts"_n;
    //
  } // namespace contracts

  namespace transactions
  {
    namespace drawdown
    {
      namespace status
      {
        constexpr int64_t daft = 0;
        constexpr int64_t submitted = 1;
        constexpr int64_t reviewed = 2;
        constexpr int64_t approved = 3;
        /* There is no a rejected because rejected dawdowns return to a daft state */
      } // namespace status

      constexpr int64_t status_open = 1;
      constexpr int64_t status_close = 2;

      const std::string type_EB5 = "EB-5";                            // can be only created by contructor and admin
      const std::string type_construction_loan = "Construction Loan"; // created by investors
      const std::string type_developer_equity = "Developer Equity";   // created by investors

      namespace type
      {
        constexpr eosio::name eb5 = "eb5"_n;
        constexpr eosio::name construction_loan = "constrcloan"_n;
        constexpr eosio::name developer_equity = "devequity"_n;
      } // namespace types

    } // namespace drawdown

  } // namespace transactions

  namespace accouts
  {
    namespace categories
    {
      constexpr int64_t none = 1;
      constexpr int64_t hard_cost = 2;
      constexpr int64_t soft_cost = 3;
    } // namespace categories

    namespace types
    {
      const std::string debit = "Debit";
      const std::string credit = "Credit";
    } // namespace types

    namespace subtypes
    {
      const std::string assets = "Assets";
      const std::string equity = "Equity";
      const std::string expenses = "Expenses";
      const std::string income = "Income";
      const std::string liabilities = "Liabilities";

      // new types

      // hard costs
      const std::string construction = "Construction";
      const std::string furniture_fixtures_allowance = "Furniture, Fixtures & Allowance";
      const std::string hard_cost_contingency_allowance = "Hard Cost contingency & Allowance";

      // soft costs
      const std::string architect_design = "Architect & Design";
      const std::string building_permits_impact_fees = "Building Permits & Impact Fees";
      const std::string developer_reimbursable = "Developer Reimbursable";
      const std::string builder_risk_insurance = "Builder Risk Insurance";
      const std::string environment_soils_survey = "Environment / Soils / Survey";
      const std::string testing_inspections = "Testing & Inspections";
      const std::string legal_professional = "Legal & Professional";
      const std::string real_estate_taxes_owners_liability_insurance = "Real Estate Taxes & Owner's Liability Insurance";
      const std::string predevelopment_fee = "Pre - Development Fee";
      const std::string equity_management_fee = "Equity Management Fee";
      const std::string bank_origination_fee = "Bank Origination Fee";
      const std::string lender_debt_placement_fee = "Lender Debt Placement Fee";
      const std::string title_appraisal_feasibility_plan_review_closing = "Title, Appraisal, Feasibility, Plan Review & Closing";
      const std::string interest_carry_during_construction = "Interest Carry during Construction";
      const std::string ops_stabilization_interest_carry_reserve = "Ops Stabilization & Interest Carry Reserve";
      const std::string sales_marketing = "Sales & Marketing";
      const std::string preopening_expenses = "Pre - Opening Expenses";
      const std::string contingency = "Contingency";

    } // namespace subtypes

  } // namespace accouts

  namespace budget
  {
    namespace types
    {
      const std::string total = "Total";
      const std::string annually = "Annually";
      const std::string monthly = "Monthly";
      const std::string weekly = "Weekly";
      const std::string daily = "Daily";
      const std::string custom = "Custom";
    } // namespace types

  } // namespace budget

  namespace projects
  {
    namespace type
    {
      const std::string nnn = "NNN";
      const std::string multifamily = "MULTIFAMILY";
      const std::string office = "OFFICE";
      const std::string industrial = "INDUSTRIAL";
      const std::string master_planned_community = "MASTER PLANNED COMMUNITY";
      const std::string medical = "MEDICAL";
      const std::string hotel = "HOTEL";
    } // namespace type

    namespace status
    {
      constexpr uint8_t awaiting_fund_approval = 1;
      constexpr uint8_t ready_for_investment = 2;
      constexpr uint8_t investment_goal_reached = 3;
      constexpr uint8_t completed = 4;
    } // namespace status

    namespace entity
    {
      constexpr eosio::name investor = "investor"_n;
      constexpr eosio::name developer = "developer"_n;
      constexpr eosio::name fund = "fund"_n;
    } // namespace entity

    namespace investment
    {
      constexpr uint8_t pending = 1;
      constexpr uint8_t funding = 2;
      constexpr uint8_t funded = 3;
    } // namespace investment

    namespace transfer
    {
      constexpr uint8_t awaiting_confirmation = 1;
      constexpr uint8_t confirmed = 2;
    } // namespace transfer

  } // namespace projects

  namespace permissions
  {
    namespace roles
    {
      const std::string owner = "Owner";
      const std::string manager = "Manager";
      const std::string accountant = "Accountant";
    } // namespace roles

  } // namespace permissions

} // namespace common