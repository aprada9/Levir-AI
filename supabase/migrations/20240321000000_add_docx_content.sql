-- Add docx_content column to ocr_results table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ocr_results' 
        AND column_name = 'docx_content'
    ) THEN
        ALTER TABLE ocr_results ADD COLUMN docx_content TEXT;
    END IF;
END $$;

-- Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- Grant necessary permissions
GRANT ALL ON ocr_results TO authenticated;
GRANT ALL ON ocr_results TO service_role; 