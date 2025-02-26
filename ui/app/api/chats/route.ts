import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch chats for the current user
    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching chats:', error);
      return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
    }

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error in chats route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create a new chat
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, focusMode } = body;

    // Create the chat with user_id
    const { data: chat, error } = await supabase
      .from('chats')
      .insert({
        id,
        title,
        createdAt: new Date().toISOString(),
        focusMode,
        files: [],
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error in create chat route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 