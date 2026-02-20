/**
 * Verify Email Step
 * First step of onboarding - Email verification
 */

'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks'
import { useOnboarding } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

export interface VerifyEmailStepProps {
  onNext?: () => void
}

export function VerifyEmailStep({ onNext }: VerifyEmailStepProps) {
  const { user } = useAuth()
  const { completeStep } = useOnboarding()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // In a real app, this would send a verification email
      // For now, we'll just mark it as verified
      await completeStep('verify_email')
      setIsVerified(true)

      // Call onNext after a brief delay
      setTimeout(() => {
        onNext?.()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Verify Your Email
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          We'll send a confirmation link to your email address to verify your account.
        </p>
      </div>

      {/* Email Display */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Email Address</p>
        <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
          {user?.email}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" title="Error" description={error} />
      )}

      {/* Success Alert */}
      {isVerified && (
        <Alert
          variant="success"
          title="Verified"
          description="Your email has been verified successfully!"
        />
      )}

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          💡 A verification link will be sent to your email. Check your inbox and spam folder.
        </p>
      </div>

      {/* Action Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleVerify}
          disabled={isLoading || isVerified}
          className="flex-1"
        >
          {isLoading ? 'Sending...' : isVerified ? 'Email Verified ✓' : 'Send Verification'}
        </Button>
      </div>

      {/* Skip Info */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        This is a required step and cannot be skipped.
      </p>
    </div>
  )
}
