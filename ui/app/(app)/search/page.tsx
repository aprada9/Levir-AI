import { Metadata } from 'next'
import ChatWindow from '@/components/ChatWindow'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Chat - Levir AI',
  description: 'Chat with the internet, chat with Levir AI.',
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