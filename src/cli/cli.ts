#!/usr/bin/env node

import chalk from 'chalk';
import { exec } from 'child_process';
import { program } from 'commander';
import { resolve } from 'path';
import util from 'util';
import { rlsPolicyBuilder } from '@/rls-policy-builder';
import {
  clearExistingPoliciesSql,
  createUserHasRoleDbFunction,
  DefineConfigProps,
  runtimeLoadTsFile,
} from '@/utils';

const execAsync = util.promisify(exec);

type PoliciesContent = Record<string, ReturnType<typeof rlsPolicyBuilder>>;

program
  .command('generate')
  .description('Generate a SQL migration for your RLS policies')
  .option(
    '-c, --config <path>',
    'Path to your drizzle config file (use the exact same path you provide to drizzle-kit)'
  )
  .action(async ({ config }: { config?: string }) => {
    if (!config) {
      console.error('Error: --config <path> is required.');
      process.exit(1);
    }

    const configPath = resolve(process.cwd(), config);

    let configContent: DefineConfigProps | undefined;

    try {
      configContent = await runtimeLoadTsFile<DefineConfigProps>(configPath);
    } catch {
      console.error('Error: unable to read the config file.');
      process.exit(1);
    }

    const policiesFile = configContent?.policies;

    if (!policiesFile) {
      console.error('Error: unable to find the policies path in the config file.');
      process.exit(1);
    }

    const policiesPath = resolve(process.cwd(), policiesFile);

    let policiesContent: PoliciesContent | undefined;

    try {
      policiesContent = await runtimeLoadTsFile<PoliciesContent>(policiesPath);
    } catch {
      console.error('Error: unable to read the policies file.');
      process.exit(1);
    }

    const policies = Object.values(policiesContent);

    const tableNames = policies.map((policy) => policy.tableName);

    const needsUserHasRoleDbFunction = policies.some(
      (policy) => policy.func().createUserHasRoleDbFunction
    );

    const rlsPoliciesSql = [
      needsUserHasRoleDbFunction ? createUserHasRoleDbFunction() : '',
      clearExistingPoliciesSql(tableNames),
      policies.map((policy) => policy.func().sql).join('\n\n'),
    ];

    let migrationFilePath = '';

    try {
      const { stdout } = await execAsync(`
        file=$(npx drizzle-kit generate --config ${config} --custom | grep 'Your SQL migration file' | awk -F '➜ ' '{print $2}' | awk '{print $1}')
        cat <<'EOF' > $file
${rlsPoliciesSql.join('\n\n')}
EOF
echo $file
`);
      migrationFilePath = stdout.trim();
    } catch {
      console.error('Error: unable generate sql file');
      process.exit(1);
    }

    console.log(`Prepared empty file for your custom SQL migration!`);

    if (migrationFilePath) {
      console.log(
        `[${chalk.green('✓')}] Your SQL migration file ➜ ${chalk.bold.underline.blue(migrationFilePath)} 🚀`
      );
    }
  });

program.parse(process.argv);
