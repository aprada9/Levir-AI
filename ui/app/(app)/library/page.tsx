'use client';

import { useEffect, useState } from 'react';
import { formatTimeDifference } from '@/lib/utils';
import DeleteChat from '@/components/DeleteChat';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  focusMode: string;
  files: any[];
  user_id: string;
}

export default function LibraryPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Check if user is authenticated first
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('You must be logged in to view your chat history');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/chats');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch chats');
        }
        
        const data = await response.json();
        
        // Map the data to the expected format with proper date conversion
        setChats(data.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.createdAt),
        })));
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chats');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [supabase]);

  const handleDeleteChat = (chatId: string) => {
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No chats found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Chat History</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
          >
            <div className="flex justify-between items-start mb-4">
              <Link
                href={`/c/${chat.id}`}
                className="text-lg font-semibold hover:text-blue-500 transition-colors"
              >
                {chat.title}
              </Link>
              <div className="flex items-center space-x-2">
                <DeleteChat
                  chatId={chat.id}
                  onDelete={() => handleDeleteChat(chat.id)}
                />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Created {formatTimeDifference(new Date(), chat.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
