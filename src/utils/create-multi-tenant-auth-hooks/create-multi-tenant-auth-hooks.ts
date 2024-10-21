function createMultiTenantAuthHooks({ userRolesTable }: { userRolesTable: string }) {
  return `CREATE
OR REPLACE FUNCTION public.set_custom_access_token (event jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
    claims jsonb;
    tenant_info jsonb;
BEGIN
    -- Initialize the tenants array
    tenant_info := '[]'::jsonb;

    -- Select all roles and tenant_ids for the user
    SELECT jsonb_agg(jsonb_build_object('tenant_id', tenant_id, 'user_role', user_role))
    INTO tenant_info
    FROM public.${userRolesTable}
    WHERE user_id = (event ->> 'user_id')::uuid;

    RAISE LOG 'tenant_info: %', tenant_info;

    -- Get the claims from the event
    claims := event -> 'claims';

    -- Check if 'app_metadata' exists in claims
    IF jsonb_typeof(claims -> 'app_metadata') IS NULL THEN
        -- If 'app_metadata' does not exist, create an empty object
        claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
    END IF;

    -- Set the 'tenants' in the claims, even if it's an empty array
    claims := jsonb_set(claims, '{app_metadata, tenants}', tenant_info);

    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);

    -- Return the modified event
    RETURN event;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'An error occurred while processing the event: %', SQLERRM;
END;
$$;

grant usage on schema public to supabase_auth_admin;

grant execute
  on function public.set_custom_access_token
  to supabase_auth_admin;

revoke execute
  on function public.set_custom_access_token
  from authenticated, anon, public;

grant all
  on table public.${userRolesTable}
  to supabase_auth_admin;

create policy "allow_supabase_auth_admin_to_select_${userRolesTable}" ON public.${userRolesTable} 
as permissive for select
to supabase_auth_admin
using (true);`;
}

export { createMultiTenantAuthHooks };
