import { defineConfig as drizzleDefineConfig } from 'drizzle-kit';
import { DefineConfigProps } from '@/types';

/**
 * Extends the `drizzle-kit` version of `defineConfig` to include `policies` and `multiTenant` options.
 *
 * This function allows you to define the configuration for Drizzle, while also
 * adding a `policies` option for managing Postgres RLS policies and a `multiTenant` option for managing multi-tenant configurations.
 *
 * @example
 * ```ts
 * defineConfig({
 *     schema: 'drizzle/schema.ts',
 *     out: 'drizzle/migrations',
 *     dialect: 'postgresql',
 *     dbCredentials: {
 *         url: process.env.DATABASE_URL || '',
 *     },
 *     schemaFilter: ['public'],
 *     policies: 'drizzle/policies.ts',
 * });
 * ```
 */
const defineConfig = (config: DefineConfigProps) =>
  drizzleDefineConfig(config) as DefineConfigProps;

export { defineConfig };
