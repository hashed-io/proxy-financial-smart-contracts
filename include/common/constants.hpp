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
    constexpr eosio::name projects = "pxprj.sh"_n;
    constexpr eosio::name accounts = "pxact.sh"_n;
    constexpr eosio::name transactions = "pxtrx.sh"_n;
    constexpr eosio::name permissions = "pxperm.sh"_n;
    constexpr eosio::name budgets = "pxbud.sh"_n;

    // TESTNET CONTRACTS
    // constexpr eosio::name projects = "proxycappro1"_n;
    // constexpr eosio::name accounts = "proxycapacc1"_n;
    // constexpr eosio::name transactions = "proxycaptrx1"_n;
    // constexpr eosio::name permissions = "proxycapper1"_n;
    // constexpr eosio::name budgets = "proxycapbdg1"_n;
    
    // TESTNET CONTRACTS (NEW)
    // constexpr eosio::name projects = "proxyv1prjct"_n;
    // constexpr eosio::name accounts = "proxyv1accnt"_n;
    // constexpr eosio::name transactions = "proxyv1trnsc"_n;
    // constexpr eosio::name permissions = "proxyv1prmss"_n;
    // constexpr eosio::name budgets = "proxyv1bdgts"_n;
    //
  } // namespace contracts

  namespace transactions
  {
    namespace drawdown
    {
      constexpr int64_t status_open = 1;
      constexpr int64_t status_close = 2;

      const std::string type_EB5 = "EB-5";
      const std::string type_construction_loan = "Construction Loan";
      const std::string type_developer_equity = "Developer Equity";
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
      const std::string investor = "Investor";
      const std::string developer = "Developer";
      const std::string fund = "Fund";
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