import './globals.css'
import '@/styles/prose.css'
import { Montserrat } from 'next/font/google'
import { cn } from '@/lib/utils'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
})

export const metadata = {
  title: 'Perplexica - Chat with the internet',
  description:
    'Perplexica is an AI powered chatbot that is connected to the internet.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(montserrat.className)}>
        {children}
      </body>
    </html>
  )
}
