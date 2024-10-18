function createSingleTenantAuthHooks({ userRolesTable }: { userRolesTable: string }) {
  return `CREATE
OR REPLACE FUNCTION public.set_custom_access_token (EVENT jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
    claims jsonb;
    user_role text;
BEGIN
    -- Select the user_role for the user
    SELECT t.user_role
    INTO user_role
    FROM public.${userRolesTable} t
    WHERE t.user_id = (event ->> 'user_id')::uuid
    LIMIT 1;  -- Assuming we only want one role, adjust as necessary

    RAISE LOG 'user_role: %', user_role;

    -- Get the claims from the event
    claims := event -> 'claims';

    -- Check if 'app_metadata' exists in claims
    IF jsonb_typeof(claims -> 'app_metadata') IS NULL THEN
        -- If 'app_metadata' does not exist, create an empty object
        claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
    END IF;

    -- Set the 'user_role' in the claims
    claims := jsonb_set(claims, '{app_metadata, user_role}', to_jsonb(user_role));

    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);

    -- Return the modified event
    RETURN event;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'An error occurred while processing the event: %', SQLERRM;
END;
$$;

-- Grant and revoke permissions on the '${userRolesTable}' table
GRANT SELECT ON TABLE public.${userRolesTable} TO supabase_auth_admin;

REVOKE ALL ON TABLE public.${userRolesTable}
FROM
  authenticated,
  anon,
  public;`;
}

export { createSingleTenantAuthHooks };
