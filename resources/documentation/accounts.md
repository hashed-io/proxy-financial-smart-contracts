# **accounts contract**
This contract contains the necessary actions to manage accounts, ledgers and a set of data test.

---

# **ACTIONS**
## **reset**
### **Description:**
This action will reset all the tables  within this contract.
### **Required permission:**
`self@active`
### **Inline actions:**
N / A
### **Parameters:**
N / A

</br>

---

## **addledger**
### **Description:** 
This action will add a new ledger.
### **Required permission:**
`self@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | project_id | Project ID |
| uint64_t | entity_id | Entity ID |

</br>

---

## **initaccounts**
### **Description:** 
This action will create a basic set of accounts in the project with the selected `project_id`.
### **Required permission:**
`self@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | project_id | Project ID |

</br>

---

## **addbalance**
### **Description:** 
This action will increase the current balance of the accoun with `account_id` in the `project_id` by an amount of `amount`. 
### **Required permission:**
`self@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | project_id | Project ID |
| uint64_t |  account_id | Account ID |
| asset | amount | Quantity of the current asset |

</br>

---

## **subbalance**
### **Description:** 
This action will decrease the current balance of the account with `account_id` in the project `project_id` by an amount of `amount`.
### **Required permission:**
`self@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | project_id | Project ID |
| uint64_t |  account_id | Account ID |
| asset | amount | Quantity of the current asset |

</br>

---

## **canceladd**
### **Description:** 
This action will cancel the increase in the balance of the account with id `account_id` in the project `project_id` by an amount of `amount`.
### **Required permission:**
`self@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | project_id | Project ID |
| uint64_t |  account_id | Account ID |
| asset | amount | Quantity of the current asset |

</br>

---

## **cancelsub**
### **Description:** 
This action will cancel the decrease in the balance of the account with id `account_id` in the project `project_id` by an amount of `amount`.
### **Required permission:**
`self@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | project_id | Project ID |
| uint64_t |  account_id | Account ID |
| asset | amount | Quantity of the current asset |

</br>

---

## **addaccount**
### **Description:** 
This action will create a new account in the project `project_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
| actions | permission |
| -- | -- |
| budgets : : addbudget | `proxycapbdg1@active`|


### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name | 
| uint64_t | project_id | Project ID |
| string | account_name | Account name |
| uint64_t | parent_id | Marks if the account has a parent |
| symbol | account_currency | Current asset symbol |
| string | description | A brief description of the account |
| uint64_t | [account_category](#reference1) | Category can be a number between 1-3 |
| asset | budget_amount | Budget amount |  
   


</br>

---

## **editaccount**
### **Description:** 
This action will edit an existing account with the id `account_id` in the project `project_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
<!--It has an inline action commented checkprmissn, I'll figure out later-->
| actions | permission |
| -- | -- |
| permissions : : checkledger | `proxycapper1@active` |
| budgets : : editbudget | `proxycapbdg1@active` |
| budgets : : addbudget | `proxycapbdg1@active` |
| budgets : : deletebudget  | `proxycapbdg1@active` |

### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| uint64_t | project_id | Project ID |
| uint64_t | account_id | Account ID |
| string | account_name | Account name |
| string | description | A brief description of the account |
| uint64_t | [account_category](#reference1)  | Category can be a number between 1-3 |
| asset | budget_amount | Budget amount |     

</br>

---
## **deleteaccnt**
### **Description:** 
This action will delete an existing account with the id `account_id` in the project `project_id`.
### **Required permission:**
`self@active`
### **Inline actions:**
<!--It has an inline action commented checkprmissn, I'll figure out later-->
| actions | permission |
| -- | -- |
| permissions : : checkledger | `proxycapper1@active` |
| budgets : : delbdgtsacct | `proxycapbdg1@active` |

### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| uint64_t | project_id | Project ID |
| uint64_t | account_id | Account ID |

</br>

---

## **deleteaccnts**
### **Description:** 
This action will delete all accounts in the project `project_id`.

### **Required permission:**
`self@active`
### **Inline actions:**
| actions | permission |
| -- | -- |
| budgets : : delbdgtsacct | `proxycapbdg1@active` |

### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | project_id | Project ID |


</br>

---
# **DATA TYPE** 

<div id="reference1"></div>

### **accounts_category**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| uint64_t | NONE | `1` | `pendant` |
| uint64_t | HARD_COST | `2` | `pendant` |
| uint65_t | SOFT_COST | `3` | `pendant` |

</br>
<div id="reference2"></div>

### **account_subtype**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| string | ASSETS | `"Assets"` | Assets |
| string | EQUITY | `"Equity"` | Equity  |
| string | Expenses | `"Expenses"` | Expenses |
| string | Income | `"Income"` | Income |
| string | Liabilities | `"Liabilities"` | Liabilities |

</br>
<div id="reference3"></div>

### **account_type**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| string | DEBIT | `"Debit"` | The type of account is debit |
| string | CREDIT| `"Credit"` | The type of account is credit |
 

</br>
<div id="reference4"></div>

### **budget_type**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| string | TOTAL | `"Total"` | Total budget of the account |
| string | ANNUALLY | `"Annually"` | Anual budget of the account |
| string | MONTHLY | `"Monthly"` | Budget for the month |
| string | WEEKLY | `"Weekly"` | Budget for the week |
| string | DAILY | `"Daily"` | Budget for the day |
| string | CUSTOM | `"Custom"` | Budget for a given period of time |

</br>

<div id="reference5"></div>

### **project_class**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| string | NNN | `"NNN"` | Triple Net Lease |
| string | MULTIFAMILY | `"MULTIFAMILY"` | Residential sector |
| string | OFFICE | `"OFFICE"` | Office sector |
| string | INDUSTRIAL | `"INDUSTRIAL"` | Industry sector |
| string | MASTER_PLANNED_COMMUNITY | `"MASTER_PLANNED_COMMUNITY"` | Master planned community |
| string | MEDICAL | `"MEDICAL"` | Medical sector |
| string | HOTEL | `"HOTEL"` | Hotel sector |

</br>

<div id="reference6"></div>

### **Project status**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| uint8_t | AWAITING_FUND_APPROVAL | `1` |  Awaiting fund approval |
| uint8_t | READY_FOR_INVESTMENT | `2` | Ready for investment |
| uint8_t | INVESTMENT_GOAL_REACHED | `3` | Investment goal reached |
| uint8_t | COMPLETED | `4` | Completed |

</br>

<div id="reference7"></div>

### **Entity types**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| string | INVESTOR | `"Investor"` |  User is an investor |
| string | DEVELOPER | `"Developer"` | User is a developer |
| string | FUND | `"Fund"` | User is a funder  |
 
</br>

---

# **TABLES**
## **accounts**
### **EOSIO table name:** account_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | account_id | Account ID| 
| uint64_t | parent_id | Parent ID |
| uint16_t | num_children | `pendant` |
| string | account_name | Account name | 
| string | [account_subtype](#reference2)  | Account subtype |
| asset | increase_balance | `pendant` |
| asset | decrase_balance | `pendant` |
| symbol | account_symbol | Current account symbol |
| uint64_t | ledger_id | Ledger ID |
| string | description | A brief description of the account |
| uint64_t | [account_category](#reference1) | Category can be a number between 1-3. |

</br>

---

## **accnttypes**
### **EOSIO table name:** type_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | type_id | Type ID |
| string | type_name | Type name |
| string | account_class | Account class `pendant possible reference`|

</br>

---

## **ledgers**
### **EOSIO table name:** ledger_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | ledger_id | Ledger ID  | 
| uint64_t | entity_id | Entity ID |
| string | description | A brief description about the ledger |

</br>

---

## **projects**
### **EOSIO table name:** project_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | project_id | Project ID |
| uint64_t | developer_id | Developer ID | 
| name | owner | Owner name |
| string | [project_class](#reference5) | Project class |
| string | project_name | Project name |
| string | description | A brief description about the project |
| uint64_t | created_date | Project creation date |
| uint64_t | [status](#reference6) | Project status  |
| asset | total_project_cost | Total project cost |
| asset | debt_financing | Debt financing  |
| uint8_t | term | Term |
| uint16_t | interest_rate | Interest rate |
| string | loan_agreement | Loan Agreement |
| asset | total_equity_financing | Total equity financing `|
| asset | total_gp_equity | Total GP equity|  
| asset | private_equity | Private equity |
| uint16_t | annual_return | Anual return for the project |
| string | project_co_lp | Project CO LP |
| uint64_t | project_co_lp_date | Project CO LP |
| uint64_t | projected_completion_date | Project completition date |
| uint64_t | projected_stabilization_date | Project stabilization date |
| uint64_t | anticipated_year_sale_refinance | Anticipated year sale refinance |
| string | fund_lp | `pendant` |
| asset | total_fund_offering_amount | Total fund offering amount |
| uint64_t | total_number_fund_offering | `pendant` |
| asset | price_per_fund_unit | `pendant` |
| uint64_t | approved_date | Approved date |
| name | approved_by |  Name of the approver |	

</br>

---

## **users**
### **EOSIO table name:** user_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | account | Account name |
| string | user_name | User name |
| uint64_t | entity_id | Entity ID |
| string | type | User type `pendant possible reference`| 

</br>

---

## **entities**
### **EOSIO table name:** entity_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | entity_id | Entity ID|
| string | entity_name | Entity name |
| string | description | A brief description about the entity. |
| string | [type](#reference7) | Entity type |

</br>

---

## **budgets**
### **EOSIO table name:** budget_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | budget_id | Budget ID |
| uint64_t | account_id | Account ID |
| asset | amount | Budget's amount |
| uint64_t | budget_creation_date | Creation date |
| uint64_t | budget_update_date | Update date | 
| uint64_t | budget_period_id | Budget period ID |
| uint64_t | budget_type_id | Budget type ID |  













