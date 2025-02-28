import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cn } from '@/lib/utils'
import Sidebar from '@/components/Sidebar'
import { Toaster } from 'sonner'
import ThemeProvider from '@/components/theme/Provider'
import { LanguageProvider } from '@/i18n/client'
import LangAttributeUpdater from '@/i18n/LangAttributeUpdater'
import Footer from '@/components/layout/Footer'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <div className="h-screen">
      <ThemeProvider>
        <LanguageProvider>
          <LangAttributeUpdater />
          <Sidebar session={session}>
            <div className="flex flex-col min-h-screen">
              <div className="flex-grow">
                {children}
              </div>
              <Footer />
            </div>
          </Sidebar>
          <Toaster richColors />
        </LanguageProvider>
      </ThemeProvider>
    </div>
  )
} 