import { rlsPolicyBuilder } from 'supabase-drizzle';
import * as schema from './schema';

const { tables, own, rls, authenticated, everyone } = rlsPolicyBuilder(schema, {});

const profiles = rls(tables.profiles, {
  insert: authenticated(), // User can create their profile row if authenticated
  update: own(), // User can update their own profile row
  select: everyone(), // Everyone can select all profile rows
});

const todos = rls(tables.todos, {
  insert: authenticated(), // User can create a todo row if authenticated
  update: own(), // User can update their own todo row
  select: own(), // User can select their own todo row
  delete: own(), // User can delete their own todo row
});

export { profiles, todos };
