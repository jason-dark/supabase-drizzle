import type { Config } from 'jest';
import tsconfig from './tsconfig.json';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const moduleNameMapper = require('tsconfig-paths-jest')(tsconfig);

const config: Config = {
  clearMocks: true,
  coverageProvider: 'v8',
  preset: 'ts-jest',
  moduleNameMapper,
};

export default config;
