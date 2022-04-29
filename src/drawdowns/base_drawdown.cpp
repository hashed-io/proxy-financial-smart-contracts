#include <drawdowns/base_drawdown.hpp>

void Drawdown::check_requirements(const uint64_t &project_id)
{
  /* code here */
}

void Drawdown::create(const uint64_t &project_id, const eosio::name &drawdown_type)
{

  transactions::drawdown_tables drawdown_t(contract_name, project_id);

  create_impl(project_id, drawdown_type);

}

void Drawdown::update(const uint64_t &project_id, const uint64_t &drawdown_id)
{
  /* code here */
  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

  update_impl(project_id, drawdown_id);
}

void Drawdown::submit(const uint64_t &project_id, const uint64_t &drawdown_id)
{
  /* code here */
  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

  drawdown_t.modify(drawdown_itr, contract_name, [&](auto item)
                    { item.state = DRAWDOWN_STATES.SUBMITTED; });
}

void Drawdown::approve(const uint64_t &project_id, const uint64_t &drawdown_id)
{
  /* code here */
  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

  check(drawdown_itr->state == DRAWDOWN_STATES.SUBMITTED, "Drawdown is not in a submitted state!");

  drawdown_t.modify(drawdown_itr, contract_name, [&](auto item)
                    { item.state = DRAWDOWN_STATES.APPROVED; });
}

void Drawdown::reject(const uint64_t &project_id, const uint64_t &drawdown_id)
{
  /* code here */
  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

  check(drawdown_itr->state == DRAWDOWN_STATES.SUBMITTED, "Drawdown is not in a submitted state!");

  drawdown_t.modify(drawdown_itr, contract_name, [&](auto item)
                    { item.state = DRAWDOWN_STATES.DAFT; });
}
