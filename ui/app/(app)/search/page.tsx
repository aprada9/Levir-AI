import { Metadata } from 'next'
import ChatWindow from '@/components/ChatWindow'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Chat - Perplexica',
  description: 'Chat with the internet, chat with Perplexica.',
}

export default function SearchPage() {
  return (
    <div>
      <Suspense>
        <ChatWindow />
      </Suspense>
    </div>
  )
} 