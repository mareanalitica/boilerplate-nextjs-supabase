'use client'

import { usePreferences } from '@/lib/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sun, Moon, Monitor, Globe, Bell, Mail, Smartphone, BookOpen } from 'lucide-react'
import type { Theme, Language } from '@/lib/stores/preferences-store'

const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
]

const languageOptions: { value: Language; label: string }[] = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
]

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    notificationsEnabled,
    setNotifications,
    emailNotifications,
    toggleEmailNotifications,
    pushNotifications,
    togglePushNotifications,
    dailyDigest,
    toggleDailyDigest,
  } = usePreferences()

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Preferências da sua conta</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aparência</CardTitle>
          <CardDescription>Personalize a interface da aplicação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <div className="flex gap-2">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    theme === value
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Idioma e região
          </CardTitle>
          <CardDescription>Preferências de localização</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="language">Idioma</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </CardTitle>
          <CardDescription>Controle como você recebe alertas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Master toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-master">Ativar notificações</Label>
              <p className="text-xs text-muted-foreground">
                Liga ou desliga todas as notificações
              </p>
            </div>
            <Switch
              id="notifications-master"
              checked={notificationsEnabled}
              onCheckedChange={setNotifications}
            />
          </div>

          <Separator />

          {/* Individual toggles */}
          <div className="space-y-4">
            <div
              className={`flex items-center justify-between transition-opacity ${
                !notificationsEnabled ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="email-notif" className="cursor-pointer">
                    Email
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receber alertas por email
                  </p>
                </div>
              </div>
              <Switch
                id="email-notif"
                checked={emailNotifications}
                onCheckedChange={toggleEmailNotifications}
                disabled={!notificationsEnabled}
              />
            </div>

            <div
              className={`flex items-center justify-between transition-opacity ${
                !notificationsEnabled ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="push-notif" className="cursor-pointer">
                    Push
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Notificações no navegador
                  </p>
                </div>
              </div>
              <Switch
                id="push-notif"
                checked={pushNotifications}
                onCheckedChange={togglePushNotifications}
                disabled={!notificationsEnabled}
              />
            </div>

            <div
              className={`flex items-center justify-between transition-opacity ${
                !notificationsEnabled ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="digest-notif" className="cursor-pointer">
                    Resumo diário
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Resumo das atividades uma vez por dia
                  </p>
                </div>
              </div>
              <Switch
                id="digest-notif"
                checked={dailyDigest}
                onCheckedChange={toggleDailyDigest}
                disabled={!notificationsEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
