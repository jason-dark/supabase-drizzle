import { SqlMethod, TableAccess } from '../../types';

type CommonProps = {
  method: SqlMethod;
};

type WithUserRoleProps = {
  access: Extract<TableAccess, 'HAS_ROLE'>;
  userRole: string[];
  tenantsTable?: string;
  userRolesTable: string;
};

type WithoutUserRoleProps = {
  access: Exclude<TableAccess, 'HAS_ROLE'>;
  userRole?: never;
  tenantsTable?: never;
  userRolesTable?: never;
};

type BelongsTenantProps = {
  access: Extract<TableAccess, 'BELONGS_TENANT'>;
  userRole?: never;
  tenantsTable: string;
  userRolesTable?: never;
};

type GetPolicyQualificationProps = CommonProps &
  (WithUserRoleProps | WithoutUserRoleProps | BelongsTenantProps);

const getPolicyQualification = ({
  method,
  access,
  userRole = [],
  tenantsTable,
}: GetPolicyQualificationProps) => {
  const upperMethod = method.toUpperCase();

  const userRolesArrayString = userRole.map((role) => `'${role}'`).join(', ');

  const tenantRoleCheck = {
    multiTenant: `EXISTS ( SELECT 1 FROM JSONB_ARRAY_ELEMENTS(auth.jwt () -> 'app_metadata' -> 'tenants') AS tenants WHERE (tenants ->> 'tenant_id')::UUID = tenant_id AND (tenants ->> 'user_role') IN (${userRolesArrayString}) )`,
    singleTenant: `(auth.jwt() -> 'app_metadata' -> 'user_role') IN (${userRolesArrayString})`,
  };

  const tenantMemberCheck = `EXISTS ( SELECT 1 FROM JSONB_ARRAY_ELEMENTS(auth.jwt () -> 'app_metadata' -> 'tenants') AS tenants WHERE (tenants ->> 'tenant_id')::UUID = tenant_id )`;

  const statements: Record<'using' | 'withCheck', Record<TableAccess, string>> = {
    using: {
      PUBLIC_ACCESS: 'USING ( true )',
      AUTHENTICATED: 'USING ( true )',
      USER_IS_OWNER: 'USING ( (select auth.uid()) = user_id )',
      HAS_ROLE: `USING ( ${tenantsTable ? tenantRoleCheck.multiTenant : tenantRoleCheck.singleTenant} )`,
      BELONGS_TENANT: `USING ( ${tenantMemberCheck} )`,
    },
    withCheck: {
      PUBLIC_ACCESS: 'WITH CHECK ( true )',
      AUTHENTICATED: 'WITH CHECK ( true )',
      USER_IS_OWNER: 'WITH CHECK ( (select auth.uid()) = user_id )',
      HAS_ROLE: `WITH CHECK ( ${tenantsTable ? tenantRoleCheck.multiTenant : tenantRoleCheck.singleTenant} )`,
      BELONGS_TENANT: `USING ( ${tenantMemberCheck} )`,
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
