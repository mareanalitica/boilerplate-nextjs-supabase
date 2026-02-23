import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InfoIcon } from 'lucide-react'
import { Suspense } from 'react'

async function UserDetails() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    redirect('/auth/login')
  }

  return <>{JSON.stringify(data.claims, null, 2)}</>
}

export default function ProtectedPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Página Protegida</h1>
        <p className="text-muted-foreground">Rota de debug para desenvolvimento.</p>
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-accent text-sm p-4">
        <InfoIcon size={16} strokeWidth={2} />
        <span>Esta página só é visível para usuários autenticados.</span>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold text-lg">JWT Claims</h2>
        <pre className="text-xs font-mono p-4 rounded-lg border bg-muted overflow-auto max-h-96">
          <Suspense fallback="Carregando...">
            <UserDetails />
          </Suspense>
        </pre>
      </div>
    </div>
  )
}
