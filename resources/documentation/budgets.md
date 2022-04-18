# **budgets contract**
This contract contains the actions necessary to create, edit, delete or recalculate a budget.

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

## **addbudget**
### **Description:**
This action will add a budget to the selected account with `account_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
<!--It has an inline action commented checkprmissn, I'll figure out later-->
| actions | permission |
| -- | -- |
| permissions : : checkledger | `proxycapper1@active` |
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| uint64_t | project_id | Project ID |
| uint64_t | account_id | Acccount ID |
| asset | amount | Budget amount |
| uint64_t | [budget_type_id](#reference1) | Budget type ID | 
| uint64_t | begin_date | Begin date | 
| uint64_t | end_date | End date |
| bool | modify_parents | It will modify parents if required |

</br>

---

## **editbudget**
### **Description:**
This action will eddit a budget with `budget_id` to the selected account with `account_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
<!--It has an inline action commented checkprmissn, I'll figure out later-->
| actions | permission |
| -- | -- |
| permissions : : checkledger | `proxycapper1@active` |
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| uint64_t | project_id | Project ID |
| uint64_t | budget_id | Budget ID |
| asset | amount | Budget amount |
| uint64_t | [budget_type_id](#reference1) | Budget type ID | 
| uint64_t | begin_date | Begin date | 
| uint64_t | end_date | End date |
| bool | modify_parents | It will modify parents if required |

</br>

---

## **deletebudget**
### **Description:**
This action will delete a budget with `budget_id` to the selected account with `account_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
<!--It has an inline action commented checkprmissn, I'll figure out later-->
| actions | permission |
| -- | -- |
| permissions : : checkledger | `proxycapper1@active` |
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| uint64_t | project_id | Project ID |
| uint64_t | budget_id | Budget ID |
| bool | modify_parents | It will modify parents if required |

</br>

---

## **rcalcbudgets**
### **Description:**
This action will recalculate a budget to the selected account with `account_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
<!--It has an inline action commented checkprmissn, I'll figure out later-->
| actions | permission |
| -- | -- |
| permissions : : checkledger | `proxycapper1@active` |
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| uint64_t | project_id | Project ID |
| uint64_t | account_id | Account ID |
| uint64_t | budget_period_id | Budget period ID |


</br>

---

## **delbdgtsacct**
### **Description:**
This action will deletes all budgets in the account.
### **Required permission:**
`self@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | project_id | Project ID |
| uint64_t | account_id | Account ID |

</br>

---

# **DATA TYPE** 

<div id="reference1"></div>

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

<div id="reference2"></div>

### **account_type**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| string | DEBIT | `"Debit"` | The type of account is debit  |
| string | CREDIT| `"Credit"` | The type of account is credit |

</br>
<div id="reference3"></div>

### **account_subtype**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| string | ASSETS | `"Assets"` | Assets |
| string | EQUITY | `"Equity"` | Equity |
| string | EXPENSES | `"Expenses"` | Expenses |
| string | INCOME | `"Income"` | Income |
| string | LIABILITIES | `"Liabilities"` | Liabilities |

<div id="reference4"></div>
</br>

### **accounts_category**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| uint64_t | NONE | `1` | `pendant` |
| uint64_t | HARD_COST | `2` | `pendant` |
| uint65_t | SOFT_COST | `3` | `pendant` |

---

# **TABLES**
## **budgets**
### **EOSIO table name:** budget_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | budget_id | Budget ID|
| uint64_t | account_id | Account ID |
| asset | amount | Budget amount |
| uint64_t | budget_creation_date | Creation date|
| uint64_t | budget_update_date | Update date |
| uint64_t | budget_period_id | Budget period ID `pendant possible reference`|
| uint64_t | [budget_type_id](#reference1) | Budget type ID |

</br>

---

## **budgetpriods**
### **EOSIO table name:** budget_period_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | budget_period_id | Budget period ID |
| uint64_t | begin_date | Begin date |
| uint64_t | end_date | End date |
| uint64_t | [budget_type_id](#reference1)  | Budget type ID |

</br>

---

## **budgetpriods**
### **EOSIO table name:** budget_type_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | [budget_type_id](#reference1) | Budget type ID | 
| string | type_name | `pendant`|
| string | description | A brief description about the budget period | 

</br>

---

## **accounts**
### **EOSIO table name:** account_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | account_id | Account ID |
| uint64_t | parent_id | Parent ID |
| uint16_t | num_children | `pendant`| 
| string | account_name |  `pendant`|
| string | [account_subtype](#reference3)  | Account subtype | 
| asset | increase_balance | `pendant` | 
| asset | decrease_balance | `pendant` | 
| symbol | account_symbol | Current symbol asset |
| uint64_t | ledger_id | Ledger ID |
| string | description | A brief description about the account | 
| uint64_t | [account_category(#reference4)] | Category can be a number between 1-3 |