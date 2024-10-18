import { pgSchema, pgTable, text, uuid } from 'drizzle-orm/pg-core';

const authSchema = pgSchema('auth');

const users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

const userRoles = pgTable('user_roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .unique()
    .notNull(),
  userRole: text('user_role').notNull(),
});

const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
});

const todos = pgTable('todos', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  title: text('title'),
  lastName: text('description'),
});

export { profiles, todos, userRoles };
