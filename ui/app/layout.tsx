import './globals.css'
import '@/styles/prose.css'
import { Montserrat } from 'next/font/google'
import { cn } from '@/lib/utils'
import { headers } from 'next/headers'

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
  // Get the locale from cookies or default to English
  const headerList = headers();
  const cookieString = headerList.get('cookie') || '';
  const localeCookie = cookieString
    .split(';')
    .find(cookie => cookie.trim().startsWith('locale='));
  const locale = localeCookie ? localeCookie.split('=')[1] : 'en';
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(montserrat.className)}>
        {children}
      </body>
    </html>
  )
}
