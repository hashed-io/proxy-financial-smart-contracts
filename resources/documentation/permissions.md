# **permissions contract**
This contract contains the necessary actions to manage permissions.

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

## **initroles**
### **Description:**
This action will init a set of basic roles in the project `project_id`.
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

## **assignrole**
### **Description:**
This action will  assign the role `role_id` to the selected user `user`.
### **Required permission:**
`actor@active`
### **Inline actions:**
<!--It has an inline action commented checkprmissn, I'll figure out later-->
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| name | user | User name |
| uint64_t | project_id | Project ID |
| uint64_t | role_id | Role ID `pendant possible reference` |

</br>

---

## **checkprmissn**
### **Description:**
This action will verify  whether the user `user` can execute the selected action `action_name`.
### **Required permission:**
<!--this action doesn't required any permission -->
N / A
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | user | User name |
| uint64_t | project_id | Project ID |
| name | action_name | Name of the action to check if user has te required permission |

</br>

---

## **checkledger**
### **Description:**
This action will verify if the correspond ledger exists and if the `user` has permissions to modify it.
### **Required permission:**
<!--this action doesn't required any permission -->
N / A
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | user | User name |
| uint64_t | project_id | Project ID |
| name | ledger_id | Ledger ID |

</br>

---

## **givepermissn**
### **Description:**
This action will give the permission to execute the action `action_name` to the role `role_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| uint64_t | project_id | Project ID |
| name | action_name | Name of the action to give the user the required permission |
| uint64_t | role_id | Role ID |

</br>

---

## **removeprmssn**
### **Description:**
This action will remove the permission to execute the action `action_name` to the role `role_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| uint64_t | project_id | Project ID |
| name | action_name | Name of the action to give the user the required permission |
| uint64_t | role_id | Role ID |

</br>

---

## **addrole**
### **Description:**
This action will create a new role `role_name` for the project `project_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| uint64_t | project_id | Project ID |
| name | role_name | Role name  |
| uint64_t | permissions | `pendant`|

</br>

---

## **removerole**
### **Description:**
This action will remove the role `role_id` for the project `project_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| uint64_t | project_id | Project ID |
| name | role_id | Role ID  |

</br>

---

## **deletepmssns**
### **Description:**
This action will removes all the permissions for the project `project_id`.
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

# **DATA TYPE** 

<div id="reference1"></div>

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

<div id="reference2"></div>

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
## **roles**
### **EOSIO table name:** role_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | role_id | Role ID `pendant possible reference`|
| string | role_name | Role name `pendant possible reference`| 
| uint64_t | permissions | `pendant` |

</br>

---

## **userroles**
### **EOSIO table name:** user_role_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | user | User name |
| uint64_t | role_id | Role ID `pendant possible reference`|

</br>

---

## **permissions**
### **EOSIO table name:** permission_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | action_name | Action name | 
| uint64_t | permissions | `pendant`|

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
| string | type | User type |

</br>

## **ledgers**
### **EOSIO table name:** ledger_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | ledger_id | Ledger ID |
| uint64_t | entity_id | Entity ID | 
| string | description | A brief description about the ledger |

</br>

## **projects**
### **EOSIO table name:** project_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | project_id | Project ID | 
| uint64_t | developer_id | Developer ID | 
| name | owner | Owner name |
| string | [project_class](#reference1) | Project class |
| string | project_name | Project name |
| string | description | A brief description about the project |
| uint64_t | created_date | Project creation date |
| uint64_t | [status](#reference2) | Project status  |
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