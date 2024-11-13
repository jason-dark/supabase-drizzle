# `supabase-drizzle` 🚀

[![npm version](https://img.shields.io/npm/v/supabase-drizzle)](https://www.npmjs.com/package/supabase-drizzle)
[![License](https://img.shields.io/github/license/jason-dark/supabase-drizzle)](./LICENSE)
[![CI - Test and Build](https://github.com/jason-dark/supabase-drizzle/actions/workflows/ci.yml/badge.svg)](https://github.com/jason-dark/supabase-drizzle/actions/workflows/ci.yml)
[![Release to NPM](https://github.com/jason-dark/supabase-drizzle/actions/workflows/release.yml/badge.svg)](https://github.com/jason-dark/supabase-drizzle/actions/workflows/release.yml)

---

## ⚰️ Deprecation Notice ⚰️

This package was created to plug a gap when Drizzle ORM did not support RLS. Now that it does, there is no reason to use or maintain this package. Please follow the Drizzle ORM RLS with Supabase docs [here](https://orm.drizzle.team/docs/rls#using-with-supabase) instead.

---

## Motivation 🔥

Drizzle ORM makes managing your database schema in TypeScript and handling migrations simple. However, managing RLS policies still requires manual SQL or using the Supabase dashboard, which can slow down your workflow.

**`supabase-drizzle`** aims to streamline this process, making RLS policy management as easy and intuitive as managing your schema with Drizzle, so you can move faster.

---

## Installation 📦

To install **`supabase-drizzle`**, simply run:

```bash
yarn add supabase-drizzle
# or
npm install supabase-drizzle
```
---
## Peer Dependencies 🤜🤛

Make sure you have the following peer dependencies installed in your project:

```bash
yarn add drizzle-kit drizzle-orm
# or
npm install drizzle-kit drizzle-orm
```
---
## Usage ⚡️

### Step 1
 Follow the [Drizzle setup guide for Supabase](https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase), then come back here and carry on to step 2.

### Step 2
Add a file `policies.config.ts` in the same directory as your `drizzle.config.ts` file.

### Step 3
In `drizzle.config.ts`, import `defineConfig` from `supabase-drizzle` instead of `drizzle-kit`:
```diff
- import { defineConfig } from 'drizzle-kit';
+ import { defineConfig } from 'supabase-drizzle';
```
Your config file will now support a `policies` option. This should point to the policies file `policies.config.ts` you made in step 2:
```typescript
// drizzle.config.ts

import { defineConfig } from 'supabase-drizzle';
import { config } from 'dotenv';

config({ path: '.env' });

export default defineConfig({
  schema: 'drizzle/schema.ts',
  out: 'drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  schemaFilter: ['public'],
  policies: 'drizzle/policies.ts'
});
```

### Step 4
Define RLS policies for your tables in `policies.config.ts`. This is a  basic example, see [examples](#examples) below for user role and multi-tenant configurations:
```typescript
// policies.config.ts

import { rlsPolicyBuilder } from 'supabase-drizzle';
import * as schema from './schema';

const { tables, own, rls, authenticated, everyone } = rlsPolicyBuilder(schema, {});

const profiles = rls(tables.profiles, {
  insert: authenticated(), // User can create their profile row if authenticated
  update: own(), // User can update their own profile row
  select: everyone(), // Everyone can select all profile rows
});

const tenantUserRoles = rls(tables.todos, {
  insert: authenticated(), // User can create a todo row if authenticated
  update: own(), // User can update their own todo row
  select: own(), // User can select their own todo row
  delete: own(), // User can delete their own todo row
});

// Make sure your policies are exported from the file!
export { profiles, tenantUserRoles };
```

### Step 5
Generate your RLS policy migration:
```bash
# Make sure to point to the correct config file location for your project

npx supabase-drizzle generate --config drizzle/drizzle.config.ts
```
> `supabase-drizzle generate` outputs the location of the generated SQL migration file for your RLS policies. I suggest you manually check this for errors.

### Step 6
Run the migration using drizzle:
```bash
# Make sure to point to the correct config file location for your project

npx drizzle-kit migrate --config drizzle/drizzle.config.ts
```

### Step 7
For ease of use, consider adding these scripts to your `package.json` (Make sure to point to the correct config file location for your project):
```json
{

  "scripts": {
    "drizzle-generate-schema": "npx drizzle-kit generate --config drizzle/drizzle.config.ts",
    "drizzle-generate-rls": "npx supabase-drizzle generate --config drizzle/drizzle.config.ts",
    "drizzle-migrate": "npx drizzle-kit migrate --config drizzle/drizzle.config.ts",
  }
}
```
Then you can sync your local schema and RLS policies to Supabase in one go using:
```bash
yarn drizzle-generate-schema && drizzle-generate-rls && yarn drizzle-migrate
#or
npm run drizzle-generate-schema && npm run drizzle-generate-rls && npm run yarn drizzle-migrate
```

---
## Usage 📚

### **`rlsPolicyBuilder(schema, rlsConfig)`**

Returns functions that allow you to define RLS policies for your tables.
```typescript
// policies.config.ts

import { rlsPolicyBuilder } from 'supabase-drizzle';
import * as schema from './schema';

const {
  tables, // Strongly typed table names object based on your schema
  roles, // Strong typed user roles object based on your RLS config
  rls, // Function to define RLS policies for a table
  own, // RLS policy to allow access where the row's user_id matches the user's uid
  authenticated // RLS policy to allow access to all authenticated users
  hasRole, // RLS policy to allow access if a user has a role
  belongsTenant, // RLS policy that allows access to all users belonging to a tenant (used only in multi-tenant configs)
  everyone // RLS policy that allows access to all users
} = rlsPolicyBuilder(
  schema, // Your drizzle schema (only single file schema supported)
  {
    tenantsTable: schema.tenants, // Optional - used for multi-tenant setups
    userRolesTable: schema.userRoles, // Optional - used for RLS policies with user roles
    userRoles: { // Optional - used for RLS policies with user roles
      owner: {},
      admin: {},
      member: {}
    }
  }
);
```

### **`rls()`**
Function to define RLS policies for a table. 
```typescript
// policies.config.ts

const profiles = rls(tables.profiles, {
  insert: authenticated(),
  update: own(),
  select: everyone(),
});

export { profiles }
```

### **`own()`**
RLS policy to allow access where the row's `user_id` matches the user's `uid`. Tables must have a `user_id` column to use this policy.  
```typescript
// policies.config.ts

const todos = rls(tables.todos, {
  all: own() // User has access to all methods where their uid matches the row's user_id
});

export { profiles }
```

###  **`authenticated()`**
RLS policy to allow access to authenticated users. 
```typescript
// policies.config.ts

const profiles = rls(tables.profiles, {
  insert: authenticated(),
});

export { profiles }
```

###  **`hasRole(userRole: string | string[])`**
RLS policy to allow access if a user has a role. User roles are defined in your `rlsConfig` passed to `rlsPolicyBuilder`.
```typescript
// policies.config.ts

const profiles = rls(tables.profiles, {
  insert: authenticated(),
  select: everyone(),
  update: own(),
  delete: hasRole(['admin', 'owner']) // Or simply `hasRole('admin')`
});

export { profiles }
```

###  **`belongsTenant()`**
RLS policy to allow access if a user belongs to a tenant. Only available when `tenantTable` is provided to `rlsConfig`, signifying a multi-tenant configuration.
```typescript
// policies.config.ts

const profiles = rls(tables.profiles, {
  insert: authenticated(),
  select: belongsTenant(), // All users belonging to the same tenant can select
  update: own(),
});

export { profiles }
```

###  **`everyone()`**
RLS policy to allow access to all users. Proceed with caution.
```typescript
// policies.config.ts

const profiles = rls(tables.profiles, {
  select: everyone(),
});

export { profiles }
```

---
## Examples 📝  

- [Basic example 🔗 ](./examples/basic-example/)
- [User roles example 🔗 ](./examples/user-roles-example/)
- [Multi-tenant example 🔗 ](./examples/multi-tenant-example/)

---
## Limitations 🚫 

- Currently only a single file Drizzle schema is supported.
- I have only tested this lib on MacOS. I expect it will work on *nix systems but not Windows. If there is enough interest I might look into it.
- Only Typescript [Drizzle Kit config](https://orm.drizzle.team/docs/drizzle-config-file) files are supported. Plain JavaScript will not work. Again, if there's enough interest I might look into it.

---
## Contributing 🤝

Contributions are welcome. I am a single developer who built this to solve a problem I had, so if there's a feature you specifically want feel free to open a [pull request](https://github.com/jason-dark/supabase-drizzle/pulls).

---
## Disclaimers❗ 

- **`supabase-drizzle`** is not an official library affiliated with the Supabase or Drizzle teams.
- I make no guarantees that this lib is bug free.
- I strongly suggest that you manually review generated SQL for RLS migrations before running them.
- Don't use this lib anywhere near production databases until it's more stable and battle tested.

---
## License 📝

This project is licensed under the [MIT License](./LICENSE).
 
 ---
 ## Authors

- [@jason-dark](https://github.com/jason-dark)
