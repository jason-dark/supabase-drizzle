import { Config as DrizzleConfig, defineConfig as drizzleDefineConfig } from 'drizzle-kit';

type DefineConfigProps = DrizzleConfig & { policies: string };

const defineConfig = (config: DefineConfigProps) => drizzleDefineConfig(config);

export { defineConfig };
export type { DefineConfigProps };
