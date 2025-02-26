-- Update existing chats to have a user_id
UPDATE public.chats SET user_id = '90b6e773-8624-4ee3-a7ef-c64754165cd9' WHERE user_id IS NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create policies for chats
CREATE POLICY "Users can view their own chats" ON public.chats
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats" ON public.chats
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats" ON public.chats
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats" ON public.chats
    FOR DELETE
    USING (auth.uid() = user_id);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages based on chat ownership
CREATE POLICY "Users can select their own messages" ON public.messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE chats.id = messages.chatId
            AND chats.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to their own chats" ON public.messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE chats.id = messages.chatId
            AND chats.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE chats.id = messages.chatId
            AND chats.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own messages" ON public.messages
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE chats.id = messages.chatId
            AND chats.user_id = auth.uid()
        )
    ); 