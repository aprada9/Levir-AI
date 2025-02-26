-- Add user_id to ocr_results table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ocr_results' 
    AND column_name = 'user_id'
  ) THEN 
    ALTER TABLE public.ocr_results ADD COLUMN user_id UUID;
  END IF;
END $$;

-- Update existing ocr_results to have a default user_id if not set
-- This assigns existing records to a default user for backward compatibility
UPDATE public.ocr_results SET user_id = '90b6e773-8624-4ee3-a7ef-c64754165cd9' WHERE user_id IS NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;

-- Create policies for ocr_results
CREATE POLICY "Users can view their own OCR results" ON public.ocr_results
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own OCR results" ON public.ocr_results
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OCR results" ON public.ocr_results
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OCR results" ON public.ocr_results
    FOR DELETE
    USING (auth.uid() = user_id); 