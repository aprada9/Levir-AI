-- Creates an RPC function to test if RLS is enabled on ocr_results
CREATE OR REPLACE FUNCTION test_has_rls()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  has_rls boolean;
  policies jsonb;
BEGIN
  -- Check if RLS is enabled
  SELECT rls_enabled INTO has_rls
  FROM pg_tables
  WHERE schemaname = 'public' AND tablename = 'ocr_results';
  
  -- Get policy information
  SELECT jsonb_agg(jsonb_build_object(
    'policy_name', p.policyname,
    'cmd', p.cmd,
    'permissive', p.permissive
  ))
  INTO policies
  FROM pg_policies p
  WHERE p.tablename = 'ocr_results' AND p.schemaname = 'public';
  
  RETURN jsonb_build_object(
    'has_rls', has_rls,
    'policies', COALESCE(policies, '[]'::jsonb),
    'table_exists', has_rls IS NOT NULL
  );
END;
$$; 