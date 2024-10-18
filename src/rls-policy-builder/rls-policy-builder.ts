import { toSnakeCase } from 'drizzle-orm/casing';
import { getTableConfig, PgTable, TableConfig } from 'drizzle-orm/pg-core';
import { PolicyConditions, PolicyConditionValue, SnakeCase, SqlMethod } from '../types';
import { createRlsPolicy, CreateRlsPolicyProps } from '../utils/create-rls-policy/';

type UserRolesTableMultiTenant = {
  $inferSelect:
    | { userId: string; tenantId: string; userRole: string }
    | { user_id: string; tenant_id: string; user_role: string };
};

type UserRolesTableSingleTenant = {
  $inferSelect: { userId: string; userRole: string } | { user_id: string; user_role: string };
};

type NoTenantProps = {
  userRoles?: never;
  tenantsTable?: never;
  userRolesTable?: never;
};

type MultiTenantProps = {
  userRoles: Record<string, object>;
  tenantsTable: { $inferSelect: { id: string } };
  userRolesTable: UserRolesTableMultiTenant;
};

type SingleTenantProps = {
  userRoles: Record<string, object>;
  tenantsTable?: never;
  userRolesTable: UserRolesTableSingleTenant;
};

const rlsPolicyBuilder = <
  S extends {
    [key: string]: {
      $inferSelect: object;
    };
  },
  C extends NoTenantProps | MultiTenantProps | SingleTenantProps,
>(
  schema: S,
  config: C
) => {
  const userRolesTable = config?.userRolesTable
    ? getTableConfig(config.userRolesTable as unknown as PgTable).name
    : '';

  const tenantsTable = config?.tenantsTable
    ? getTableConfig(config.tenantsTable as unknown as PgTable).name
    : '';

  type TableName = SnakeCase<Extract<keyof S, string>>;

  const tables = Object.entries(schema).reduce(
    (acc, [tableName, tableFunc]) => ({
      ...acc,
      [tableName]: getTableConfig(tableFunc as PgTable<TableConfig>).name,
    }),
    {} as Record<keyof S, TableName>
  );

  type RoleName = SnakeCase<Extract<keyof C['userRoles'], string>>;

  const userRoles = Object.entries(config?.userRoles ?? {}).reduce(
    (acc, [role]) => ({ ...acc, [role]: toSnakeCase(role) }),
    {} as Record<keyof C['userRoles'], RoleName>
  );

  const everyone =
    () =>
    ({ method, tableName }: Omit<CreateRlsPolicyProps, 'access'>) =>
      createRlsPolicy({ access: 'PUBLIC_ACCESS', method, tableName });

  const own =
    () =>
    ({ method, tableName }: Omit<CreateRlsPolicyProps, 'access'>) =>
      createRlsPolicy({ access: 'USER_IS_OWNER', method, tableName });

  const authenticated =
    () =>
    ({ method, tableName }: Omit<CreateRlsPolicyProps, 'access'>) =>
      createRlsPolicy({ access: 'AUTHENTICATED', method, tableName });

  const hasRole =
    (userRole: RoleName | RoleName[]) =>
    ({ method, tableName }: Omit<CreateRlsPolicyProps, 'access'>) =>
      createRlsPolicy({
        access: 'HAS_ROLE',
        userRole: Array.isArray(userRole) ? userRole : [userRole],
        method,
        tableName,
        tenantsTable,
        userRolesTable,
      });

  type Policy = typeof everyone | typeof own | typeof hasRole | typeof authenticated;

  // TODO: More strongly type TableName so that if multi-tenant is enabled, each table has to have a tenant_id column,
  // except for the tenants table which must have an id column. Right now the user gets no type error so this fails at migration time.
  const rls = (tableName: TableName, conditions: PolicyConditions<Policy>) => ({
    func: () => {
      const sqlStatements: string[] = [
        `-- Define RLS policies for "public"."${tableName}"`,
        `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`,
      ];

      // If the `all` property is provided, we only process that property and ignore the rest.
      // This guards against type errors being ignored by the user.
      const cleanedConditions = conditions?.all ? { all: conditions.all } : conditions;

      // For each method (ALL, SELECT, INSERT, UPDATE, DELETE), generate the SQL statement for the policy(ies) provided
      Object.entries(cleanedConditions).forEach((entry) => {
        const [method, policy] = entry as [SqlMethod, PolicyConditionValue<Policy>];
        // Policies can be a single function or an array of functions, so we normalize it to an array.
        const conditionValues = Array.isArray(policy) ? policy : [policy];
        conditionValues.forEach((policy) => {
          sqlStatements.push(policy({ tableName, method }));
        });
      });

      return sqlStatements.join('\n');
    },
    tableName,
    userRoles,
    userRolesTable,
    tenantsTable,
  });

  return {
    tables,
    roles: userRoles,
    rls,
    everyone,
    own,
    authenticated,
    hasRole,
  };
};

export { rlsPolicyBuilder };
