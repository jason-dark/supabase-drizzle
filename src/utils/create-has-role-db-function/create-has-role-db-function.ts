import { USER_HAS_ROLE_DB_FUNC_NAME } from '@/constants';

function createUserHasRoleDbFunction() {
  return `CREATE OR REPLACE FUNCTION auth.${USER_HAS_ROLE_DB_FUNC_NAME} (allowed_roles TEXT[], org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = (SELECT auth.uid()) 
      AND r.name = ANY(allowed_roles) 
      AND ur.org_id = org_id
  );
END;
$$;`;
}

export { createUserHasRoleDbFunction };
