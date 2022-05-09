<h1 class="contract">reset</h1>

---
spec_version: "0.2.0"
title: Reset
summary: 'This action will reset all the tables'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} resets all the tables within this contract.


<h1 class="contract">initaccounts</h1>

---
spec_version: "0.2.0"
title: Init Accounts
summary: 'This action will init the basic accounts'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} creates a basic set of accounts in the project with the id {{project_id}}.


<h1 class="contract">addbalance</h1>

---
spec_version: "0.2.0"
title: Add Balance
summary: 'This action will add balance to an account'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} increases the current balance of the account with id {{account_id}} in the project {{project_id}} by an amount of {{amount}}.


<h1 class="contract">subbalance</h1>

---
spec_version: "0.2.0"
title: Substract Balance
summary: 'This action will substract balance to an account'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} decreases the current balance of the account with id {{account_id}} in the project {{project_id}} by an amount of {{amount}}.


<h1 class="contract">canceladd</h1>

---
spec_version: "0.2.0"
title: Cancel Add Balance
summary: 'This action will cancel the add balance action'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} cancels the increase in the balance of the account with id {{account_id}} in the project {{project_id}} by an amount of {{amount}}.


<h1 class="contract">cancelsub</h1>

---
spec_version: "0.2.0"
title: Cancel Substract Balance
summary: 'This action will cancel the sub balance action'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} cancels the decrease in the balance of the account with id {{account_id}} in the project {{project_id}} by an amount of {{amount}}.


<h1 class="contract">addaccount</h1>

---
spec_version: "0.2.0"
title: Add Account
summary: 'This action will add an account'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} creates a new account in the project {{project_id}}.


<h1 class="contract">editaccount</h1>

---
spec_version: "0.2.0"
title: Edit Account
summary: 'This action will edit an account'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} edits an existing account with the id {{account_id}} in the project {{project_id}}.


<h1 class="contract">deleteaccnt</h1>

---
spec_version: "0.2.0"
title: Delete Account
summary: 'This action will delete an account'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} deletes an existing account with the id {{account_id}} in the project {{project_id}}.


<h1 class="contract">deleteaccnts</h1>

---
spec_version: "0.2.0"
title: Delete Accounts
summary: 'This action will delete all accounts in a project'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} deletes all accounts in the project {{project_id}}.
