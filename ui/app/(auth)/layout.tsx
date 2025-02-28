import { Montserrat } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Toaster } from 'sonner'
import ThemeProvider from '@/components/theme/Provider'
import { LanguageProvider } from '@/i18n/client'
import LangAttributeUpdater from '@/i18n/LangAttributeUpdater'
import Footer from '@/components/layout/Footer'

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
    <div className={cn(montserrat.className, "min-h-screen flex flex-col bg-light-primary dark:bg-dark-primary")}>
      <ThemeProvider>
        <LanguageProvider>
          <LangAttributeUpdater />
          <div className="flex-grow flex items-center justify-center">
            {children}
          </div>
          <Footer />
          <Toaster richColors />
        </LanguageProvider>
      </ThemeProvider>
    </div>
  )
} 