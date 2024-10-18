import { Config as DrizzleConfig } from 'drizzle-kit';

type SqlMethod = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';

type PolicyConditionValue<T extends (...args: never[]) => unknown> =
  | ReturnType<T>
  | ReturnType<T>[];

type PolicyConditionsAllMethods<T extends (...args: never[]) => unknown> = {
  all: PolicyConditionValue<T>;
} & { [K in Lowercase<Exclude<SqlMethod, 'ALL'>>]?: never };

type PolicyConditionsSingleMethods<T extends (...args: never[]) => unknown> = {
  [K in Lowercase<Exclude<SqlMethod, 'ALL'>>]?: PolicyConditionValue<T>;
} & { all?: never };

type PolicyConditions<T extends (...args: never[]) => unknown> =
  | PolicyConditionsAllMethods<T>
  | PolicyConditionsSingleMethods<T>;

type TableAccess = 'PUBLIC_ACCESS' | 'USER_IS_OWNER' | 'HAS_ROLE' | 'AUTHENTICATED';

type SnakeCase<S extends string> = S extends `${infer First}${infer Rest}`
  ? First extends Uppercase<First>
    ? `_${Lowercase<First>}${SnakeCase<Rest>}`
    : `${Lowercase<First>}${SnakeCase<Rest>}`
  : S;

type DefineConfigProps = DrizzleConfig & {
  schema: string;
  policies: string;
};

export type {
  DefineConfigProps,
  PolicyConditions,
  PolicyConditionValue,
  SnakeCase,
  SqlMethod,
  TableAccess,
};
