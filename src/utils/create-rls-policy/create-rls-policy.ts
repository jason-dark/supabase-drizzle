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

type BelongsTenantProps = {
  access: Extract<TableAccess, 'BELONGS_TENANT'>;
  userRole?: never;
  tenantsTable: string;
  userRolesTable?: never;
};

type CreateRlsPolicyProps = CommonProps & (WithoutRoleProps | WithRoleProps | BelongsTenantProps);

const createRlsPolicy = ({
  tableName,
  method,
  access,
  userRole,
  tenantsTable,
  userRolesTable,
}: CreateRlsPolicyProps): string => {
  // TODO: Refactor this props logic so that we aren't duplicating the types for createRlsPolicy and getPolicyQualification
  const getPolicyQualificationProps = () => {
    switch (access) {
      case 'HAS_ROLE':
        return { method, access, userRole, tenantsTable, userRolesTable };
      case 'BELONGS_TENANT':
        return { method, access, tenantsTable };
      default:
        return { method, access };
    }
  };

  return (
    [
      `CREATE POLICY`,
      getPolicyName({ access, method }),
      `ON "public"."${tableName}"`,
      `AS PERMISSIVE`,
      `FOR ${method.toUpperCase()}`,
      getPolicyRole({ access }),
      getPolicyQualification(getPolicyQualificationProps()),
    ]
      .filter((statement) => statement)
      .join(' ') + `;`
  );
};

export { createRlsPolicy };
export type { CreateRlsPolicyProps };
