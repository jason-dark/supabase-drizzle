import { SqlMethod, TableAccess } from '../../types';
import { getPolicyName } from '../get-policy-name/get-policy-name';
import { getPolicyQualification } from '../get-policy-qualification/get-policy-qualification';
import { getPolicyRole } from '../get-policy-role/get-policy-role';

type CommonProps = {
  tableName: string;
  method: SqlMethod;
};

type WithoutRoleProps = {
  access: Exclude<TableAccess, 'HAS_ROLE'>;
  userRole?: never;
  userRolesTable?: never;
  tenantsTable?: never;
};

type WithRoleProps = {
  access: Extract<TableAccess, 'HAS_ROLE'>;
  userRole: string[];
  userRolesTable: string;
  tenantsTable?: string;
};

type CreateRlsPolicyProps = CommonProps & (WithoutRoleProps | WithRoleProps);

const createRlsPolicy = ({
  tableName,
  method,
  access,
  userRole,
  tenantsTable,
  userRolesTable,
}: CreateRlsPolicyProps): string => {
  return (
    [
      `CREATE POLICY`,
      getPolicyName({ access, method }),
      `ON "public"."${tableName}"`,
      `AS PERMISSIVE`,
      `FOR ${method.toUpperCase()}`,
      getPolicyRole({ access }),
      getPolicyQualification(
        access === 'HAS_ROLE'
          ? { method, access, userRole, tableName, tenantsTable, userRolesTable }
          : { method, access }
      ),
    ]
      .filter((statement) => statement)
      .join(' ') + `;`
  );
};

export { createRlsPolicy };
export type { CreateRlsPolicyProps };
