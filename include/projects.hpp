#pragma once

#include <eosio/eosio.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
#include <common.hpp>
#include <account_types.hpp>
#include <account_subtypes.hpp>
#include <project_status.hpp>
#include <user_types.hpp>
#include <investment_status.hpp>
#include <project_class.hpp>
#include <transfer_status.hpp>

using namespace eosio;
using namespace std;

CONTRACT projects : public contract {

    public:

        using contract::contract;
        projects(name receiver, name code, datastream<const char*> ds)
            : contract(receiver, code, ds),
              projects_table(receiver, receiver.value),
              users(receiver, receiver.value),
              investors(receiver, receiver.value),
              developers(receiver, receiver.value),
              funds(receiver, receiver.value),
              investments(receiver, receiver.value),
              transfers(receiver, receiver.value)
              {}

        ACTION reset ();

        ACTION addproject ( name actor,
                            string project_class,
                            string project_name,
                            string description,
                            asset total_project_cost,
                            asset debt_financing,
                            uint8_t term,
                            uint16_t interest_rate,
                            string loan_agreement, // url
                            asset total_equity_financing,
                            asset total_gp_equity,
                            asset private_equity,
                            uint16_t annual_return,
                            string project_co_lp, // url
                            uint64_t project_co_lp_date,
                            uint64_t projected_completion_date,
                            uint64_t projected_stabilization_date,
                            uint64_t anticipated_year_sale_refinance );

        ACTION editproject ( name actor,
                             uint64_t project_id,
                             string project_class,
                             string project_name,
                             string description,
                             asset total_project_cost,
                             asset debt_financing,
                             uint8_t term,
                             uint16_t interest_rate,
                             string loan_agreement, // url
                             asset total_equity_financing,
                             asset total_gp_equity,
                             asset private_equity,
                             uint16_t annual_return,
                             string project_co_lp, // url
                             uint64_t project_co_lp_date,
                             uint64_t projected_completion_date,
                             uint64_t projected_stabilization_date,
                             uint64_t anticipated_year_sale_refinance );

        ACTION deleteprojct (name actor, uint64_t project_id);

        ACTION checkuserdev (name user);

        ACTION addtestuser (name user, string user_name, string type);

        ACTION approveprjct ( name actor, 
							  uint64_t project_id, 
							  string fund_lp,
						      asset total_fund_offering_amount,
							  uint64_t total_number_fund_offering,
							  asset price_per_fund_unit );

        ACTION invest ( name actor, 
						uint64_t project_id, 
                        asset total_investment_amount,
                        uint64_t quantity_units_purchased,
                        uint16_t annual_preferred_return,
                        uint64_t signed_agreement_date,
                        string file );

        ACTION editinvest ( name actor, 
							uint64_t investment_id,
                            asset total_investment_amount,
                            uint64_t quantity_units_purchased,
                            uint16_t annual_preferred_return,
                            uint64_t signed_agreement_date,
                            string file );

        ACTION deleteinvest (name actor, uint64_t investment_id);

        ACTION approveinvst (name actor, uint64_t investment_id);

        ACTION maketransfer (name actor, asset amount, uint64_t investment_id, string proof_of_transfer, uint64_t date);

        ACTION edittransfer ( name actor, 
						      uint64_t transfer_id,
                              asset amount, 
                              string proof_of_transfer, 
                              uint64_t date );

        ACTION deletetrnsfr (name actor, uint64_t transfer_id);

        ACTION confrmtrnsfr (name actor, uint64_t transfer_id, string proof_of_transfer);


    private:

        TABLE project_table {
			uint64_t project_id;
            uint64_t developer_id;
			name owner;
            string project_class;
            string project_name;
			string description;
            uint64_t created_date;
            uint64_t status;

            asset total_project_cost;
            asset debt_financing;
            uint8_t term;
            uint16_t interest_rate; // decimal 2
            string loan_agreement; // url

			asset total_equity_financing;
            asset total_gp_equity;
            asset private_equity;
            uint16_t annual_return; // decimal 2
            string project_co_lp; // url
            uint64_t project_co_lp_date;

            uint64_t projected_completion_date;
            uint64_t projected_stabilization_date;
            uint64_t anticipated_year_sale_refinance;

            string fund_lp; // url
            asset total_fund_offering_amount;
            uint64_t total_number_fund_offering;
            asset price_per_fund_unit;
            uint64_t approved_date;
            name approved_by;

			uint64_t primary_key() const { return project_id; }
            uint64_t by_owner() const { return owner.value; }
            uint64_t by_developer() const { return developer_id; }
            uint64_t by_status() const { return status; }
		};

        TABLE user_table {
            name account;
            string user_name;
            uint64_t entity_id;
            string type;

            uint64_t primary_key() const { return account.value; }
        };

        TABLE investor_table {
            uint64_t investor_id;
            string description;

            uint64_t primary_key() const { return investor_id; }
        };

        TABLE developer_table {
            uint64_t developer_id;
            string developer_name;
            string description;

            uint64_t primary_key() const { return developer_id; }
        };

        TABLE fund_table {
            uint64_t fund_id;
            string fund_name;
            string description;

            uint64_t primary_key() const { return fund_id; }
        };

        TABLE investment_table {
            uint64_t investment_id;
            name user;
            uint64_t project_id;
            asset total_investment_amount;
            uint64_t quantity_units_purchased; // decimal?
            uint16_t annual_preferred_return; // decimal
            uint64_t signed_agreement_date;

            asset total_confirmed_transfered_amount;
            asset total_unconfirmed_transfered_amount;
            uint16_t total_confirmed_transfers;
            uint16_t total_unconfirmed_transfers;

            string subscription_package;
            uint64_t status;
            name approved_by;
            uint64_t approved_date;
            uint64_t investment_date;

            uint64_t primary_key() const { return investment_id; }
            uint64_t by_user() const { return user.value; }
            uint64_t by_status() const { return status; }
            uint64_t by_projectid() const { return project_id; }
        };

        TABLE fund_transfer_table {
            uint64_t fund_transfer_id;
            string proof_of_transfer;
            asset amount;
            uint64_t investment_id;
            name user;
            uint64_t status;
            uint64_t transfer_date;
            uint64_t updated_date;
            uint64_t confirmed_date;
            name confirmed_by;

            uint64_t primary_key() const { return fund_transfer_id; }
            uint64_t by_investment() const { return investment_id; }
            uint64_t by_status() const { return status; }
        };



        typedef eosio::multi_index <"projects"_n, project_table,
            indexed_by<"byowner"_n,
            const_mem_fun<project_table, uint64_t, &project_table::by_owner>>,
            indexed_by<"bydeveloper"_n,
            const_mem_fun<project_table, uint64_t, &project_table::by_developer>>,
            indexed_by<"bystatus"_n,
            const_mem_fun<project_table, uint64_t, &project_table::by_status>>
        > project_tables;

        typedef eosio::multi_index <"users"_n, user_table> user_tables;

        typedef eosio::multi_index <"investors"_n, investor_table> investor_tables;

        typedef eosio::multi_index <"developers"_n, developer_table> developer_tables;

        typedef eosio::multi_index <"funds"_n, fund_table> fund_tables;

        typedef eosio::multi_index <"investments"_n, investment_table,
            indexed_by<"byuser"_n,
            const_mem_fun<investment_table, uint64_t, &investment_table::by_user>>,
            indexed_by<"bystatus"_n,
            const_mem_fun<investment_table, uint64_t, &investment_table::by_status>>,
            indexed_by<"byprojectid"_n,
            const_mem_fun<investment_table, uint64_t, &investment_table::by_projectid>>
        > investment_tables;

        typedef eosio::multi_index <"transfers"_n, fund_transfer_table,
            indexed_by<"byinvestment"_n,
            const_mem_fun<fund_transfer_table, uint64_t, &fund_transfer_table::by_investment>>,
            indexed_by<"bystatus"_n,
            const_mem_fun<fund_transfer_table, uint64_t, &fund_transfer_table::by_status>>
        > fund_transfer_tables;


        project_tables projects_table;
        user_tables users;
        investor_tables investors;
        developer_tables developers;
        fund_tables funds;
        investment_tables investments;
        fund_transfer_tables transfers;

        void checkusrtype (name user, string type);
        void delete_transfer_aux (uint64_t transfer_id);

};

