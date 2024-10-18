function clearExistingRlsPolicies() {
  return `-- Clear existing RLS policies for the public schema
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
END $$;`;
}

export { clearExistingRlsPolicies };
