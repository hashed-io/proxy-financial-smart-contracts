#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <set>

#include <common/constants.hpp>

using namespace eosio;
using namespace std;

void check_asset(asset amount, name contract_name)
{
	check(amount.symbol == common::currency, contract_name.to_string() + ": the symbols must be the same. " + amount.to_string() + ". amount symbol:" + amount.symbol.code().to_string() + "!=" + common::currency.code().to_string());
	check(amount >= asset(0, common::currency), contract_name.to_string() + ": the amount must be greater than zero.");
}

uint64_t get_valid_index(uint64_t index)
{
	return (index > 0) ? index : 1;
}

// void check_user_ledger (name user, uint64_t project_id, uint64_t ledger_id) {
//     auto itr_user = users.find(user.value);
//     check(itr_user != users.end(), contract_names::accounts.to_string() + ": the user does not exist.");

//     ledger_tables ledgers(_self, project_id);
//     auto itr_ledger = ledgers.find(ledger_id);
//     check(itr_ledger != ledgers.end(), contract_names::accounts.to_string() + ": the ledger does not exist.");

//     check(itr_user -> entity_id == itr_ledger -> entity_id, contract_names::accounts.to_string() + ": this user can not modify this ledger.");
// }
