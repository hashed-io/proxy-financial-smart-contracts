<h1 class="contract">reset</h1>

---
spec_version: "0.2.0"
title: Reset
summary: 'This action will reset all the tables'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} resets all the tables within this contract.


<h1 class="contract">addproject</h1>

---
spec_version: "0.2.0"
title: Add Project
summary: 'This action will add a new project'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} adds a new project with the following paramteres: \nClass: {{project_class}}\nName: {{project_name}}\nDescription: {{description}}\nTotal cost: {{total_project_cost}}\nDebt financing: {{debt_financing}}\nTerm: {{term}}\nInteres rate: {{interest_rate}}\nLoan Agreement: {{loan_agreement}}\n Total equity financing: {{total_equity_financing}}\nTotal GP equity: {{total_gp_equity}}\nPrivate equity: {{private_equity}}\n Annual return: {{annual_return}}\n Project CO LP: {{project_co_lp}}\n CO LP date: {{project_co_lp_date}}\nProjected completion date: {{projected_completion_date}}\nProjected stabilization date: {{projected_stabilization_date}}\nAnticipated year sale refinance: {{anticipated_year_sale_refinance}}.


<h1 class="contract">deleteprojct</h1>

---
spec_version: "0.2.0"
title: Delete Project
summary: 'This action will delete an existing project'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} deletes the given project with the id {{project_id}}.


<h1 class="contract">editproject</h1>

---
spec_version: "0.2.0"
title: Edit Project
summary: 'This action will edit a project'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} edits an existing project with the id {{project_id}} with the following paramteres: \nClass: {{project_class}}\nName: {{project_name}}\nDescription: {{description}}\nTotal cost: {{total_project_cost}}\nDebt financing: {{debt_financing}}\nTerm: {{term}}\nInteres rate: {{interest_rate}}\nLoan Agreement: {{loan_agreement}}\n Total equity financing: {{total_equity_financing}}\nTotal GP equity: {{total_gp_equity}}\nPrivate equity: {{private_equity}}\n Annual return: {{annual_return}}\n Project CO LP: {{project_co_lp}}\n CO LP date: {{project_co_lp_date}}\nProjected completion date: {{projected_completion_date}}\nProjected stabilization date: {{projected_stabilization_date}}\nAnticipated year sale refinance: {{anticipated_year_sale_refinance}}.


<h1 class="contract">approveprjct</h1>

---
spec_version: "0.2.0"
title: Approve Project
summary: 'This action will approve an existing project'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} approves the given project with the id {{project_id}}.


<h1 class="contract">invest</h1>

---
spec_version: "0.2.0"
title: Invest
summary: 'This action will make an investment into an existing project'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} accepts to make an investment in the given project with the id {{project_id}} with the following paramteres:\nAmount: {{total_investment_amount}}\nUnits purchased: {{quantity_units_purchased}}\nAnnual preferred return: {{annual_preferred_return}}\nSigned agreement date: {{signed_agreement_date}}\nSubscription package: {{subscription_package}}.


<h1 class="contract">editinvest</h1>

---
spec_version: "0.2.0"
title: Edit Invest
summary: 'This action will edit an investment into an existing project'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} edits the investment with the id {{investment_id}} with the following paramteres:\nAmount: {{total_investment_amount}}\nUnits purchased: {{quantity_units_purchased}}\nAnnual preferred return: {{annual_preferred_return}}\nSigned agreement date: {{signed_agreement_date}}\nSubscription package: {{subscription_package}}.


<h1 class="contract">deleteinvest</h1>

---
spec_version: "0.2.0"
title: Delete Invest
summary: 'This action will delete an investment into an existing project'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} deletes the investment with the id {{investment_id}}.


<h1 class="contract">approveinvst</h1>

---
spec_version: "0.2.0"
title: Approve Invest
summary: 'This action will approve an investment into an existing project'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} approves the investment with the id {{investment_id}}.


<h1 class="contract">maketransfer</h1>

---
spec_version: "0.2.0"
title: Make Transfer
summary: 'This action will create a transfer for an existing investment'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} creates a transfer for the investment with the id {{investment_id}} with the following parameters:\nAmount: {{amount}}\nProof of transfer: {{proof_of_transfer}}\nTransfer date: {{transfer_date}}.


<h1 class="contract">edittransfer</h1>

---
spec_version: "0.2.0"
title: Edit Transfer
summary: 'This action will edit a transfer for an existing investment'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} edits the transfer with the id {{transfer_id}} with the following parameters:\nAmount: {{amount}}\nProof of transfer: {{proof_of_transfer}}\nTransfer date: {{transfer_date}}.


<h1 class="contract">deletetrnsfr</h1>

---
spec_version: "0.2.0"
title: Delete Transfer
summary: 'This action will delete a transfer for an existing investment'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} deletes the transfer with the id {{transfer_id}}.


<h1 class="contract">confrmtrnsfr</h1>

---
spec_version: "0.2.0"
title: Confirm Transfer
summary: 'This action will confirm a transfer for an existing investment'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} confirms the transfer with the id {{transfer_id}}.


<h1 class="contract">addtestuser</h1>

---
spec_version: "0.2.0"
title: Add Test User
summary: 'This action will add a test user'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} adds a test user. This action is only intended to be used for testing.


<h1 class="contract">checkuserdev</h1>

---
spec_version: "0.2.0"
title: Check User is a Developer
summary: 'This action will check whether a user is a developer'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} checks whether the user is a developer.




