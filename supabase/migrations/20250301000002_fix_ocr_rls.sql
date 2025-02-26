-- Check if RLS is already enabled
DO $$
BEGIN
  -- First ensure the user_id column exists and is properly typed
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ocr_results' 
    AND column_name = 'user_id'
  ) THEN
    -- Add user_id column if missing
    ALTER TABLE public.ocr_results ADD COLUMN user_id UUID REFERENCES auth.users(id);
    
    -- Update any existing records to have a default user ID
    -- You would replace 'default-user-id-here' with an actual UUID
    -- UPDATE public.ocr_results SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
  END IF;
  
  -- Enable RLS
  ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;
END
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own OCR results" ON public.ocr_results;
DROP POLICY IF EXISTS "Users can insert their own OCR results" ON public.ocr_results;
DROP POLICY IF EXISTS "Users can update their own OCR results" ON public.ocr_results;
DROP POLICY IF EXISTS "Users can delete their own OCR results" ON public.ocr_results;

-- Create policies for user access with explicit casting
-- Policy for SELECT
CREATE POLICY "Users can view their own OCR results"
ON public.ocr_results
FOR SELECT
USING (
  auth.uid() = user_id::uuid
);

-- Policy for INSERT
CREATE POLICY "Users can insert their own OCR results"
ON public.ocr_results
FOR INSERT
WITH CHECK (
  auth.uid() = user_id::uuid
);

-- Policy for UPDATE
CREATE POLICY "Users can update their own OCR results"
ON public.ocr_results
FOR UPDATE
USING (
  auth.uid() = user_id::uuid
)
WITH CHECK (
  auth.uid() = user_id::uuid
);

-- Policy for DELETE
CREATE POLICY "Users can delete their own OCR results"
ON public.ocr_results
FOR DELETE
USING (
  auth.uid() = user_id::uuid
);

-- Add policy for service role access (for admin functionality)
DROP POLICY IF EXISTS "Service role has full access to OCR results" ON public.ocr_results;
CREATE POLICY "Service role has full access to OCR results"
ON public.ocr_results
FOR ALL
USING (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
)
WITH CHECK (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Make sure all existing OCR results have valid UUIDs
UPDATE public.ocr_results 
SET user_id = '90b6e773-8624-4ee3-a7ef-c64754165cd9'::uuid 
WHERE user_id IS NULL OR user_id = ''; 