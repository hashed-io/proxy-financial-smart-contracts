#include <drawdowns/eb5_drawdown.hpp>

void EB5Drawdown::create_impl(const eosio::name &drawdown_type)
{
  transactions::drawdown_tables drawdown_t(contract_name, project_id);

  auto drawdowns_by_type = drawdown_t.get_index<"bytype"_n>();
  auto drawdown_itr = drawdowns_by_type.find(common::transactions::drawdown::type::eb5.value);

  // bool unapproved_drawdown = false;

  while (drawdown_itr != drawdowns_by_type.end())
  {
    if (drawdown_itr->state != common::transactions::drawdown::status::approved)
    {
      check(false, "Cannot create a drawdown, one already in process");
      break;
    }

    drawdown_itr++;
  }

  drawdown_t.emplace(contract_name, [&](auto &item)
                     {
		item.drawdown_id = get_valid_index(drawdown_t.available_primary_key());
		item.type_str = common::transactions::drawdown::type_EB5;
    item.type = common::transactions::drawdown::type::eb5;
		item.total_amount = asset(0, common::currency);
		item.state = DRAWDOWN_STATES.DAFT;
		item.open_date = eosio::current_time_point().sec_since_epoch();
		item.close_date = 0; });
}

void EB5Drawdown::update_impl(const uint64_t &drawdown_id)
{
  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");
  check(drawdown_itr->state == DRAWDOWN_STATES.DAFT, "EB5 Drawdown can not be edited after submit.");
  
  // permissions of builder
  
}
