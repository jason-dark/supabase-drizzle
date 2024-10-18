import { resolve } from 'path';
import { DefineConfigProps } from '@/types';
import { runtimeLoadTsFile } from '@/utils/runtime-load-ts-file/runtime-load-ts-file';

export const readDrizzleConfigFromFile = async (configPath?: string) => {
  if (!configPath) {
    console.error('Error: --config <path> is required.');
    process.exit(1);
  }

  const resolvedConfigPath = resolve(process.cwd(), configPath);

  let configContent: DefineConfigProps | undefined;

  try {
    configContent = await runtimeLoadTsFile<DefineConfigProps>(resolvedConfigPath);
  } catch {
    console.error('Error: unable to read the config file.');
    process.exit(1);
  }

  // We want to make sure this exists before we continue
  if (!configContent?.policies) {
    console.error('Error: unable to find the policies path in the config file.');
    process.exit(1);
  }

  return configContent;
};
