# **projects contract**
This contract contains the necessary actions to manage a project and investments.

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

## **addproject**
### **Description:**
This action will add a new project.
### **Required permission:**
`actor@active`
### **Inline actions:**
| actions | permission |
| -- | -- |
| projects : : resetusers | `self@active` |
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| string | [project_class](#reference1)| Project class |
| string | project_name | Project name |
| string | description | A brief description about the project |
| asset | total_project_cost | Total project cost |
| asset | debt_financing | Debt financing |
| uint8_t | term | Term | 
| uint16_t | interest_rate | Interest rate |
| string | loan_agreement | Loan Agreement |
| asset | total_equity_financing | Total equity financing | 
| asset | total_gp_equity | Total GP equity |
| asset | private_equity | Private equity |
| uint16_t | annual_return | Annual return |
| string | project_co_lp | Project CO LP |
| uint64_t | project_co_lp_date |  CO LP date |
| uint64_t | projected_completion_date | Projected completion date |
| uint64_t | projected_stabilization_date | Projected stabilization date |
| uint64_t | anticipated_year_sale_refinance | Anticipated year sale refinance |

</br>

---



## **deleteprojct**
### **Description:**
This action will delete the given project with the id `project_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
<!--It has 3 inline actions commented, I'll figure out later-->
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| uint64_t | project_id | Project ID |


</br>

---

## **editproject**
### **Description:**
This action will edit an existing project with the id `project_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name | 
| uint64_t | project_id | Project ID |
| string | [project_class](#reference1) | Project class | 
| string | project_name | Project name | 
| string | description | A brief description about the project. |
| asset | total_project_cost | Total project cost |
| asset | debt_financing | Debt financing |
| uint8_t | term | Term |
| uint16_t | interest_rate | Interest rate |
| string | loan_agreement | Loan agreement |
| asset | total_equity_financing | Total equity financing | 
| asset | total_gp_equity | Total GP equity | 
| asset | private_equity | Private equity |
| uint16_t | annual_return | Annual return | 
| string | project_co_lp | Project CO LP |
| uint64_t | project_co_lp_date | CO LP date |
| uint64_t | projected_completion_date | Projected completion date |
| uint64_t | projected_stabilization_date | Projected stabilization date |
| uint64_t | anticipated_year_sale_refinance | Anticipated year sale refinance |

</br>

---

## **approveprjct**
### **Description:**
This action will approve the given project with the id `project_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
| actions | permission |
| -- | -- |
| accounts : : addledger | `proxycapacc1@active` |
| permissions : : initroles | `proxycapper1@active` |
| permissions : : assignrole | `proxycapper1@active` |
| transactions : : initdrawdown | `proxycaptrx1@active` |

### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name | 
| uint64_t | project_id | Project ID |
| string | fund_lp | `pendant`|
| asset | total_fund_offering_amount | Total fund offering amount |
| uint64_t | total_number_fund_offering | `pendant`|
| asset | price_per_fund_unit | `pendant` |

</br>

---

## **invest**
### **Description:**
This action will accept to make an investment in the given project with the id `project_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name | 
| uint64_t | project_id | Project ID |
| asset | total_investment_amount | Total investment amount |
| uint64_t | quantity_units_purchased | Units purchased|
| uint16_t | annual_preferred_return | Annual preferred return |
| uint64_t | signed_agreement_date | Signed agreement date|
| string | subscription_package | Subscription package |

</br>

---

## **editinvest**
### **Description:**
This action will edit the selected investment with the id `investment_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name | 
| uint64_t | project_id | Project ID |
| asset | total_investment_amount | Total investment amount |
| uint64_t | quantity_units_purchased | Units purchased |
| uint16_t | annual_preferred_return | Annual preferred return |
| uint64_t | signed_agreement_date | Signed agreement date |
| string | subscription_package | Subscription package |

</br>

---

## **deleteinvest**
### **Description:**
This action will delete the selected investment with the id `investment_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name | 
| uint64_t | investment_id | Investment ID |

</br>

---

## **approveinvst**
### **Description:**
This action will approve the selected investment with the id `investment_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name | 
| uint64_t | investment_id | Investment ID |

</br>

---

## **maketransfer**
### **Description:**
This action will create a transfer for the selected investment with the id `investment_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name | 
| asset | amount | Transfer amount |
| uint64_t | investment_id | Investment ID |
| string | proof_of_transfer | Proof of transfer |
| uint64_t | transfer date | Transfer date |

</br>

---

## **edittransfer**
### **Description:**
This action will edit the selected transfer with the id `transfer_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name | 
| uint64_t | transfer_id | Transfer ID |
| asset  | Amount  | Transfer amount  |
| string | proof_of_transfer | Proof of transfer |
| uint64_t | date | Transfer edition date |

</br>

---

## **deletetrnsfr**
### **Description:**
This action will delete the transfer with the id `transfer_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name | 
| uint64_t | transfer_id | Transfer ID |

</br>

---

## **confrmtrnsfr**
### **Description:**
This action will confirm the selected transfer with the id `transfer_id`.
### **Required permission:**
`actor@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name | 
| uint64_t | transfer_id | Transfer ID |
| string | proof_of_transfer | Proof of transfer |

</br>

---

## **addtestuser**
### **Description:**
This action will add a test user. This action is only intended to be used for testing.
### **Required permission:**
N / A
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | user | User name | 
| string | transfer_id | User's real name  |
| uint64_t | entity_id  | Entity id |

</br>

---

## **checkuserdev**
### **Description:**
This action will check whether the user is a developer.
### **Required permission:**
N / A
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | user | User name | 

</br>

---

## **changestatus**
### **Description:**
This action will change the `status` of the selected project with `project_id`.
### **Required permission:**
`self@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | project_id | Project ID | 
| uint64_t | [status](#reference2) | Project status | 

</br>

---

## **addentity**
### **Description:**
This action will add a new identity `type` required  to create a new account.
### **Required permission:**
`self@active`
### **Inline actions:**
N / A
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | actor | Actor name |
| string | entity_name | Entity name |
| string | description | A brief descriptiona about the new entity  | 
| string | [type](#reference5) | User type: Developer / Fund / Investor | 

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

<div id="reference3"></div>

### **Investment status**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| uint8_t | PENDING | `1` |  Pending |
| uint8_t | FUNDING | `2` | Funding |
| uint8_t | FUNDED | `3` | Funded |

</br>

<div id="reference4"></div>

### **Transfer status**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| uint8_t | AWAITING_CONFIRMATION | `1` |  Awaiting cofirmation |
| uint8_t | CONFIRMED | `2` | Confirmed |

</br>

<div id="reference5"></div>

### **Entity types**
| Type | Name| Value | Description |
| -- | -- | -- | -- |
| string | INVESTOR | `"Investor"` |  User is an investor |
| string | DEVELOPER | `"Developer"` | User is a developer |
| string | FUND | `"Fund"` | User is a funder  |

</br>

---
# **TABLES**
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

</br>

## **users**
### **EOSIO table name:** user_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| name | account | Account name |
| string | user_name | User name |
| uint64_t | entity_id | Entity ID |
| string | [type](#reference5) | User type: Developer / Fund / Investor |

</br>

## **entities**
### **EOSIO table name:** entity_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | entity_id | Entity ID |
| string | entity_name | Entity name |
| string | description | A brief description about entity |
| string | [type](#reference5) | User type: Developer / Fund / Investor |

</br>

## **investments**
### **EOSIO table name:** investment_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | investment_id | Investment ID |
| name | user | User name |
| uint64_t | project_id | Project ID |
| asset | total_investment_amount | Total investment amount |
| uint64_t | quantity_units_purchased | Units purchased |
| uint16_t | annual_preferred_return | Annual preferred return |
| uint64_t | signed_agreement_date | Signed agreement date  |
| asset | total_confirmed_transfered_amount | Total confirmed transfered amount | 
| asset | total_unconfirmed_transfered_amount | Total unconfirmed transfered amount |
| uint16_t | total_confirmed_transfers | Total confirmed transfers |
| uint16_t | total_unconfirmed_transfers | Total unconfirmed transfers |
| string | subscription_package | Subscription package |
| uint64_t | [status](#reference3) | Investment status |
| name | approved_by | Name of the approver |
| uint64_t | approved_date | Approved date |
| uint64_t | investment_date | Investment date |
	
</br>

## **transfers**
### **EOSIO table name:** fund_transfer_table
### **Parameters:**
| Type | Name | Description |
| -- | -- | -- |
| uint64_t | fund_transfer_id | Fund transfer ID |
| string | proof_of_transfer | Proof of transfer |
| asset | amount | Transfer amount |
| uint64_t | investment_id | Investment_id |
| name | user | User name | User name |
| uint64_t | [status](#reference4) | Tranfer status |
| uint64_t | transfer_date | Transfer date |
| uint64_t | updated_date | Update transfer date |
| uint64_t | confirmed_date | Confuirmation date|
| name | confirmed_by | Name of the approver |
	
</br>