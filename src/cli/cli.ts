#!/usr/bin/env node

import { program } from 'commander';
import {
  clearExistingRlsPolicies,
  createMultiTenantAuthHooks,
  createSingleTenantAuthHooks,
  readDrizzleConfigFromFile,
  readRlsConfigFromFile,
  writeToMigrationFile,
} from '@/utils';

program
  .command('generate')
  .description('Generate a SQL migration for your RLS policies')
  .option(
    '-c, --config <path>',
    'Path to your drizzle config file (use the exact same path you provide to drizzle-kit)'
  )
  .action(async ({ config }: { config?: string }) => {
    const { policies: policiesFilePath } = await readDrizzleConfigFromFile(config);
    const policiesContent = await readRlsConfigFromFile(policiesFilePath);

    const rlsPolicies = Object.values(policiesContent);
    const isMultiTenant = rlsPolicies?.some((policy) => policy.tenantsTable);
    const userRolesTable = [...new Set(rlsPolicies?.map((policy) => policy.userRolesTable))]?.[0];
    const userRoles = [
      ...new Set(rlsPolicies?.map((policy) => Object.values(policy.userRoles)).flat()),
    ];
    const shouldConfigureMultiTenant = isMultiTenant && userRolesTable && userRoles.length > 0;
    const shouldConfigureSingleTenant = !isMultiTenant && userRolesTable && userRoles.length > 0;

    const sqlStatements = [
      clearExistingRlsPolicies(), // Clear any existing RLS policies because we want to replace them
      rlsPolicies.map((policy) => policy.func()).join('\n\n'), // Define all the new RLS policies
      shouldConfigureMultiTenant ? createMultiTenantAuthHooks({ userRolesTable }) : '', // If multi-tenant, inject the user's JWT with tenant_id and user_role claims
      shouldConfigureSingleTenant ? createSingleTenantAuthHooks({ userRolesTable }) : '', // If single-tenant, inject the user's JWT with user_role claim
    ];

    await writeToMigrationFile(sqlStatements, config);
  });

program.parse(process.argv);
