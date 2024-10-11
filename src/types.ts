type SqlMethod = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';

type PolicyConditions<T extends (...args: unknown[]) => unknown> =
  | ({ [K in Lowercase<Exclude<SqlMethod, 'ALL'>>]: ReturnType<T> } & { all?: never })
  | ({ all: ReturnType<T> } & { [K in Lowercase<Exclude<SqlMethod, 'ALL'>>]?: never });

type TableAccess = 'PUBLIC_ACCESS' | 'USER_IS_OWNER' | 'DENY_ALL';

type PermissiveAccess = Extract<TableAccess, 'PUBLIC_ACCESS' | 'USER_IS_OWNER'>;

export type { PermissiveAccess, PolicyConditions, SqlMethod, TableAccess };
