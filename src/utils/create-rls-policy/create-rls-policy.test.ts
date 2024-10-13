import { createRlsPolicy } from './create-rls-policy';

describe('createRlsPolicy', () => {
  // Tests for allowing access to everyone
  it('should return SQL that allows ALL access to everyone', () => {
    expect(createRlsPolicy({ access: 'PUBLIC_ACCESS', tableName: 'todos', method: 'ALL' })).toBe(
      `CREATE POLICY "Allow ALL access to everyone" ON "public"."todos" AS PERMISSIVE FOR ALL TO public USING ( true ) WITH CHECK ( true );`
    );
  });

  it('should return SQL that allows SELECT access to everyone', () => {
    expect(createRlsPolicy({ access: 'PUBLIC_ACCESS', tableName: 'todos', method: 'SELECT' })).toBe(
      `CREATE POLICY "Allow SELECT access to everyone" ON "public"."todos" AS PERMISSIVE FOR SELECT TO public USING ( true );`
    );
  });

  it('should return SQL that allows INSERT access to everyone', () => {
    expect(createRlsPolicy({ access: 'PUBLIC_ACCESS', tableName: 'todos', method: 'INSERT' })).toBe(
      `CREATE POLICY "Allow INSERT access to everyone" ON "public"."todos" AS PERMISSIVE FOR INSERT TO public WITH CHECK ( true );`
    );
  });

  it('should return SQL that allows UPDATE access to everyone', () => {
    expect(createRlsPolicy({ access: 'PUBLIC_ACCESS', tableName: 'todos', method: 'UPDATE' })).toBe(
      `CREATE POLICY "Allow UPDATE access to everyone" ON "public"."todos" AS PERMISSIVE FOR UPDATE TO public USING ( true );`
    );
  });

  it('should return SQL that allows DELETE access to everyone', () => {
    expect(createRlsPolicy({ access: 'PUBLIC_ACCESS', tableName: 'todos', method: 'DELETE' })).toBe(
      `CREATE POLICY "Allow DELETE access to everyone" ON "public"."todos" AS PERMISSIVE FOR DELETE TO public USING ( true );`
    );
  });

  // Tests for allowing access based on user_id
  it('should return SQL that allows ALL access based on user_id', () => {
    expect(createRlsPolicy({ access: 'USER_IS_OWNER', tableName: 'todos', method: 'ALL' })).toBe(
      `CREATE POLICY "Allow ALL access based on user_id" ON "public"."todos" AS PERMISSIVE FOR ALL TO authenticated USING ( (select auth.uid()) = user_id ) WITH CHECK ( (select auth.uid()) = user_id );`
    );
  });

  it('should return SQL that allows SELECT access based on user_id', () => {
    expect(createRlsPolicy({ access: 'USER_IS_OWNER', tableName: 'todos', method: 'SELECT' })).toBe(
      `CREATE POLICY "Allow SELECT access based on user_id" ON "public"."todos" AS PERMISSIVE FOR SELECT TO authenticated USING ( (select auth.uid()) = user_id );`
    );
  });

  it('should return SQL that allows INSERT access based on user_id', () => {
    expect(createRlsPolicy({ access: 'USER_IS_OWNER', tableName: 'todos', method: 'INSERT' })).toBe(
      `CREATE POLICY "Allow INSERT access based on user_id" ON "public"."todos" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ( (select auth.uid()) = user_id );`
    );
  });

  it('should return SQL that allows UPDATE access based on user_id', () => {
    expect(createRlsPolicy({ access: 'USER_IS_OWNER', tableName: 'todos', method: 'UPDATE' })).toBe(
      `CREATE POLICY "Allow UPDATE access based on user_id" ON "public"."todos" AS PERMISSIVE FOR UPDATE TO authenticated USING ( (select auth.uid()) = user_id );`
    );
  });

  it('should return SQL that allows DELETE access based on user_id', () => {
    expect(createRlsPolicy({ access: 'USER_IS_OWNER', tableName: 'todos', method: 'DELETE' })).toBe(
      `CREATE POLICY "Allow DELETE access based on user_id" ON "public"."todos" AS PERMISSIVE FOR DELETE TO authenticated USING ( (select auth.uid()) = user_id );`
    );
  });

  // Tests for denying access to everyone
  it('should return SQL that denies ALL access to everyone', () => {
    expect(createRlsPolicy({ access: 'DENY_ALL', tableName: 'todos', method: 'ALL' })).toBe(
      `CREATE POLICY "Deny ALL access to everyone" ON "public"."todos" AS RESTRICTIVE FOR ALL USING ( false ) WITH CHECK ( false );`
    );
  });

  it('should return SQL that denies SELECT access to everyone', () => {
    expect(createRlsPolicy({ access: 'DENY_ALL', tableName: 'todos', method: 'SELECT' })).toBe(
      `CREATE POLICY "Deny SELECT access to everyone" ON "public"."todos" AS RESTRICTIVE FOR SELECT USING ( false );`
    );
  });

  it('should return SQL that denies INSERT access to everyone', () => {
    expect(createRlsPolicy({ access: 'DENY_ALL', tableName: 'todos', method: 'INSERT' })).toBe(
      `CREATE POLICY "Deny INSERT access to everyone" ON "public"."todos" AS RESTRICTIVE FOR INSERT WITH CHECK ( false );`
    );
  });

  it('should return SQL that denies UPDATE access to everyone', () => {
    expect(createRlsPolicy({ access: 'DENY_ALL', tableName: 'todos', method: 'UPDATE' })).toBe(
      `CREATE POLICY "Deny UPDATE access to everyone" ON "public"."todos" AS RESTRICTIVE FOR UPDATE USING ( false );`
    );
  });

  it('should return SQL that denies DELETE access to everyone', () => {
    expect(createRlsPolicy({ access: 'DENY_ALL', tableName: 'todos', method: 'DELETE' })).toBe(
      `CREATE POLICY "Deny DELETE access to everyone" ON "public"."todos" AS RESTRICTIVE FOR DELETE USING ( false );`
    );
  });
});
