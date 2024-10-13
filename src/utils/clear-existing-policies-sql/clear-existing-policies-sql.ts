function clearExistingPoliciesSql(tableNames: string[]) {
  const tableNamesList = tableNames.map((name) => `'${name}'`).join(', ');

  return `-- Clear existing RLS policies for the specified tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT
            policyname, tablename
        FROM
            pg_policies
        WHERE
            tablename = ANY(ARRAY[${tableNamesList}])
            AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', r.policyname, 'public', r.tablename);
    END LOOP;
END $$;`;
}

export { clearExistingPoliciesSql };
