#include <drawdowns/base_drawdown.hpp>

void Drawdown::check_requirements()
{
  /* code here */
}

void Drawdown::create(const eosio::name &drawdown_type, const uint64_t &drawdown_number)
{
  create_impl(drawdown_type, drawdown_number);
}

void Drawdown::update(const uint64_t &drawdown_id, const eosio::asset &total_amount, const bool &is_add_balance)
{

  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

  update_impl(drawdown_id, total_amount, is_add_balance);
}

void Drawdown::submit(const uint64_t &drawdown_id)
{

  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

  drawdown_t.modify(drawdown_itr, contract_name, [&](auto item)
                    { item.state = common::transactions::drawdown::status::submitted; });
}

void Drawdown::approve(const uint64_t &drawdown_id)
{
  transactions::drawdown_tables drawdown_t(contract_name, project_id);

  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

  check(drawdown_itr->state == common::transactions::drawdown::status::submitted, "Drawdown is not in a submitted state!");

  // drawdown_t.modify(drawdown_itr, contract_name, [&](auto item)
  //                   { item.state = common::transactions::drawdown::status::approved;
  //                   item.close_date = eosio::current_time_point().sec_since_epoch(); });

  // TODO create a new one

  create(drawdown_itr->type, drawdown_itr->drawdown_number + 1);
}

void Drawdown::reject(const uint64_t &drawdown_id)
{
  /* code here */
  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

  check(drawdown_itr->state == common::transactions::drawdown::status::submitted, "Drawdown is not in a submitted state!");

  drawdown_t.modify(drawdown_itr, contract_name, [&](auto item)
                    { item.state = common::transactions::drawdown::status::daft; });
}

void Drawdown::edit(const uint64_t &drawdown_id,
  									vector<common::types::url_information> supporting_files,
                    const std::string &description,
                    const uint64_t &date,
                    const eosio::asset &amount,
                    const bool &add_file)
{ 
  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

  edit_impl(drawdown_id, supporting_files, description, date, amount, add_file);

}
