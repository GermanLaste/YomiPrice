// app/(admin)/admin/layout.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '../login/actions'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <nav className="flex gap-4 text-sm">
            <Link href="/admin">Obras</Link>
            <Link href="/admin/stores">Tiendas</Link>
            <Link href="/admin/genres">Géneros</Link>
          </nav>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">Salir</Button>
          </form>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}