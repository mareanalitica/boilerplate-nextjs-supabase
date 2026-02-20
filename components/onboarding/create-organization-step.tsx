/**
 * Create Organization Step
 * Third step - Organization creation
 */

'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks'
import { useOnboarding } from '@/lib/hooks'
import { getOrganizationService } from '@/lib/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'

export interface CreateOrganizationStepProps {
  onNext?: () => void
  onPrevious?: () => void
}

export function CreateOrganizationStep({
  onNext,
  onPrevious,
}: CreateOrganizationStepProps) {
  const { userId } = useAuth()
  const { completeStep, updateMetadata } = useOnboarding()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError(null)

      if (!userId) throw new Error('User not authenticated')

      const orgService = getOrganizationService()
      const org = await orgService.createOrganization({
        name: formData.name,
        owner_id: userId,
        plan: 'free',
        logo_url: formData.logo_url || undefined,
      })

      // Store organization ID in onboarding metadata
      await updateMetadata({
        organizationId: org.id,
        organizationName: org.name,
      })

      await completeStep('create_organization')
      setTimeout(() => onNext?.(), 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Your Organization
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Set up your workspace where you and your team can collaborate.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" title="Error" description={error} />
      )}

      {/* Organization Name */}
      <div className="space-y-2">
        <Label htmlFor="org_name" className="text-sm font-medium">
          Organization Name
        </Label>
        <Input
          id="org_name"
          type="text"
          placeholder="Acme Inc"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          minLength={2}
          maxLength={255}
          className="w-full"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          The name of your company or organization
        </p>
      </div>

      {/* Logo URL */}
      <div className="space-y-2">
        <Label htmlFor="logo_url" className="text-sm font-medium">
          Logo URL (Optional)
        </Label>
        <Input
          id="logo_url"
          type="url"
          placeholder="https://example.com/logo.png"
          value={formData.logo_url}
          onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
          className="w-full"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Your organization's logo (will be used in the dashboard)
        </p>
      </div>

      {/* Logo Preview */}
      {formData.logo_url && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Preview
          </p>
          <img
            src={formData.logo_url}
            alt="Logo preview"
            className="h-16 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Initial Plan Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <strong>Getting Started:</strong> Your organization starts with the{' '}
          <span className="font-semibold">Free Plan</span>. You can upgrade to Pro or
          Enterprise later.
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
          type="submit"
          disabled={isLoading || !formData.name.trim()}
          className="flex-1"
        >
          {isLoading ? 'Creating...' : 'Continue'}
        </Button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        This is a required step and cannot be skipped.
      </p>
    </form>
  )
}
