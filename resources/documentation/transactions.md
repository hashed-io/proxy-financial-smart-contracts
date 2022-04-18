# **transactions contract**
This contract contains the necessary actions to manage transactions.

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

## **transact**
### **Description:**
This action will  make a transaction within the project with id `project_id` and the following parameters:
- Amounts: `amounts`
- Date: `date`
- Description: `description`
- Supporting URLs: `supporting_files`
### **Required permission:**
`actor@active`
### **Inline actions:**
<!--It has an inline action commented checkprmissn, I'll figure out later-->
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| uint64_t | project_id | Project ID |
| vector <[transaction_amount](#reference1)> | amounts | `pendant`|
| uint64_t | date | Creation date |
| string | description | A brief description about the transact |
| bool | is_drawdown | Boolean variable to ask if user wants to drawdown |
| vector <[url_information](#reference2)> | supporting_files | Stores the necessary IFPS's | 

</br>

---

## **deletetrxn**
### **Description:**
This action will  deletes the transaction with id `transaction_id` within the project with id `project_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
<!--It has an inline action commented checkprmissn, I'll figure out later-->
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| uint64_t | project_id | Project ID |
| uint64_t | transaction_id | Transaction ID |


</br>

---

## **edittrxn**
### **Description:**
This action will edit the transaction with id `transaction_id` within the project with id `project_id` and the following parameters:
- Amounts: `amounts`
- Date: `date`
- Description: `description`
- Supporting URLs: `supporting_files`

### **Required permission:**
`actor@active`
### **Inline actions:**
<!--It has an inline action commented checkprmissn, I'll figure out later-->
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| uint64_t | project_id | Project ID |
| uint64_t | transaction_id | Transaction ID |
| vector <[transaction_amount](#reference1)> | ammounts | `pendant`|
| uint64_t | date | Edit date |
| string | description | Abrief description about the edition |
| bool | is_drawdown | Ask if user wants to drawdown |
| vector <[url_information](#reference2)> | supporting_files | Stores the necessary IFPS's |

</br>

---

## **deletetrxns**
### **Description:**
This action will delete all transactions within the project with id `project_id`.

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

## **submitdrwdn**
### **Description:**
This action will close the last drawdown and opens a new one within the project with id `project_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| uint64_t | project_id | Project ID |
| vector <[url_information](#reference2)> | files| Stores the necessary IFPS's |
 
</br>

---

## **initdrawdown**
### **Description:**
This action will init the first drawdown within the project with id `project_id`.
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

## **toggledrdwn**
### **Description:**
This action will open or close a drawdown with `drawdown_id` within the project with id `project_id`.
### **Required permission:**
`self@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | project_id | Project ID |
| uint64_t | drawdown_id | Drawdown ID |


</br>

---

# **DATA TYPE** 

<div id="reference1"></div>

### **transaction_amount**
| Type | Name | Description |  
| -- | -- | -- |
| uint64_t | account_id | Account ID |
| int64_t | amount | Amount |

</br>

<div id="reference2"></div>

### **url_information**
| Type | Name | Description | 
| -- | -- | -- | 
| string | filename | File name |
| string | adress | Adress |

</br>

<div id="reference3"></div>

### **Drawdown States**
| Type | Name | Value | Description | 
| -- | -- | -- | -- |
| uint64_t | OPEN | `1` | Drawdown status is open |
| uint64_t | CLOSE | `2` | Drawdown status is closed |

</br>

<div id="reference4"></div>

</br>

### **accounts_category**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| uint64_t | NONE | `1` | `pendant` |
| uint64_t | HARD_COST | `2` | `pendant` |
| uint65_t | SOFT_COST | `3` | `pendant` |

</br>

---

<div id="reference5"></div>

### **account_subtype**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| string | ASSETS | `"Assets"` | Assets |
| string | EQUITY | `"Equity"` | Equity |
| string | EXPENSES | `"Expenses"` | Expenses |
| string | INCOME | `"Income"` | Income |
| string | LIABILITIES | `"Liabilities"` | Liabilities |

</br>

<div id="reference6"></div>

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

<div id="reference7"></div>

### **Project status**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| uint8_t | AWAITING_FUND_APPROVAL | `1` |  Awaiting fund approval |
| uint8_t | READY_FOR_INVESTMENT | `2` | Ready for investment |
| uint8_t | INVESTMENT_GOAL_REACHED | `3` | Investment goal reached |
| uint8_t | COMPLETED | `4` | Completed |

</br>

---

# **TABLES**
## **transactions**
### **EOSIO table name:** transaction_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | transaction_id | Transacion ID |
| name | actor | Actor name |
| uint64_t | timestamp | Current time record |
| string | description | A brief description about the trasaction |
| uint64_t | drawdown_id | Drawdown ID |
| asset | total_amount | Total amount of the trasaction |
| uint64_t | [transaction_category](#reference4) | Transaction category |
| vector <[url_information](#reference2)> | supporting_files | Stores the necessary IFPS's |

</br>

---

## **accnttrx**
### **EOSIO table name:** account_transaction_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | accnt_transaction_id | Account transaction ID | 
| uint64_t | account_id | Account ID | 
| uint64_t | transaction_id | Transaction ID | 
| int64_t  | amount | Transaction amount |

</br>

---

## **accounts**
### **EOSIO table name:** account_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | account_id | Accounnt ID |
| uint64_t | parent_id | Parent ID |
| uint16_t | num_children | `pendant` |
| string | account_name | Account name |
| string | [account_subtype](#reference5) | Account subtype |
| asset | increase_balance | `pendant` |
| asset | decrease_balance | `pendant` |
| symbol | account_symbol | Current symbol asset |
| uint64_t | ledger_id | Ledger ID |
| string | description | A brief description about the account |
| uint64_t | [account_category](#reference4) | Account category|

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
| string | [project_class](#reference6) | Project class |
| string | project_name | Project name |
| string | description | A brief description about the project |
| uint64_t | created_date | Project creation date |
| uint64_t | [status](#reference7) | Project status  |
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

## **accnttypes**
### **EOSIO table name:** type_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | type_id | Type_id `pendant possible reference`| 
| string | type_name | Type name |
| string | account_class | Account class `pendant possible reference`|

</br>

---

## **drawdowns**
### **EOSIO table name:** drawdown_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | drawdown_id | Drawdown ID | 
| asset | total_amount | Total amount of the drawdown | 
| vector <[url_information](#reference2)> | files | Stores the necessary IFPS's | 
| uint64_t | [state](#reference3) | Drawdown status | 
| uint64_t | open_date | Open date | 
| uint64_t | close_date | Close date |

</br>

---









