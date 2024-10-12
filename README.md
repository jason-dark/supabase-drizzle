# `supabase-drizzle` 🚀

[![npm version](https://img.shields.io/npm/v/supabase-drizzle)](https://www.npmjs.com/package/supabase-drizzle)
[![License](https://img.shields.io/github/license/jason-dark/supabase-drizzle)](./LICENSE)
[![Build Status](https://github.com/jason-dark/supabase-drizzle/actions/workflows/ci.yml/badge.svg)](https://github.com/jason-dark/supabase-drizzle/actions/workflows/ci.yml)
[![Release to NPM](https://github.com/jason-dark/supabase-drizzle/actions/workflows/release.yml/badge.svg)](https://github.com/jason-dark/supabase-drizzle/actions/workflows/release.yml)


## Overview

**`supabase-drizzle`** lets you manage Postgres RLS policies with Drizzle-like syntax, just as you manage your Postgres schema..

---

## Motivation 💡

Drizzle ORM makes managing your database schema in TypeScript and handling migrations simple. However, managing RLS policies still requires manual SQL or using the Supabase dashboard, which can slow down your workflow.

**`supabase-drizzle`** aims to streamline this process, making RLS policy management as easy and intuitive as managing your schema with Drizzle, so you can move faster.

---

## Installation 🛠

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
Define RLS policies for your tables in `policies.config.ts`:
```typescript
// policies.config.ts

import { allowAllAccess, denyAllAccess, rlsPolicyBuilder, userIsOwner } from 'supabase-drizzle';

// You can define policies for each method on a table like this:
const timeLogsTablePolicy = rlsPolicyBuilder('time_logs', {
  insert: userIsOwner(),
  update: userIsOwner(),
  delete: denyAllAccess(),
  select: allowAllAccess(),
});

// You can apply the same policy to all methods like this:
const salariesTablePolicy = rlsPolicyBuilder('salaries', {
  all: denyAllAccess(),
});

// Make sure your policies are exported from the file!
export { salariesTablePolicy, timeLogsTablePolicy };
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
For ease of use, consider adding these scripts to your `package.json`:
```json
// Make sure to point to the correct config file location for your project

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
## Documentation 📚

### **`rlsPolicyBuilder(tableName: string, policies: PolicyConditions)`**

Defines the RLS policies for a given table. Requires two arguments; the table name and an object that describes its RLS policies. Make sure to only reference tables by their names as defined in your Drizzle schema.
```typescript
const timeLogsTablePolicy = rlsPolicyBuilder('todos', {
  insert: userIsOwner(),
  update: userIsOwner(),
  delete: userIsOwner(),
  select: allowAllAccess(),
});

export { timeLogsTablePolicy };
```

### **`userIsOwner()`**

Allows access to only the owner of a row for a given method, or for all methods. Ownership is determined by matching the `user_id` column on the table with the authenticated user's id. In this example, only the owner can `INSERT` or `UPDATE` the row: 
```typescript
const timeLogsTablePolicy = rlsPolicyBuilder('time_logs', {
  insert: userIsOwner(),
  update: userIsOwner(),
  delete: denyAllAccess(),
  select: allowAllAccess(),
});
```
You can also apply this policy to **all** methods. In this example, only the owner can `INSERT`, `UPDATE`, `DELETE`, and `SELECT` their row.
```typescript
const timeLogsTablePolicy = rlsPolicyBuilder('hr_complaints', {
  all: userIsOwner(),
});
```

### **`denyAllAccess()`**

Denies access to all users for a given method, or for all methods on table: 
```typescript
const timeLogsTablePolicy = rlsPolicyBuilder('leave_balances', {
  insert: denyAllAccess(),
  update: denyAllAccess(),
  delete: denyAllAccess(),
  select: userIsOwner(),
});
```
```typescript
const timeLogsTablePolicy = rlsPolicyBuilder('pay_rises', {
  all: denyAllAccess()
});
```

###  **`allowAllAccess()`**

Allows access to all users for a given method, or for all methods on table: 
```typescript
const timeLogsTablePolicy = rlsPolicyBuilder('staff_birthdays', {
  select: allowAllAccess(),
  insert: userIsOwner(),
  update: userIsOwner(),
  delete: userIsOwner(),
});
```
You *can* allow all access to all methods on a table, but this is almost always **not something you should do**. Exercise extreme caution with this!
```typescript
const timeLogsTablePolicy = rlsPolicyBuilder('executive_salaries', {
  all: allowAllAccess()
});
```
---
## Limitations 🚫 

- I have only tested this lib on MacOS. I expect it will work on *nix systems but not Windows. If there is enough interest I might look into it.
- Only Typescript [Drizzle Kit config](https://orm.drizzle.team/docs/drizzle-config-file) files are supported. Plain JavaScript will not work. Again, if there's enough interest I might look into it.

---
## Contributing 🤝

Contributions are welcome. I am a single developer who built this to solve a problem I had, so if there's a feature you specifically want feel free to open a [pull request](https://github.com/jason-dark/supabase-drizzle/pulls).

---
## License 📝

This project is licensed under the [MIT License](./LICENSE).

---
## Disclaimers❗ 

- **`supabase-drizzle`** is not an official library affiliated with the Supabase or Drizzle teams.
- I make no guarantees that this lib is bug free.
- I strongly suggest that you manually review generated SQL for RLS migrations before running them.
- Exercise extreme caution and test thoroughly before using this lib on production databases.

---
## TODOs 🚧
- [x] Implement `userIsOwner()`, `allowAllAccess()`, and `denyAllAccess()` functions.
- [ ] Implement additional RLS policy utility functions (e.g., `userIsAdmin`, `userHasRole`).
- [ ] Add more detailed error handling and logging for RLS policy generation.
- [ ] Write tests.
 
 ---