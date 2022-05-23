# Proxy class diagram

Explanation of the general flow of the classes / smart contracts.

```mermaid
  classDiagram
  Projects <|.. Accounts
  Projects : project_t
  Projects : user_t
  Projects : entity_t
  Projects : investment_t
  Projects : fund_transfer_t
  Projects : addproject()
  Projects : editproject()
  Projects : deleteprojct()
  Projects : addentity()
  Projects : adduser() 
  Projects : deleteuser()
  Projects : assignuser()
  Projects : removeuser()
  Projects : invest()
  Projects : editinvest()
  Projects : deleteinvest()
  Projects : approveinvst()
  Projects : maketransfer()
  Projects : edittransfer()
  Projects : deletetrnsfr()
  Projects : confrmtrnsfr()
```