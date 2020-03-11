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

        ACTION approveinvst (name actor, uint64_t investment_id);

        ACTION maketransfer (name actor, asset amount, uint64_t investment_id, string file, uint64_t date);

        
        // ACTION removeprojct ();

        // ACTION editproject ();

        // actions:

        //  adduser? (done)
        //  addproject (done)
        //  invest (done)
        //  make_investment_transfer (doing)
        //  approve_investment (done)
        //  approve_project (done)


    private:

        TABLE project_table {
			uint64_t project_id;
			name owner; // who is a project owner?
            string project_name;
			string description;
            uint64_t created_date;
            string status;

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
            uint64_t anticipated_year_sale;

            string fund_lp; // url
            asset total_fund_offering_amount;
            uint64_t total_number_fund_offering; // decimal 2
            asset price_per_fund_unit;
            uint64_t approved_date;
            name approved_by;

			uint64_t primary_key() const { return project_id; }
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

            string file;
            string status;
            name approved_by;
            uint64_t approved_date;
            uint64_t investment_date;

            uint64_t primary_key() const { return investment_id; }
            uint64_t by_user() const { return user.value; }
        };

        TABLE fund_transfer_table {
            uint64_t fund_transfer_id;
            string file;
            asset amount;
            uint64_t investment_id;
            name user;
            uint64_t date;

            uint64_t primary_key() const { return fund_transfer_id; }
            uint64_t by_investment() const { return investment_id; }
        };



        typedef eosio::multi_index <"projects"_n, project_table> project_tables;

        typedef eosio::multi_index <"users"_n, user_table> user_tables;

        typedef eosio::multi_index <"investors"_n, investor_table> investor_tables;

        typedef eosio::multi_index <"developers"_n, developer_table> developer_tables;

        typedef eosio::multi_index <"funds"_n, fund_table> fund_tables;

        typedef eosio::multi_index <"investments"_n, investment_table,
            indexed_by<"byuser"_n,
            const_mem_fun<investment_table, uint64_t, &investment_table::by_user>>
        > investment_tables;

        typedef eosio::multi_index <"transfers"_n, fund_transfer_table,
            indexed_by<"byinvestment"_n,
            const_mem_fun<fund_transfer_table, uint64_t, &fund_transfer_table::by_investment>>
        > fund_transfer_tables;


        project_tables projects_table;
        user_tables users;
        investor_tables investors;
        developer_tables developers;
        fund_tables funds;
        investment_tables investments;
        fund_transfer_tables transfers;

        void checkusrtype (name user, string type);

};


// users:
// account
// name
// entity_id
// type (investor, developer, fund)


// investors
// id
// 


// devepoler:
// id
// name


// investments:
// user
// project_id
// file
// status (pendding, funding, funded)
// approved_by
// approved_date
// investment_date


// fund_transfers
// file
// amount
// investment_id
// user
// timestamp


// actions:
//  addproject
//  invest
//  make_investment_transfer
//  approve_investment
//  approve_project
