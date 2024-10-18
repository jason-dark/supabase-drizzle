import { defineConfig as drizzleDefineConfig } from 'drizzle-kit';
import { DefineConfigProps } from '../../types';
import { defineConfig } from './define-config';

describe('defineConfig', () => {
  it('should return the same value as defineConfig from drizzle-kit', () => {
    const config: DefineConfigProps = {
      schema: 'drizzle/schema.ts',
      out: 'drizzle/migrations',
      dialect: 'postgresql',
      dbCredentials: {
        url: '',
      },
      schemaFilter: ['public'],
      policies: 'drizzle/policies.ts',
    };

    expect(defineConfig(config)).toBe(drizzleDefineConfig(config));
  });
});
