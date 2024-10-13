import { PolicyConditions, PolicyConditionValue, SqlMethod } from '../types';
import { createRlsPolicy, CreateRlsPolicyProps } from '../utils/create-rls-policy/';

const allowAllAccess =
  () =>
  ({ method, tableName }: Omit<CreateRlsPolicyProps, 'access'>) =>
    createRlsPolicy({ access: 'PUBLIC_ACCESS', method, tableName });

const denyAllAccess =
  () =>
  ({ method, tableName }: Omit<CreateRlsPolicyProps, 'access'>) =>
    createRlsPolicy({ access: 'DENY_ALL', method, tableName });

const ifUserIsOwner =
  () =>
  ({ method, tableName }: Omit<CreateRlsPolicyProps, 'access'>) =>
    createRlsPolicy({ access: 'USER_IS_OWNER', method, tableName });

const ifUserHasRole = (userRole: string | string[]) => {
  // Need to have this as a named function so that we can later detect if it was used
  const ifUserHasRoleCreator = ({ method, tableName }: Omit<CreateRlsPolicyProps, 'access'>) =>
    createRlsPolicy({
      access: 'USER_HAS_ROLE',
      userRole: Array.isArray(userRole) ? userRole : [userRole],
      method,
      tableName,
    });
  return ifUserHasRoleCreator;
};

type Policy =
  | typeof allowAllAccess
  | typeof denyAllAccess
  | typeof ifUserIsOwner
  | typeof ifUserHasRole;

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
 *   select: ifUserIsOwner(), // Valid
 *   insert: denyAllAccess(), // Valid
 *   update: ifUserIsOwner(), // Valid
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

    let createUserHasRoleDbFunction = false;

    // If the `all` property is provided, we only process that property and ignore the rest.
    // This guards against type errors being ignored by the user.
    const cleanedConditions = conditions?.all ? { all: conditions.all } : conditions;

    // For each method (ALL, SELECT, INSERT, UPDATE, DELETE), generate the SQL statement for the policy(ies) provided
    Object.entries(cleanedConditions).forEach((entry) => {
      const [method, policy] = entry as [SqlMethod, PolicyConditionValue<Policy>];
      // Policies can be a single function or an array of functions, so we normalize it to an array.
      const conditionValues = Array.isArray(policy) ? policy : [policy];
      conditionValues.forEach((policy) => {
        if (policy.name === 'ifUserHasRoleCreator') {
          // If the user specified ifUserHasRole, we need to make sure the user_has_role function exists in the DB.
          createUserHasRoleDbFunction = true;
        }
        sqlStatements.push(policy({ tableName, method }));
      });
    });

    return {
      sql: sqlStatements.join('\n'),
      createUserHasRoleDbFunction,
    };
  },
  tableName,
});

export { allowAllAccess, denyAllAccess, ifUserHasRole, ifUserIsOwner, rlsPolicyBuilder };
