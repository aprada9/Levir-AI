import { Montserrat } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Toaster } from 'sonner'
import ThemeProvider from '@/components/theme/Provider'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
})

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={cn(montserrat.className, "min-h-screen flex items-center justify-center bg-light-primary dark:bg-dark-primary")}>
      <ThemeProvider>
        {children}
        <Toaster richColors />
      </ThemeProvider>
    </div>
  )
} 