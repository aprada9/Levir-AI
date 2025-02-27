-- Add a foreign key constraint to ensure user_id is a valid auth.users.id
ALTER TABLE public.ocr_results
ALTER COLUMN user_id SET NOT NULL,
ADD CONSTRAINT fk_ocr_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own OCR results" ON public.ocr_results;
DROP POLICY IF EXISTS "Users can insert their own OCR results" ON public.ocr_results;
DROP POLICY IF EXISTS "Users can update their own OCR results" ON public.ocr_results;
DROP POLICY IF EXISTS "Users can delete their own OCR results" ON public.ocr_results;
DROP POLICY IF EXISTS "Service role has full access to OCR results" ON public.ocr_results;

-- Recreate simplified policies
CREATE POLICY "Users can view own OCR results" ON public.ocr_results
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own OCR results" ON public.ocr_results
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own OCR results" ON public.ocr_results
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own OCR results" ON public.ocr_results
FOR DELETE USING (auth.uid() = user_id);

-- Special policy for service role (for Edge Functions)
CREATE POLICY "Service role access" ON public.ocr_results
FOR ALL USING (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role' OR
  (current_setting('request.jwt.claims', true)::json->>'role') = 'supabase_admin'
);

-- Add index for faster user-based filtering
CREATE INDEX IF NOT EXISTS idx_ocr_results_user_id ON public.ocr_results(user_id); 