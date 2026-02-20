/**
 * Create Profile Step
 * Second step - User profile creation
 */

'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks'
import { useOnboarding } from '@/lib/hooks'
import { getUserService } from '@/lib/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'

export interface CreateProfileStepProps {
  onNext?: () => void
  onPrevious?: () => void
}

export function CreateProfileStep({ onNext, onPrevious }: CreateProfileStepProps) {
  const { user, userId } = useAuth()
  const { completeStep } = useOnboarding()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    avatar_url: user?.avatar_url || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError(null)

      if (!userId) throw new Error('User not authenticated')

      const userService = getUserService()
      await userService.updateProfile(userId, {
        full_name: formData.full_name,
        avatar_url: formData.avatar_url || undefined,
      })

      await completeStep('create_profile')
      setTimeout(() => onNext?.(), 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Your Profile
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Tell us a bit about yourself so we can personalize your experience.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" title="Error" description={error} />
      )}

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="full_name" className="text-sm font-medium">
          Full Name
        </Label>
        <Input
          id="full_name"
          type="text"
          placeholder="John Doe"
          value={formData.full_name}
          onChange={(e) =>
            setFormData({ ...formData, full_name: e.target.value })
          }
          required
          minLength={2}
          className="w-full"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Your name as it will appear in your account
        </p>
      </div>

      {/* Avatar URL */}
      <div className="space-y-2">
        <Label htmlFor="avatar_url" className="text-sm font-medium">
          Avatar URL (Optional)
        </Label>
        <Input
          id="avatar_url"
          type="url"
          placeholder="https://example.com/avatar.jpg"
          value={formData.avatar_url}
          onChange={(e) =>
            setFormData({ ...formData, avatar_url: e.target.value })
          }
          className="w-full"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Link to your profile picture (must be a valid URL)
        </p>
      </div>

      {/* Avatar Preview */}
      {formData.avatar_url && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Preview
          </p>
          <img
            src={formData.avatar_url}
            alt="Avatar preview"
            className="w-16 h-16 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}

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
          type="submit"
          disabled={isLoading || !formData.full_name.trim()}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        This is a required step and cannot be skipped.
      </p>
    </form>
  )
}
