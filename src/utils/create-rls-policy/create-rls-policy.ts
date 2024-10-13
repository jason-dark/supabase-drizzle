import { SqlMethod, TableAccess } from '../../types';
import { getPolicyAuthorization } from '../get-policy-authorization';
import { getPolicyName } from '../get-policy-name';
import { getPolicyQualification } from '../get-policy-qualification';
import { getPolicyRole } from '../get-policy-role';

type CommonProps = {
  tableName: string;
  method: SqlMethod;
};

type WithoutRoleProps = {
  access: Exclude<TableAccess, 'USER_HAS_ROLE'>;
  userRole?: never;
};

type WithRoleProps = {
  access: Extract<TableAccess, 'USER_HAS_ROLE'>;
  userRole: string[];
};

type CreateRlsPolicyProps = CommonProps & (WithoutRoleProps | WithRoleProps);

const createRlsPolicy = ({ tableName, method, access, userRole }: CreateRlsPolicyProps): string => {
  return (
    [
      `CREATE POLICY`,
      getPolicyName({ access, method }),
      `ON "public"."${tableName}"`,
      getPolicyAuthorization({ access }),
      `FOR ${method.toUpperCase()}`,
      getPolicyRole({ access }),
      getPolicyQualification(
        access === 'USER_HAS_ROLE' ? { method, access, userRole, tableName } : { method, access }
      ),
    ]
      .filter((statement) => statement)
      .join(' ') + `;`
  );
};

export { createRlsPolicy };
export type { CreateRlsPolicyProps };
