<h1 class="contract">reset</h1>

---
spec_version: "0.2.0"
title: Reset
summary: 'This action will reset all the tables'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} resets all the tables within this contract.


<h1 class="contract">transact</h1>

---
spec_version: "0.2.0"
title: Transact
summary: 'This action will make a transaction'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} makes a transaction within the project with id {{project_id}} and the following parameters:
- Amounts: {{amounts}}
- Date: {{date}}
- Description: {{description}}
- Supporting URLs: {{supporting_files}}


<h1 class="contract">deletetrxn</h1>

---
spec_version: "0.2.0"
title: Delete Transaction
summary: 'This action will delete a transaction'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} deletes the transaction with id {{transaction_id}} within the project with id {{project_id}}.


<h1 class="contract">edittrxn</h1>

---
spec_version: "0.2.0"
title: Edit Transact
summary: 'This action will edit a transaction'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} edits the transaction with id {{transaction_id}} within the project with id {{project_id}} and the following parameters:
- Amounts: {{amounts}}
- Date: {{date}}
- Description: {{description}}
- Supporting URLs: {{supporting_files}}


<h1 class="contract">deletetrxns</h1>

---
spec_version: "0.2.0"
title: Delete Transactions
summary: 'This action will delete all transactions in a project'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} deletes all transactions within the project with id {{project_id}}.


<h1 class="contract">submitdrwdn</h1>

---
spec_version: "0.2.0"
title: Submit Drawdown
summary: 'This action will submit a drawdown'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} closes the last drawdown and opens a new one within the project with id {{project_id}}.


<h1 class="contract">initdrawdown</h1>

---
spec_version: "0.2.0"
title: Init Drawdown
summary: 'Init Drawdown'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} inits the first drawdown within the project with id {{project_id}}.


<h1 class="contract">toggledrdwn</h1>

---
spec_version: "0.2.0"
title: Toggle Drawdown
summary: 'toggle Drawdown'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} opens or closes a drawdown {{project_id}}.











