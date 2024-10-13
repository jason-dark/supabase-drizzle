import { clearExistingPoliciesSql } from './clear-existing-policies-sql';
describe('clearExistingPoliciesSql', () => {
  it('should return SQL that clears policies for the given tables', () => {
    const tables = ['todos', 'profiles'];

    expect(clearExistingPoliciesSql(tables))
      .toBe(`-- Clear existing RLS policies for the specified tables
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
            tablename = ANY(ARRAY[${tables.map((table) => `'${table}'`).join(', ')}])
            AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', r.policyname, 'public', r.tablename);
    END LOOP;
END $$;`);
  });
});
