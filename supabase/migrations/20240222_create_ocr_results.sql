-- Create ocr_results table
CREATE TABLE IF NOT EXISTS public.ocr_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_filename TEXT NOT NULL,
    processed_text TEXT,
    file_type TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON public.ocr_results TO authenticated;
GRANT ALL ON public.ocr_results TO service_role;

-- Create policy for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
ON public.ocr_results
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy for service role
CREATE POLICY "Allow all operations for service role"
ON public.ocr_results
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);