// app/(admin)/login/page.tsx
import { signIn } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <form action={signIn} className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6">
        <div>
          <h1 className="text-lg font-medium">Ingresar</h1>
          <p className="text-sm text-muted-foreground">Acceso solo para administradores.</p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>

        <Button type="submit" className="w-full">Ingresar</Button>
      </form>
    </div>
  )
  
}
