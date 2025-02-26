-- Add user_id to chats table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'chats' 
    AND column_name = 'user_id'
  ) THEN 
    ALTER TABLE public.chats ADD COLUMN user_id UUID;
  END IF;
END $$; 