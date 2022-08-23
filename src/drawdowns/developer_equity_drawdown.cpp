#include <drawdowns/developer_equity_drawdown.hpp>

void DeveloperEquityDrawdown::create_impl(const eosio::name &drawdown_type, const uint64_t &drawdown_number)
{
  transactions::drawdown_tables drawdown_t(contract_name, project_id);

  // TODO fix this validation

  // auto drawdowns_by_type = drawdown_t.get_index<"bytype"_n>();
  // auto drawdown_itr = drawdowns_by_type.find(common::transactions::drawdown::type::developer_equity.value);

  // while (drawdown_itr != drawdowns_by_type.end())
  // {
  //   if (drawdown_itr->type == drawdown_type)
  //   {
  //     check(drawdown_itr->state != common::transactions::drawdown::status::approved, "Cannot create a drawdown, one already in process");
  //     break;
  //   }

  //   drawdown_itr++;
  // }

  drawdown_t.emplace(contract_name, [&](auto &item)
                     {
		item.drawdown_id = get_valid_index(drawdown_t.available_primary_key());
    item.drawdown_number = drawdown_number;
		item.type_str = common::transactions::drawdown::type_developer_equity;
    item.type = common::transactions::drawdown::type::developer_equity;
		item.total_amount = asset(0, common::currency);
		item.state = DRAWDOWN_STATES.DAFT;
		item.open_date = eosio::current_time_point().sec_since_epoch();
		item.close_date = 0; });
}

void DeveloperEquityDrawdown::update_impl(const uint64_t &drawdown_id, const eosio::asset &total_amount, const bool &is_add_balance)
{
  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

  transactions::project_tables project_t(common::contracts::projects, common::contracts::projects.value);
  auto project_itr = project_t.find(project_id);

  check(project_itr -> builder.value > 0 , "There is no assigned builder - Developer Equity ");
  if (drawdown_itr->state == DRAWDOWN_STATES.DAFT)
  {
    require_auth(project_itr->builder);
  }

  else if (drawdown_itr->state == DRAWDOWN_STATES.SUBMITTED)
  {
    require_auth(project_itr->owner);
  }
  else
  {
    check(false, "Drawdown can not be edited at this state!");
  }

  if (is_add_balance)
  {
    drawdown_t.modify(drawdown_itr, contract_name, [&](auto &item)
                      { item.total_amount += total_amount; });
  }
  else
  {
    drawdown_t.modify(drawdown_itr, contract_name, [&](auto &item)
                      { item.total_amount -= total_amount; });
  }
}

void DeveloperEquityDrawdown::edit_impl(const uint64_t &drawdown_id,
                                        vector<common::types::encrypted_url_information> supporting_files,
                                        const std::string &description,
                                        const uint64_t &date,
                                        const eosio::asset &amount,
                                        const uint8_t &add_file)
{
  transactions::drawdown_tables drawdown_t(contract_name, project_id);
  auto drawdown_itr = drawdown_t.find(drawdown_id);

  check(drawdown_itr != drawdown_t.end(), "Drawdown not found");

  if (add_file == common::transactions::drawdown::bulk::create)
  {
    check(!drawdown_itr->files.size() > 0, "cannot send create twice, you need to edit/delete data fisrt");

    drawdown_t.modify(drawdown_itr, contract_name, [&](auto &item)
                      { item.files.push_back((common::types::extended_url_information){supporting_files, description, date, amount}); });
  }
  else if (add_file == common::transactions::drawdown::bulk::edit)
  {
    check(drawdown_itr->files.size() > 0, "there's no previuos data, nothing to be modified");

    drawdown_t.modify(drawdown_itr, contract_name, [&](auto &item)
                      { item.files.clear(); });

    drawdown_t.modify(drawdown_itr, contract_name, [&](auto &item)
                      { item.files.push_back((common::types::extended_url_information){supporting_files, description, date, amount}); });
  }
  else if (add_file == common::transactions::drawdown::bulk::remove)
  {
    check(drawdown_itr->files.size() > 0, "there's no previous data, nothing to be deleted");

    drawdown_t.modify(drawdown_itr, contract_name, [&](auto &item)
                      { item.files.clear(); });
  }
}