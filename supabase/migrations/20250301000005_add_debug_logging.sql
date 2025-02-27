-- Create debug_logs table for persistent logging
CREATE TABLE IF NOT EXISTS public.debug_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for faster queries by function name and timestamp
CREATE INDEX IF NOT EXISTS idx_debug_logs_function_timestamp ON public.debug_logs (function_name, timestamp);

-- Add RLS policies for debug_logs (only service role and authenticated users can view)
ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
CREATE POLICY "Service roles can do everything with debug logs"
ON public.debug_logs
FOR ALL
TO service_role
USING (true);

-- Authenticated users can only view logs
CREATE POLICY "Authenticated users can view debug logs"
ON public.debug_logs
FOR SELECT
TO authenticated
USING (true);

-- Function to access debug logs with filtering
CREATE OR REPLACE FUNCTION public.get_debug_logs(
  function_name_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 100,
  offset_count INTEGER DEFAULT 0
) RETURNS TABLE (
  id UUID,
  function_name TEXT,
  message TEXT,
  data JSONB,
  timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dl.id,
    dl.function_name,
    dl.message,
    dl.data,
    dl.timestamp,
    dl.created_at
  FROM public.debug_logs dl
  WHERE 
    (function_name_filter IS NULL OR dl.function_name = function_name_filter)
  ORDER BY dl.timestamp DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$; 