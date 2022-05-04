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

#include <transactions/drawdown_states.hpp>
#include <transactions/drawdown_types.hpp>

#include <common/tables/account_transaction.hpp>
#include <common/tables/account_type.hpp>

#include <common/tables/account.hpp>
#include <common/tables/transaction.hpp>
#include <common/tables/drawdown.hpp>
#include <common/tables/user.hpp>

#include <common/tables/project.hpp>

#include <utility>
#include <vector>
#include <string>

using namespace eosio;
using namespace std;

CONTRACT transactions : public contract
{

public:
	using contract::contract;
	transactions(name receiver, name code, datastream<const char *> ds)
			: contract(receiver, code, ds),
				projects(common::contracts::projects, common::contracts::projects.value),
				users(common::contracts::projects, common::contracts::projects.value),
				account_types(common::contracts::accounts, common::contracts::accounts.value)

	{
	}

	DEFINE_ACCOUNT_TRANSACTION_TABLE

	DEFINE_ACCOUNT_TRANSACTION_TABLE_MULTI_INDEX

	DEFINE_ACCOUNT_TABLE

	DEFINE_ACCOUNT_TABLE_MULTI_INDEX

	DEFINE_TRANSACTION_TABLE

	DEFINE_TRANSACTION_TABLE_MULTI_INDEX

	DEFINE_PROJECT_TABLE

	DEFINE_PROJECT_TABLE_MULTI_INDEX

	DEFINE_DRAWDOWN_TABLE

	DEFINE_DRAWDOWN_TABLE_MULTI_INDEX

	DEFINE_TYPE_TABLE

	DEFINE_TYPE_TABLE_MULTI_INDEX

	DEFINE_USER_TABLE

	DEFINE_USER_TABLE_MULTI_INDEX

	ACTION reset();

	ACTION transact(name actor,
									uint64_t transaction_id,
									uint64_t project_id,
									vector<common::types::transaction_amount> & amounts,
									uint64_t & date,
									string & description,
									std::string & drawdown_type,
									vector<common::types::transaction_subtypes> & accounting,
									vector<common::types::url_information> & supporting_files);

	ACTION transacts(const eosio::name &actor,
									 const uint64_t &project_id,
									 const uint64_t &drawdown_id,
									 std::vector<common::types::transaction_param> transactions);

	ACTION deltransacts(name actor,
											uint64_t transaction_id,
											std::vector<uint64_t> project_id);

	ACTION deletetrxn(name actor,
										uint64_t project_id,
										uint64_t transaction_id);

	ACTION edittrxn(name actor,
									uint64_t project_id,
									uint64_t transaction_id,
									vector<common::types::transaction_amount> amounts,
									uint64_t date,
									string description,
									std::string & drawdown_type,
									vector<common::types::transaction_subtypes> & accounting,
									vector<common::types::url_information> & supporting_files);

	ACTION deletetrxns(uint64_t project_id);

	ACTION submitdrwdn(name actor,
										 uint64_t project_id,
										 vector<common::types::transaction_subtypes> & accounting,
										 vector<common::types::url_information> files);

	ACTION initdrawdown(const uint64_t &project_id);

	ACTION movedrawdown(const eosio::name &actor,
											const uint64_t &project_id,
											const int64_t &drawdown_id);

	ACTION toggledrdwn(uint64_t project_id,
										 uint64_t drawdown_id);

private:
	account_type_tables account_types;
	project_tables projects;
	user_tables users;

	void delete_transaction(name actor, uint64_t project_id, uint64_t transaction_id);

	void generate_transaction(const eosio::name &actor,
														const uint64_t &project_id,
														const uint64_t &drawdown_id,
														uint64_t transaction_id,
														const uint64_t &date,
														vector<common::types::transaction_amount> amounts,
														const std::string description,
														vector<common::types::url_information> supporting_files);

	void make_transaction(name actor,
												uint64_t transaction_id,
												uint64_t project_id,
												vector<common::types::transaction_amount> & amounts,
												uint64_t & date,
												string & description,
												std::string & drawdown_type,
												vector<common::types::transaction_subtypes> & accounting,
												vector<common::types::url_information> & supporting_files);
};
