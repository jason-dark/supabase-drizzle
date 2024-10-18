import { createRlsPolicy } from './create-rls-policy';

// TODO: Add tests for user roles and tenant id

describe('createRlsPolicy', () => {
  // Tests for allowing access to everyone
  it('should return SQL that allows ALL access to everyone', () => {
    expect(createRlsPolicy({ access: 'PUBLIC_ACCESS', tableName: 'todos', method: 'ALL' })).toBe(
      `CREATE POLICY "allow_all_access_to_everyone" ON "public"."todos" AS PERMISSIVE FOR ALL TO public USING ( true ) WITH CHECK ( true );`
    );
  });

  it('should return SQL that allows SELECT access to everyone', () => {
    expect(createRlsPolicy({ access: 'PUBLIC_ACCESS', tableName: 'todos', method: 'SELECT' })).toBe(
      `CREATE POLICY "allow_select_access_to_everyone" ON "public"."todos" AS PERMISSIVE FOR SELECT TO public USING ( true );`
    );
  });

  it('should return SQL that allows INSERT access to everyone', () => {
    expect(createRlsPolicy({ access: 'PUBLIC_ACCESS', tableName: 'todos', method: 'INSERT' })).toBe(
      `CREATE POLICY "allow_insert_access_to_everyone" ON "public"."todos" AS PERMISSIVE FOR INSERT TO public WITH CHECK ( true );`
    );
  });

  it('should return SQL that allows UPDATE access to everyone', () => {
    expect(createRlsPolicy({ access: 'PUBLIC_ACCESS', tableName: 'todos', method: 'UPDATE' })).toBe(
      `CREATE POLICY "allow_update_access_to_everyone" ON "public"."todos" AS PERMISSIVE FOR UPDATE TO public USING ( true );`
    );
  });

  it('should return SQL that allows DELETE access to everyone', () => {
    expect(createRlsPolicy({ access: 'PUBLIC_ACCESS', tableName: 'todos', method: 'DELETE' })).toBe(
      `CREATE POLICY "allow_delete_access_to_everyone" ON "public"."todos" AS PERMISSIVE FOR DELETE TO public USING ( true );`
    );
  });

  // Tests for allowing access to authenticated users
  it('should return SQL that allows ALL access to authenticated users', () => {
    expect(createRlsPolicy({ access: 'AUTHENTICATED', tableName: 'todos', method: 'ALL' })).toBe(
      `CREATE POLICY "allow_all_access_to_authenticated_users" ON "public"."todos" AS PERMISSIVE FOR ALL TO authenticated USING ( true ) WITH CHECK ( true );`
    );
  });

  it('should return SQL that allows SELECT access to authenticated users', () => {
    expect(createRlsPolicy({ access: 'AUTHENTICATED', tableName: 'todos', method: 'SELECT' })).toBe(
      `CREATE POLICY "allow_select_access_to_authenticated_users" ON "public"."todos" AS PERMISSIVE FOR SELECT TO authenticated USING ( true );`
    );
  });

  it('should return SQL that allows INSERT access to authenticated users', () => {
    expect(createRlsPolicy({ access: 'AUTHENTICATED', tableName: 'todos', method: 'INSERT' })).toBe(
      `CREATE POLICY "allow_insert_access_to_authenticated_users" ON "public"."todos" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ( true );`
    );
  });

  it('should return SQL that allows UPDATE access to authenticated users', () => {
    expect(createRlsPolicy({ access: 'AUTHENTICATED', tableName: 'todos', method: 'UPDATE' })).toBe(
      `CREATE POLICY "allow_update_access_to_authenticated_users" ON "public"."todos" AS PERMISSIVE FOR UPDATE TO authenticated USING ( true );`
    );
  });

  it('should return SQL that allows DELETE access to authenticated users', () => {
    expect(createRlsPolicy({ access: 'AUTHENTICATED', tableName: 'todos', method: 'DELETE' })).toBe(
      `CREATE POLICY "allow_delete_access_to_authenticated_users" ON "public"."todos" AS PERMISSIVE FOR DELETE TO authenticated USING ( true );`
    );
  });

  // Tests for allowing access based on user_id
  it('should return SQL that allows ALL access based on user_id', () => {
    expect(createRlsPolicy({ access: 'USER_IS_OWNER', tableName: 'todos', method: 'ALL' })).toBe(
      `CREATE POLICY "allow_all_access_based_on_user_id" ON "public"."todos" AS PERMISSIVE FOR ALL TO authenticated USING ( (select auth.uid()) = user_id ) WITH CHECK ( (select auth.uid()) = user_id );`
    );
  });

  it('should return SQL that allows SELECT access based on user_id', () => {
    expect(createRlsPolicy({ access: 'USER_IS_OWNER', tableName: 'todos', method: 'SELECT' })).toBe(
      `CREATE POLICY "allow_select_access_based_on_user_id" ON "public"."todos" AS PERMISSIVE FOR SELECT TO authenticated USING ( (select auth.uid()) = user_id );`
    );
  });

  it('should return SQL that allows INSERT access based on user_id', () => {
    expect(createRlsPolicy({ access: 'USER_IS_OWNER', tableName: 'todos', method: 'INSERT' })).toBe(
      `CREATE POLICY "allow_insert_access_based_on_user_id" ON "public"."todos" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ( (select auth.uid()) = user_id );`
    );
  });

  it('should return SQL that allows UPDATE access based on user_id', () => {
    expect(createRlsPolicy({ access: 'USER_IS_OWNER', tableName: 'todos', method: 'UPDATE' })).toBe(
      `CREATE POLICY "allow_update_access_based_on_user_id" ON "public"."todos" AS PERMISSIVE FOR UPDATE TO authenticated USING ( (select auth.uid()) = user_id );`
    );
  });

  it('should return SQL that allows DELETE access based on user_id', () => {
    expect(createRlsPolicy({ access: 'USER_IS_OWNER', tableName: 'todos', method: 'DELETE' })).toBe(
      `CREATE POLICY "allow_delete_access_based_on_user_id" ON "public"."todos" AS PERMISSIVE FOR DELETE TO authenticated USING ( (select auth.uid()) = user_id );`
    );
  });
});
