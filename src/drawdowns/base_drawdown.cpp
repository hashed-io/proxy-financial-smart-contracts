#include <drawdowns/base_drawdown.hpp>

void Drawdown::check_requirements()
{
  /* code here */
}

void Drawdown::create(const eosio::name &drawdown_type, const uint64_t &drawdown_number)
{

  transactions::drawdown_tables drawdown_t(contract_name, project_id);

  create_impl(drawdown_type, drawdown_number);
}

void Drawdown::update(const uint64_t &drawdown_id, const eosio::asset &total_amount)
{

  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

  update_impl(drawdown_id, total_amount);
}

void Drawdown::submit(const uint64_t &drawdown_id, const std::vector<common::types::url_information> &files)
{
  
  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

  drawdown_t.modify(drawdown_itr, contract_name, [&](auto item)
                    {
                      item.state = DRAWDOWN_STATES.SUBMITTED;
                      item.close_date = eosio::current_time_point().sec_since_epoch();
                      for (int i = 0; i < files.size(); i++)
                      {
                        item.files.push_back(files[i]);
                      } });
}

void Drawdown::approve(const uint64_t &drawdown_id)
{
  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

  check(drawdown_itr->state == DRAWDOWN_STATES.SUBMITTED, "Drawdown is not in a submitted state!");

  drawdown_t.modify(drawdown_itr, contract_name, [&](auto item)
                    { item.state = DRAWDOWN_STATES.APPROVED; });

  // TODO create a new one

  create(drawdown_itr->type, drawdown_itr->drawdown_number + 1);
  
}

void Drawdown::reject(const uint64_t &drawdown_id)
{
  /* code here */
  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

  check(drawdown_itr->state == DRAWDOWN_STATES.SUBMITTED, "Drawdown is not in a submitted state!");

  drawdown_t.modify(drawdown_itr, contract_name, [&](auto item)
                    { item.state = DRAWDOWN_STATES.DAFT; });
}
