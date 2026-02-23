'use client'

import { useAuth } from '@/lib/hooks'
import { useOrganization } from '@/lib/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, CreditCard, Activity } from 'lucide-react'

const stats = [
  {
    title: 'Usuários',
    value: '—',
    description: 'Total de usuários ativos',
    icon: Users,
  },
  {
    title: 'Organização',
    value: '—',
    description: 'Membros na organização',
    icon: Building2,
  },
  {
    title: 'Plano',
    value: '—',
    description: 'Plano atual',
    icon: CreditCard,
  },
  {
    title: 'Atividade',
    value: '—',
    description: 'Eventos nos últimos 30 dias',
    icon: Activity,
  },
]

export default function DashboardPage() {
  const { user, email } = useAuth()
  const { currentOrganization, currentPlan } = useOrganization()

  const displayName = user?.full_name || email || 'Usuário'
  const orgName = currentOrganization?.name

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Olá, {displayName}
        </h1>
        <p className="text-muted-foreground">
          {orgName
            ? `Bem-vindo ao painel de ${orgName}`
            : 'Bem-vindo ao seu painel'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>Primeiros passos</CardTitle>
          <CardDescription>
            Configure sua aplicação e comece a usar todos os recursos disponíveis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 text-sm font-bold">
              ✓
            </div>
            <div>
              <p className="text-sm font-medium">Conta criada</p>
              <p className="text-xs text-muted-foreground">Login realizado com sucesso</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
              2
            </div>
            <div>
              <p className="text-sm font-medium">Configure sua organização</p>
              <p className="text-xs text-muted-foreground">
                {orgName
                  ? `Organização: ${orgName} • Plano: ${currentPlan || 'free'}`
                  : 'Complete o onboarding para configurar sua organização'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 text-sm font-bold">
              3
            </div>
            <div>
              <p className="text-sm font-medium">Personalize seu produto</p>
              <p className="text-xs text-muted-foreground">
                Adicione suas funcionalidades neste painel
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
