import { resolve } from 'path';
import { rlsPolicyBuilder } from '@/rls-policy-builder';
import { runtimeLoadTsFile } from '@/utils/runtime-load-ts-file/runtime-load-ts-file';

type PoliciesContent = Record<string, ReturnType<ReturnType<typeof rlsPolicyBuilder>['rls']>>;

const readRlsConfigFromFile = async (policiesFilePath?: string) => {
  if (!policiesFilePath) {
    console.error('Error: unable to find the policies file.');
    process.exit(1);
  }

  const resolvedPoliciesPath = resolve(process.cwd(), policiesFilePath);

  let policiesContent: PoliciesContent | undefined;

  try {
    policiesContent = await runtimeLoadTsFile<PoliciesContent>(resolvedPoliciesPath);
  } catch {
    console.error('Error: unable to read the policies file.');
    process.exit(1);
  }

  return policiesContent;
};

export { readRlsConfigFromFile };
