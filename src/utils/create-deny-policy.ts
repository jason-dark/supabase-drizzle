import { SqlMethod } from '../types';
import { getPolicyName } from './get-policy-name';
import { getPolicyQualification } from './get-policy-qualification';

type CreateDenyPolicyProps = { tableName: string; method: SqlMethod };

const createDenyPolicy = ({ tableName, method }: CreateDenyPolicyProps) => {
  return (
    [
      `CREATE POLICY`,
      getPolicyName({ access: 'DENY_ALL', method }),
      `ON "public"."${tableName}"`,
      `AS RESTRICTIVE`,
      `FOR ${method.toUpperCase()}`,
      `TO public`,
      getPolicyQualification({ access: 'DENY_ALL', method }),
    ].join(' ') + `;`
  );
};

export { createDenyPolicy };
export type { CreateDenyPolicyProps };
