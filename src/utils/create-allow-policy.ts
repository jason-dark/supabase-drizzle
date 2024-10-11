import { PermissiveAccess, SqlMethod } from '../types';
import { getPolicyName } from './get-policy-name';
import { getPolicyQualification } from './get-policy-qualification';

type CreateAllowPolicyProps =
  | { access: PermissiveAccess; tableName: string; forTable: true; method?: never }
  | { access: PermissiveAccess; tableName: string; forTable?: never; method: SqlMethod };

const createAllowPolicy = ({ tableName, forTable, method, access }: CreateAllowPolicyProps) => {
  if (forTable) {
    return (
      [
        `CREATE POLICY`,
        getPolicyName({ access, method: 'ALL' }),
        `ON "public"."${tableName}"`,
        `AS PERMISSIVE FOR ALL`,
        `TO public`,
        getPolicyQualification({ access, method: 'ALL' }),
      ].join(' ') + `;`
    );
  }

  return (
    [
      `CREATE POLICY`,
      getPolicyName({ access, method }),
      `ON "public"."${tableName}"`,
      `AS PERMISSIVE`,
      `FOR ${method.toUpperCase()}`,
      `TO public`,
      getPolicyQualification({ access, method }),
    ].join(' ') + `;`
  );
};

export { createAllowPolicy };
export type { CreateAllowPolicyProps };
