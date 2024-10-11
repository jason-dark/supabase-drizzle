# `supabase-drizzle` 🚀

[![npm version](https://img.shields.io/npm/v/supabase-drizzle)](https://www.npmjs.com/package/supabase-drizzle)
[![License](https://img.shields.io/github/license/jason-dark/supabase-drizzle)](./LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/jason-dark/supabase-drizzle/ci.yml)](https://github.com/jason-dark/supabase-drizzle/actions)


## Overview

**`supabase-drizzle`** helps you manage Postgres RLS policies with a Drizzle like syntax in the same way you use Drizzle to manage your Postgres schema.

---

## Motivation 💡

Using an ORM like Drizzle makes it easy to manage your database schema in Typescript and perform migrations. However there is no support for managing RLS policies. Having to manually write RLS policies in SQL or via the Supabase dashboard adds time to your workflow. 

The goal of **`supabase-drizzle`** is to help you move faster by making RLS policy management as simple as your Drizzle schema management.

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

**1]** Follow the Drizzle setup guide for Supabase, then come back here and carry on to step 2.

**2]** Add a file `policies.config.ts` in the same directory as your `drizzle.config.ts` file.

**3]** In `drizzle.config.ts`, import `defineConfig` from `supabase-drizzle` instead of `drizzle-kit`:
```diff
- import { defineConfig } from 'drizzle-kit';
+ import { defineConfig } from 'supabase-drizzle';
```
Your config file will now support a `policies` option. This should point to the policies file you make in step 2, `policies.config.ts`:
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
**4]** Define RLS policies for your tables in `policies.config.ts`:
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
**5]** Generate your RLS policy migration:
```bash
# Make sure the file path to the config file is correct for you
npx supabase-drizzle generate --config drizzle/drizzle.config.ts
```
**6]** Run the migration using drizzle:
```bash
npx drizzle-kit migrate --config drizzle/drizzle.config.ts
```
**7]** For ease of use, consider adding these scripts to your `package.json`:
```json
{

  "scripts": {
    "drizzle-generate-schema": "npx drizzle-kit generate --config drizzle/drizzle.config.ts",
    "drizzle-generate-rls": "npx supabase-drizzle generate --config drizzle/drizzle.config.ts",
    "drizzle-migrate": "npx drizzle-kit migrate --config drizzle/drizzle.config.ts"
  }
}
```
Then you can run:
```bash
yarn drizzle-generate-schema && drizzle-generate-rls && yarn drizzle-migrate
#or
npm run drizzle-generate-schema && npm run drizzle-generate-rls && npm run yarn drizzle-migrate
```
To generate migrations for your schema, your RLS policies, and push them to your DB in one go!

---
## Documentation 📚

**`userIsOwner()`**

Allows access to only the owner of a row for a given method, or for all methods. Ownership is determined by matching the `user_id` column on the table with the authenticated user's id. In this example, only the owner can `INSERT` or `UPDATE` the row: 
```typescript
const timeLogsTablePolicy = rlsPolicyBuilder('time_logs', {
  insert: userIsOwner(),
  update: userIsOwner(),
  delete: denyAllAccess(),
  select: allowAllAccess(),
});
```
You can also apply this policy to all methods. In this example, only the owner can `INSERT`, `UPDATE`, `DELETE`, and `SELECT` their row.
```typescript
const timeLogsTablePolicy = rlsPolicyBuilder('hr_complaints', {
  all: userIsOwner(),
});
```
**`denyAllAccess()`**

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

**`allowAllAccess()`**

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

- I have not tested this package on windows. If there is enough interest I might look into it.
- Only Typescript Supabase config is supported. Plain JS will not work.

---
## Contributing 🤝

Contributions are welcome. I am a single developer who built this to solve a problem I had, so if there's a feature you specifically want feel free to open a pull request.

---
## License 📝

This project is licensed under the MIT License.

---
## Disclaimers❗ 

- **`supabase-drizzle`** is not an official library affiliated with the Supabase or Drizzle teams.
- This library is not yet battle tested. Exercise extreme caution and test thoroughly before using it on production databases. I make no guarantees that this lib is bug free.

---
## TODOs 🚧
- [x] Implement `userIsOwner()`, `allowAllAccess()`, and `denyAllAccess()` functions.
- [ ] Implement additional RLS policy utility functions (e.g., `userIsAdmin`, `userHasRole`).
- [ ] Add more detailed error handling and logging for RLS policy generation.
- [ ] Write tests.
 
 ---