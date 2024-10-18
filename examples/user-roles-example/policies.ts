import { rlsPolicyBuilder } from 'supabase-drizzle';
import * as schema from './schema';

const { tables, own, rls, authenticated, everyone, hasRole } = rlsPolicyBuilder(schema, {
  userRolesTable: schema.userRoles,
  userRoles: {
    owner: {},
    admin: {},
    member: {},
  },
});

const userRoles = rls(tables.userRoles, {
  insert: hasRole(['admin', 'owner']), // Only admin and owner can insert a user role,
  update: hasRole(['admin', 'owner']), // Only admin and owner can update a user role,
  select: authenticated(), // Authenticated users can select user roles,
});

const profiles = rls(tables.profiles, {
  insert: authenticated(), // User can create their profile row if authenticated
  update: own(), // User can update their own profile row
  select: everyone(), // Everyone can select all profile rows
  delete: hasRole('owner'), // Only owner can delete a profile row,
});

const todos = rls(tables.todos, {
  insert: authenticated(), // User can create a todo row if authenticated
  update: own(), // User can update their own todo row
  select: own(), // User can select their own todo row
  delete: [own(), hasRole(['admin', 'owner'])], // User can delete their own todo row and admin and owner can delete any todo row,
});

export { profiles, todos, userRoles };
