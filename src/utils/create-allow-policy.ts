import { PermissiveAccess, SqlMethod } from '../types';
import { getPolicyName } from './get-policy-name';
import { getPolicyQualification } from './get-policy-qualification';

type CreateAllowPolicyProps = { access: PermissiveAccess; tableName: string; method: SqlMethod };

const createAllowPolicy = ({ tableName, method, access }: CreateAllowPolicyProps) => {
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
