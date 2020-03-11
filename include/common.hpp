#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <set>

using namespace eosio;

const symbol CURRENCY = symbol("USD", 2);
const uint32_t RESET_IDS = 100;

namespace contract_names {
    name projects = "proxycapprjt"_n;
    name accounts = "proxycapaccn"_n;
    name transactions = "proxycaptrxn"_n;
    name permissions = "proxycapprms"_n;
    name contracts = "proxycapcont"_n;
}

void check_asset(asset amount, name contract_name) {
	check(amount.symbol == CURRENCY, contract_name.to_string() + ": the symbols must be the same.");
	check(amount > asset(0, CURRENCY), contract_name.to_string() + ": the amount must be greater than zero.");
}
