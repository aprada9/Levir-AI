import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cn } from '@/lib/utils'
import Sidebar from '@/components/Sidebar'
import { Toaster } from 'sonner'
import ThemeProvider from '@/components/theme/Provider'

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
        <Sidebar session={session}>
          {children}
        </Sidebar>
        <Toaster richColors />
      </ThemeProvider>
    </div>
  )
} 