import { SqlMethod, TableAccess } from '../../types';

type CommonProps = {
  method: SqlMethod;
};

type WithUserRoleProps = {
  access: Extract<TableAccess, 'HAS_ROLE'>;
  userRole: string[];
  tableName: string;
  tenantsTable?: string;
  userRolesTable: string;
};

type WithoutUserRoleProps = {
  access: Exclude<TableAccess, 'HAS_ROLE'>;
  userRole?: never;
  tableName?: never;
  tenantsTable?: never;
  userRolesTable?: never;
};

type GetPolicyQualificationProps = CommonProps & (WithUserRoleProps | WithoutUserRoleProps);

const getPolicyQualification = ({
  method,
  access,
  userRole = [],
  tenantsTable,
  tableName,
}: GetPolicyQualificationProps) => {
  const upperMethod = method.toUpperCase();

  const userRolesArrayString = userRole.map((role) => `'${role}'`).join(', ');

  const singleTenantRoleCheck = `(auth.jwt() -> 'app_metadata' -> 'claims' ->> 'user_role') IN (${userRolesArrayString})`;

  const tenantIdKey = tenantsTable === tableName ? 'id' : 'tenant_id';

  const multiTenantRoleCheck = `EXISTS ( SELECT 1 FROM JSONB_ARRAY_ELEMENTS(auth.jwt () -> 'app_metadata' -> 'tenants') AS tenants WHERE (tenants ->> 'tenant_id')::UUID = ${tenantIdKey} AND (tenants ->> 'user_role') IN (${userRolesArrayString}) )`;

  const statements: Record<'using' | 'withCheck', Record<TableAccess, string>> = {
    using: {
      PUBLIC_ACCESS: 'USING ( true )',
      AUTHENTICATED: 'USING ( true )',
      USER_IS_OWNER: 'USING ( (select auth.uid()) = user_id )',
      HAS_ROLE: `USING ( ${tenantsTable ? multiTenantRoleCheck : singleTenantRoleCheck} )`,
    },
    withCheck: {
      PUBLIC_ACCESS: 'WITH CHECK ( true )',
      AUTHENTICATED: 'WITH CHECK ( true )',
      USER_IS_OWNER: 'WITH CHECK ( (select auth.uid()) = user_id )',
      HAS_ROLE: `WITH CHECK ( ${tenantsTable ? multiTenantRoleCheck : singleTenantRoleCheck} )`,
    },
  };

  let qualification = '';

  if (upperMethod === 'SELECT' || upperMethod === 'UPDATE' || upperMethod === 'DELETE') {
    qualification = statements.using[access];
  }

  if (upperMethod === 'INSERT') {
    qualification = statements.withCheck[access];
  }

  if (upperMethod === 'ALL') {
    qualification = `${statements.using[access]} ${statements.withCheck[access]}`;
  }

  return qualification;
};

export { getPolicyQualification };
