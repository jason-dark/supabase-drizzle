import chalk from 'chalk';
import { exec } from 'child_process';
import console from 'console';
import util from 'util';

const execAsync = util.promisify(exec);

const writeToMigrationFile = async (sqlStatements: string[], configPath?: string) => {
  if (!configPath) {
    console.error('Error: --config <path> is required.');
    process.exit(1);
  }

  let migrationFilePath = '';

  try {
    const { stdout } = await execAsync(`
      file=$(npx drizzle-kit generate --config ${configPath} --custom | grep 'Your SQL migration file' | awk -F '➜ ' '{print $2}' | awk '{print $1}')
      cat <<'EOF' > $file
${sqlStatements.join('\n\n')}
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
};

export { writeToMigrationFile };
