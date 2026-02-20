/**
 * Configure Basics Step
 * Fifth step (optional) - Basic configuration
 */

'use client'

import { useState } from 'react'
import { useOnboarding } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
]

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'es', name: 'Español' },
]

export interface ConfigureBasicsStepProps {
  onNext?: () => void
  onPrevious?: () => void
  onSkip?: () => void
}

export function ConfigureBasicsStep({
  onNext,
  onPrevious,
  onSkip,
}: ConfigureBasicsStepProps) {
  const { completeStep, updateMetadata } = useOnboarding()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    timezone: 'UTC',
    language: 'en',
    notifications: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError(null)

      await updateMetadata({
        timezone: formData.timezone,
        language: formData.language,
        notificationsEnabled: formData.notifications,
      })

      await completeStep('configure_basics')
      setTimeout(() => onNext?.(), 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configure Basics
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Customize your account settings. You can change these anytime in your settings.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" title="Error" description={error} />
      )}

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone" className="text-sm font-medium">
          Timezone
        </Label>
        <select
          id="timezone"
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Used for displaying dates and times in your account
        </p>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <Label htmlFor="language" className="text-sm font-medium">
          Language
        </Label>
        <select
          id="language"
          value={formData.language}
          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Your preferred language for the interface
        </p>
      </div>

      {/* Notifications */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <input
          type="checkbox"
          id="notifications"
          checked={formData.notifications}
          onChange={(e) =>
            setFormData({ ...formData, notifications: e.target.checked })
          }
          className="w-4 h-4 rounded"
        />
        <label
          htmlFor="notifications"
          className="flex-1 text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
        >
          Enable Email Notifications
          <p className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5">
            Receive emails about important updates and activities
          </p>
        </label>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          ℹ️ These are optional settings. You can customize them further in your account
          settings after onboarding.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isLoading}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onSkip}
          disabled={isLoading}
          className="flex-1"
        >
          Skip
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        This is an optional step. You can skip it if you want.
      </p>
    </form>
  )
}
