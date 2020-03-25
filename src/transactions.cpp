#include <transactions.hpp>


void transactions::make_transaction ( name & actor,
									  uint64_t transaction_id,
									  uint64_t & project_id, 
									  vector<transaction_amount> & amounts,
									  uint64_t & date,
									  string & description,
									  vector<string> & supporting_urls ) {

	transaction_tables transactions(_self, project_id);
	account_transaction_tables accnttrxns(_self, project_id);

	account_tables accounts(contract_names::accounts, project_id);

	auto itr_amounts = amounts.begin();
	uint64_t trx_id = 0;
	int64_t total = 0;
	name action_accnt;

	if (transaction_id == 0) {
		trx_id = transactions.available_primary_key();
		trx_id = (trx_id > 0) ? trx_id : 1;
	} else {
		trx_id = transaction_id;
	}

	while (itr_amounts != amounts.end()) {
		auto itr_account = accounts.find(itr_amounts -> account_id);
		check(itr_account != accounts.end(), contract_names::transactions.to_string() + ": the account does not exist.");

		accnttrxns.emplace(_self, [&](auto & atrx){
			atrx.accnt_transaction_id = accnttrxns.available_primary_key();
			atrx.transaction_id = trx_id;
			atrx.account_id = itr_amounts -> account_id;
			atrx.amount = itr_amounts -> amount;
		});

		total += itr_amounts -> amount;

		if (itr_amounts -> amount < 0) {
			action_accnt = "subbalance"_n;
		} else {
			action_accnt = "addbalance"_n;
		}

		action (
			permission_level(contract_names::accounts, "active"_n),
			contract_names::accounts,
			action_accnt,
			std::make_tuple(project_id, itr_amounts -> account_id, asset(abs(itr_amounts -> amount), CURRENCY))
		).send();

		itr_amounts++;
	}

	check(total == 0, contract_names::transactions.to_string() + ": the transaction total balance must be zero.");

	transactions.emplace(_self, [&](auto & new_transaction){
		new_transaction.transaction_id = trx_id;
		new_transaction.actor = actor;
		new_transaction.timestamp = date;
		new_transaction.description = description;
		
		for (int i = 0; i < supporting_urls.size(); i++) {
			new_transaction.supporting_urls.push_back(supporting_urls[i]);
		}
	});
	
}

void transactions::delete_transaction (uint64_t project_id, uint64_t transaction_id) {

	transaction_tables transactions(_self, project_id);
	account_transaction_tables accnttrxns(_self, project_id);

	auto itr_trxn = transactions.find(transaction_id);
	check(itr_trxn != transactions.end(), contract_names::transactions.to_string() + ": the transaction you want to delete does not exist.");

	auto accnttrxns_by_transactions = accnttrxns.get_index<"bytrxns"_n>();
	auto itr_amount = accnttrxns_by_transactions.begin();
	name action_cancel_amount;

	while (itr_amount != accnttrxns_by_transactions.end() &&
		   itr_amount -> transaction_id == transaction_id) {
		
		if (itr_amount -> amount < 0) {
			action_cancel_amount = "cancelsub"_n;
		} else {
			action_cancel_amount = "canceladd"_n;
		}

		action (
			permission_level(contract_names::accounts, "active"_n),
			contract_names::accounts,
			action_cancel_amount,
			std::make_tuple(project_id, itr_amount -> account_id, asset(abs(itr_amount -> amount), CURRENCY))
		).send();

		itr_amount = accnttrxns_by_transactions.erase(itr_amount);
	}

	transactions.erase(itr_trxn);
}




ACTION transactions::reset () {
	require_auth(_self);

	print("Hello");

	for (int i = 0; i < RESET_IDS; i++) {
		transaction_tables transactions(_self, i);
		
		auto itr_t = transactions.begin();
		while (itr_t != transactions.end()) {
			itr_t = transactions.erase(itr_t);
		}

		account_transaction_tables accnttrxns(_self, i);

		auto itr_at = accnttrxns.begin();
		while (itr_at != accnttrxns.end()) {
			itr_at = accnttrxns.erase(itr_at);
		}
	}
}

ACTION transactions::transact ( name actor, 
						  		uint64_t project_id, 
								vector<transaction_amount> amounts,
								uint64_t date,
								string description,
								vector<string> supporting_urls ) {

	require_auth(actor);

	action (
        permission_level(contract_names::permissions, "active"_n),
        contract_names::permissions,
        "checkprmissn"_n,
        std::make_tuple(actor, project_id, ACTION_NAMES.TRANSACTIONS_ADD)
    ).send();

	auto itr_project = projects.find(project_id);
	check(itr_project != projects.end(), contract_names::transactions.to_string() + ": the project with the id = " + to_string(project_id) + " does not exist.");

	make_transaction(actor, 0, project_id, amounts, date, description, supporting_urls);
}

ACTION transactions::deletetrxn (name actor, uint64_t project_id, uint64_t transaction_id) {
	require_auth(actor);

	action (
        permission_level(contract_names::permissions, "active"_n),
        contract_names::permissions,
        "checkprmissn"_n,
        std::make_tuple(actor, project_id, ACTION_NAMES.TRANSACTIONS_REMOVE)
    ).send();

	delete_transaction(project_id, transaction_id);
}

ACTION transactions::edittrxn ( name actor, 
								uint64_t project_id,
								uint64_t transaction_id,
								vector<transaction_amount> amounts,
								uint64_t date,
								string description,
								vector<string> supporting_urls ) {
	
	require_auth(actor);

	action (
        permission_level(contract_names::permissions, "active"_n),
        contract_names::permissions,
        "checkprmissn"_n,
        std::make_tuple(actor, project_id, ACTION_NAMES.TRANSACTIONS_EDIT)
    ).send();

	auto itr_project = projects.find(project_id);
	check(itr_project != projects.end(), contract_names::transactions.to_string() + ": the project with the id = " + to_string(project_id) + " does not exist.");

	transaction_tables transactions(_self, project_id);

	auto itr_trxn = transactions.find(transaction_id);
	check(itr_trxn != transactions.end(), contract_names::transactions.to_string() + ": the transaction does not exist.");

	delete_transaction(project_id, transaction_id);
	make_transaction(actor, transaction_id, project_id, amounts, date, description, supporting_urls);
}


ACTION transactions::deletetrxns (uint64_t project_id) {
	require_auth(_self);

	transaction_tables transactions(_self, project_id);
	account_transaction_tables accnttrxns(_self, project_id);

	auto itr_transaction = transactions.begin();
	while (itr_transaction != transactions.end()) {
		itr_transaction = transactions.erase(itr_transaction);
	}

	auto itr_at = accnttrxns.begin();
	while (itr_at != accnttrxns.end()) {
		itr_at = accnttrxns.erase(itr_at);
	}
}


EOSIO_DISPATCH(transactions, (reset)(transact)(deletetrxn)(edittrxn)(deletetrxns));
