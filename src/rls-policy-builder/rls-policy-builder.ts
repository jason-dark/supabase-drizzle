import { PolicyConditions, SqlMethod } from '../types';
import { createAllowPolicy } from '../utils/create-allow-policy';
import { CreateAllowPolicyProps } from '../utils/create-allow-policy';
import { createDenyPolicy, CreateDenyPolicyProps } from '../utils/create-deny-policy';

const allowAllAccess = () => (props: Omit<CreateAllowPolicyProps, 'access'>) =>
  createAllowPolicy({ access: 'PUBLIC_ACCESS', ...props } as CreateAllowPolicyProps);

const userIsOwner = () => (props: Omit<CreateAllowPolicyProps, 'access'>) =>
  createAllowPolicy({ access: 'USER_IS_OWNER', ...props } as CreateAllowPolicyProps);

const denyAllAccess = () => (props: CreateDenyPolicyProps) => createDenyPolicy(props);

type Policy = typeof allowAllAccess | typeof userIsOwner | typeof denyAllAccess;

/**
 * Builds a Row-Level Security (RLS) policy for a given table.
 *
 * This function allows you to define RLS policies that can either grant access to all rows in a table
 * or specify policies for individual SQL methods such as SELECT, INSERT, UPDATE, and DELETE.
 *
 * You **cannot** provide both the `all` property and individual method properties in the `conditions` object.
 * If `all` is specified, no individual methods should be included, and vice versa.
 *
 * @param tableName - The name of the table for which the RLS policy is being defined.
 * @param conditions - An object that defines the RLS policy conditions:
 *
 * - **If `all` is provided**: This should specify a policy that applies to all operations on the table.
 * - **If individual methods are provided**: The `conditions` object should include keys corresponding to
 *   each SQL method (e.g., `select`, `insert`, `update`, `delete`). The `all` property must **not** be included.
 *
 * @example
 * // Using the `all` property to allow all access:
 * const policyWithAllAccess = rlsPolicyBuilder('my_table', {
 *   all: allowAllAccess(), // Valid
 * });
 *
 * // Using individual method properties to specify policies:
 * const policyWithIndividualAccess = rlsPolicyBuilder('my_table', {
 *   select: userIsOwner(), // Valid
 *   insert: denyAllAccess(), // Valid
 *   update: userIsOwner(), // Valid
 *   delete: allowAllAccess(), // Valid
 *   // all: allowAllAccess() // Invalid: Cannot have both `all` and individual methods
 * });
 *
 * // The following example will cause a TypeScript error because `all` and individual methods are mixed:
 * const invalidPolicy = rlsPolicyBuilder('my_table', {
 *   all: denyAllAccess(), // Invalid
 *   select: allowAllAccess(), // Invalid: Cannot have both
 * });
 *
 * @returns A function that, when called, generates SQL statements for enabling RLS on the specified table
 * and applying the defined policies.
 */
const rlsPolicyBuilder = (tableName: string, conditions: PolicyConditions<Policy>) => ({
  func: () => {
    const sqlStatements: string[] = [`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`];

    if (conditions?.all) {
      sqlStatements.push(conditions.all({ tableName, forTable: true }));
    } else {
      Object.entries(conditions).forEach(([method, policy]: [string, ReturnType<Policy>]) => {
        sqlStatements.push(policy({ tableName, method: method as SqlMethod }));
      });
    }

    return sqlStatements.join('\n');
  },
  tableName,
});

export { allowAllAccess, denyAllAccess, rlsPolicyBuilder, userIsOwner };
