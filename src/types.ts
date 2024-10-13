type SqlMethod = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';

type PolicyConditionValue<T extends (...args: never[]) => unknown> =
  | ReturnType<T>
  | ReturnType<T>[];

type PolicyConditionsAllMethods<T extends (...args: never[]) => unknown> = {
  all: PolicyConditionValue<T>;
} & { [K in Lowercase<Exclude<SqlMethod, 'ALL'>>]?: never };

type PolicyConditionsSingleMethods<T extends (...args: never[]) => unknown> = {
  [K in Lowercase<Exclude<SqlMethod, 'ALL'>>]: PolicyConditionValue<T>;
} & { all?: never };

type PolicyConditions<T extends (...args: never[]) => unknown> =
  | PolicyConditionsAllMethods<T>
  | PolicyConditionsSingleMethods<T>;

type TableAccess = 'PUBLIC_ACCESS' | 'DENY_ALL' | 'USER_IS_OWNER' | 'USER_HAS_ROLE';

export type { PolicyConditions, PolicyConditionValue, SqlMethod, TableAccess };
