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

      constexpr std::string type_EB5 = "EB-5";
      constexpr std::string type_construction_loan = "Construction Loan";
      constexpr std::string type_developer_equity = "Developer Equity";
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
      constexpr std::string debit = "Debit";
      constexpr std::string credit = "Credit";
    } // namespace types

    namespace subtypes
    {
      constexpr std::string assets = "Assets";
      constexpr std::string equity = "Equity";
      constexpr std::string expenses = "Expenses";
      constexpr std::string income = "Income";
      constexpr std::string liabilities = "Liabilities";
    } // namespace subtypes

  } // namespace accouts

  namespace budget
  {
    namespace types
    {
      constexpr std::string total = "Total";
      constexpr std::string annually = "Annually";
      constexpr std::string monthly = "Monthly";
      constexpr std::string weekly = "Weekly";
      constexpr std::string daily = "Daily";
      constexpr std::string custom = "Custom";
    } // namespace types

  } // namespace budget

  namespace projects
  {
    namespace class
    {
      constexpr std::string nnn = "NNN";
      constexpr std::string multifamily = "MULTIFAMILY";
      constexpr std::string office = "OFFICE";
      constexpr std::string industrial = "INDUSTRIAL";
      constexpr std::string master_planned_community = "MASTER PLANNED COMMUNITY";
      constexpr std::string medical = "MEDICAL";
      constexpr std::string hotel = "HOTEL";
    } // namespace class

    namespace status
    {
      constexpr uint8_t awaiting_fund_approval = 1;
      constexpr uint8_t ready_for_investment = 2;
      constexpr uint8_t investment_goal_reached = 3;
      constexpr uint8_t completed = 4;
    } // namespace status

    namespace entity
    {
      constexpr std::string investor = "Investor";
      constexpr std::string developer = "Developer";
      constexpr std::string fund = "Fund";
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
      constexpr std::string owner = "Owner";
      constexpr std::string manager = "Manager";
      constexpr std::string accountant = "Accountant";
    } // namespace roles

  } // namespace permissions

} // namespace common