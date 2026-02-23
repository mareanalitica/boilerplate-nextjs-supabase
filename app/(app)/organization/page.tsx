'use client'

import { useOrganization } from '@/lib/hooks'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Building2, CreditCard, Users, Crown, UserPlus } from 'lucide-react'

const planLabels: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

const planColors: Record<string, string> = {
  free: 'secondary',
  starter: 'default',
  pro: 'default',
  enterprise: 'default',
}

export default function OrganizationPage() {
  const {
    currentOrganization,
    currentPlan,
    currentRole,
    organizationsList,
    isAdmin,
    canInviteMembers,
  } = useOrganization()

  const org = currentOrganization
  const plan = currentPlan ?? 'free'
  const planLabel = planLabels[plan] ?? plan

  if (!org) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organização</h1>
          <p className="text-muted-foreground">Gerencie sua organização</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/40" />
              <div>
                <p className="font-medium">Nenhuma organização encontrada</p>
                <p className="text-sm text-muted-foreground">
                  Complete o onboarding para criar sua organização
                </p>
              </div>
              <Button size="sm" asChild>
                <a href="/onboarding/create-organization">Criar organização</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const initials = org.name
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organização</h1>
        <p className="text-muted-foreground">Gerencie sua organização e plano</p>
      </div>

      {/* Org header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg bg-violet-100 text-violet-700 font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1 min-w-0">
              <p className="text-xl font-semibold truncate">{org.name}</p>
              {org.slug && (
                <p className="text-sm text-muted-foreground">/{org.slug}</p>
              )}
              <div className="flex items-center gap-2">
                <Badge variant={planColors[plan] as 'default' | 'secondary'}>
                  {planLabel}
                </Badge>
                {currentRole && (
                  <Badge variant="outline" className="capitalize">
                    {currentRole === 'admin' && <Crown className="h-3 w-3 mr-1" />}
                    {currentRole}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Plano atual
          </CardTitle>
          <CardDescription>Detalhes da sua assinatura</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold text-lg">{planLabel}</p>
              <p className="text-sm text-muted-foreground">
                {plan === 'free'
                  ? 'Recursos básicos incluídos'
                  : 'Todos os recursos disponíveis'}
              </p>
            </div>
            <Badge variant={planColors[plan] as 'default' | 'secondary'} className="text-sm">
              {plan === 'free' ? 'Gratuito' : 'Ativo'}
            </Badge>
          </div>
          {plan === 'free' && (
            <Button className="w-full" size="sm">
              Fazer upgrade
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Members placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Membros
              </CardTitle>
              <CardDescription>Pessoas com acesso à organização</CardDescription>
            </div>
            {canInviteMembers() && (
              <Button size="sm" variant="outline" disabled>
                <UserPlus className="h-4 w-4 mr-1" />
                Convidar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="flex flex-col gap-3">
            {/* Current user as member */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                    EU
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Você</p>
                  <p className="text-xs text-muted-foreground">Membro atual</p>
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {currentRole === 'admin' && <Crown className="h-3 w-3 mr-1" />}
                {currentRole ?? 'member'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone — admin only */}
      {isAdmin() && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Zona de perigo</CardTitle>
            <CardDescription>Ações irreversíveis para a organização</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Excluir organização</p>
                <p className="text-xs text-muted-foreground">
                  Remove permanentemente a organização e todos os dados
                </p>
              </div>
              <Button variant="destructive" size="sm" disabled>
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
