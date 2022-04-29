<h1 class="contract">reset</h1>

---
spec_version: "0.2.0"
title: Reset
summary: 'This action will reset all the tables'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} resets all the tables within this contract.


<h1 class="contract">initroles</h1>

---
spec_version: "0.2.0"
title: Init Roles
summary: 'This action will init basic roles'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} inits a set of basic roles in the project {{project_id}}.


<h1 class="contract">assignrole</h1>

---
spec_version: "0.2.0"
title: Assign Roles
summary: 'This action will assign a role to a user'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} assigns the role {{role_id}} to the user {{user}}.


<h1 class="contract">checkprmissn</h1>

---
spec_version: "0.2.0"
title: Check Permissions
summary: 'This action will verify user permissions'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} verifies whether the user {{user}} can execute action {{action_name}}.


<h1 class="contract">givepermissn</h1>

---
spec_version: "0.2.0"
title: Give Permission
summary: 'This action will give a permission to a role'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} gives the permission to execute the action {{action_name}} to the role {{role_id}}.


<h1 class="contract">removeprmssn</h1>

---
spec_version: "0.2.0"
title: Remove Permission
summary: 'This action will remove a permission to a role'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} removes the permission to execute the action {{action_name}} to the role {{role_id}}.


<h1 class="contract">addrole</h1>

---
spec_version: "0.2.0"
title: Add Role
summary: 'This action will add a new role to a project'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} creates a new role ({{role_name}}) for the project {{project_id}}.


<h1 class="contract">removerole</h1>

---
spec_version: "0.2.0"
title: Remove Role
summary: 'This action will remove an existing role to a project'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} removes the role {{role_id}} for the project {{project_id}}.


<h1 class="contract">deletepmssns</h1>

---
spec_version: "0.2.0"
title: Delete Permissions
summary: 'This action will remove all permissions in a project'
icon: https://prxfi.com/statics/app-logo-128x128.png#343fc624791d20b3594a5d9dcff22f07e840b9df87e4d02de62c32b73bbdf4ad
---

{{$action.authorization.[0].actor}} removes all the permissions for the project {{project_id}}.

