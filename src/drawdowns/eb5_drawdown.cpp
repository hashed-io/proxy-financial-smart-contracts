#include <drawdowns/eb5_drawdown.hpp>

void EB5Drawdown::create_impl(const eosio::name &drawdown_type, const uint64_t &drawdown_number)
{
  transactions::drawdown_tables drawdown_t(contract_name, project_id);

  // TODO fix this validation

  // auto drawdowns_by_type = drawdown_t.get_index<"bytype"_n>();
  // auto drawdown_itr = drawdowns_by_type.find(common::transactions::drawdown::type::eb5.value);

  // bool unapproved_drawdown = false;

  // while (drawdown_itr != drawdowns_by_type.end())
  // {
  //   if (drawdown_itr->type == drawdown_type)
  //   {
  //     unapproved_drawdown = true;
  //     check(drawdown_itr->state != common::transactions::drawdown::status::approved, "Cannot create a drawdown, one already in process");
  //   }

  //   drawdown_itr++;
  // }

  drawdown_t.emplace(contract_name, [&](auto &item)
                     {
		item.drawdown_id = get_valid_index(drawdown_t.available_primary_key());
    item.drawdown_number = drawdown_number;
		item.type_str = common::transactions::drawdown::type_EB5;
    item.type = common::transactions::drawdown::type::eb5;
		item.total_amount = asset(0, common::currency);
		item.state = DRAWDOWN_STATES.DAFT;
		item.open_date = eosio::current_time_point().sec_since_epoch();
		item.close_date = 0; });
}

void EB5Drawdown::update_impl(const uint64_t &drawdown_id, const eosio::asset &total_amount)
{
  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");
  check(drawdown_itr->state == DRAWDOWN_STATES.DAFT, "EB5 Drawdown can not be edited after submit.");

  transactions::project_tables project_t(common::contracts::projects, common::contracts::projects.value);
  auto project_itr = project_t.find(project_id);

  require_auth(project_itr->builder);

  drawdown_t.modify(drawdown_itr, contract_name, [&](auto &item)
                    { item.total_amount += total_amount; });

}
