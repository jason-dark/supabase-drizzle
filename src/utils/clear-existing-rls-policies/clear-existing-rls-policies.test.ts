import { clearExistingRlsPolicies } from './clear-existing-rls-policies';
describe('clearExistingRlsPolicies', () => {
  it('should return SQL that clears policies for the public schema', () => {
    expect(clearExistingRlsPolicies()).toBe(`-- Clear existing RLS policies for the public schema
DO $$ 
DECLARE 
    r RECORD; 
BEGIN 
    FOR r IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', r.policyname, 'public', r.tablename); 
    END LOOP; 
END $$;`);
  });
});
