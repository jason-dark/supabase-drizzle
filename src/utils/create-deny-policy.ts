import { SqlMethod } from '../types';
import { getPolicyName } from './get-policy-name';
import { getPolicyQualification } from './get-policy-qualification';

type CreateDenyPolicyProps =
  | { tableName: string; forTable: true; method?: never }
  | { tableName: string; forTable?: never; method: SqlMethod };

const createDenyPolicy = ({ tableName, forTable, method }: CreateDenyPolicyProps) => {
  if (forTable) {
    return (
      [
        `CREATE POLICY`,
        getPolicyName({ access: 'DENY_ALL', method: 'ALL' }),
        `ON "public"."${tableName}"`,
        `AS RESTRICTIVE FOR ALL`,
        `TO public`,
        getPolicyQualification({ access: 'DENY_ALL', method: 'ALL' }),
      ].join(' ') + `;`
    );
  }

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
