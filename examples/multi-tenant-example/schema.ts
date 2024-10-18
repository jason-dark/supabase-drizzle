import { pgSchema, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core';

const authSchema = pgSchema('auth');

const users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

// Must define a table named `tenants` for multi-tenant support
const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
});

// All other tables must have a `tenantId` column for multi-tenant support
const userRoles = pgTable(
  'user_roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id)
      .unique()
      .notNull(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id)
      .notNull(),
    userRole: text('user_role').notNull(),
  },
  (t) => ({ unq: unique().on(t.userId, t.tenantId, t.userRole) })
);

// All other tables must have a `tenantId` column for multi-tenant support
const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  tenantId: uuid('tenant_id').references(() => tenants.id),
});

// All other tables must have a `tenantId` column for multi-tenant support
const todos = pgTable('todos', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  title: text('title'),
  lastName: text('description'),
  tenantId: uuid('tenant_id').references(() => tenants.id),
});

export { profiles, tenants, todos, userRoles };
