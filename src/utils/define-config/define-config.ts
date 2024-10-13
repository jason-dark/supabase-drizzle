import { Config as DrizzleConfig, defineConfig as drizzleDefineConfig } from 'drizzle-kit';

type DefineConfigProps = DrizzleConfig & { policies: string };

/**
 * Extends the `drizzle-kit` version of `defineConfig` to include a `policies` option.
 *
 * This function allows you to define the configuration for Drizzle, while also
 * adding a `policies` option for managing Postgres RLS policies.
 *
 *  */
const defineConfig = (config: DefineConfigProps) => drizzleDefineConfig(config);

export { defineConfig };
export type { DefineConfigProps };
