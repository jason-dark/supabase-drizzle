import { SqlMethod, TableAccess } from '../types';
import { USER_HAS_ROLE_DB_FUNC_NAME } from '@/constants';

type CommonProps = {
  method: SqlMethod;
};

type WithUserRoleProps = {
  access: Extract<TableAccess, 'USER_HAS_ROLE'>;
  userRole: string[];
  tableName: string;
};

type WithoutUserRoleProps = {
  access: Exclude<TableAccess, 'USER_HAS_ROLE'>;
  userRole?: never;
  tableName?: never;
};

type GetPolicyQualificationProps = CommonProps & (WithUserRoleProps | WithoutUserRoleProps);

const getPolicyQualification = ({
  method,
  access,
  tableName = '',
  userRole = [],
}: GetPolicyQualificationProps) => {
  const upperMethod = method.toUpperCase();

  const orgIdColumnName = tableName == 'orgs' ? 'id' : 'org_id';

  const statements: Record<'using' | 'withCheck', Record<TableAccess, string>> = {
    using: {
      PUBLIC_ACCESS: 'USING ( true )',
      USER_IS_OWNER: 'USING ( (select auth.uid()) = user_id )',
      USER_HAS_ROLE: `USING ( auth.${USER_HAS_ROLE_DB_FUNC_NAME} (ARRAY[${userRole.map((role) => `'${role}'`).join(', ')}], ${tableName}.${orgIdColumnName}) )`,
      DENY_ALL: 'USING ( false )',
    },
    withCheck: {
      PUBLIC_ACCESS: 'WITH CHECK ( true )',
      USER_IS_OWNER: 'WITH CHECK ( (select auth.uid()) = user_id )',
      USER_HAS_ROLE: `WITH CHECK ( auth.${USER_HAS_ROLE_DB_FUNC_NAME} (ARRAY[${userRole.map((role) => `'${role}'`).join(', ')}], ${tableName}.${orgIdColumnName}) )`,
      DENY_ALL: 'WITH CHECK ( false )',
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
