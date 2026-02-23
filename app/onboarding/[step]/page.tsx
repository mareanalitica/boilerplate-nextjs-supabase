/**
 * Onboarding Step Page
 * Dynamic page that renders the appropriate step component
 */

'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks'
import { useOnboarding } from '@/lib/hooks'
import {
  VerifyEmailStep,
  CreateProfileStep,
  CreateOrganizationStep,
  SelectPlanStep,
  ConfigureBasicsStep,
  TutorialStep,
} from '@/components/onboarding'

const STEPS = [
  'verify_email',
  'create_profile',
  'create_organization',
  'select_plan',
  'configure_basics',
  'tutorial',
]

interface OnboardingStepPageProps {
  params: {
    step: string
  }
}

export default function OnboardingStepPage({ params }: OnboardingStepPageProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { isCompleted, currentStep } = useOnboarding()
  const [isClient, setIsClient] = useState(false)

  // Only run on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (isClient && !authLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isClient, authLoading, isAuthenticated, router])

  // Redirect if onboarding is complete
  useEffect(() => {
    if (isClient && !authLoading && isCompleted) {
      router.push('/dashboard')
    }
  }, [isClient, authLoading, isCompleted, router])

  // Validate step parameter
  if (!STEPS.includes(params.step)) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Invalid Step
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          The onboarding step "{params.step}" does not exist.
        </p>
        <button
          onClick={() => router.push('/onboarding/verify_email')}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          Start over
        </button>
      </div>
    )
  }

  const stepIndex = STEPS.indexOf(params.step)
  const nextStep = STEPS[stepIndex + 1]
  const previousStep = STEPS[stepIndex - 1]

  const handleNext = () => {
    if (nextStep) {
      router.push(`/onboarding/${nextStep}`)
    } else {
      router.push('/dashboard')
    }
  }

  const handlePrevious = () => {
    if (previousStep) {
      router.push(`/onboarding/${previousStep}`)
    }
  }

  const handleSkip = () => {
    if (nextStep) {
      router.push(`/onboarding/${nextStep}`)
    } else {
      router.push('/dashboard')
    }
  }

  // Loading state
  if (!isClient || authLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mt-8"></div>
      </div>
    )
  }

  // Render the appropriate step component
  switch (params.step) {
    case 'verify_email':
      return <VerifyEmailStep onNext={handleNext} />

    case 'create_profile':
      return (
        <CreateProfileStep onNext={handleNext} onPrevious={handlePrevious} />
      )

    case 'create_organization':
      return (
        <CreateOrganizationStep
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )

    case 'select_plan':
      return (
        <SelectPlanStep onNext={handleNext} onPrevious={handlePrevious} />
      )

    case 'configure_basics':
      return (
        <ConfigureBasicsStep
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
        />
      )

    case 'tutorial':
      return (
        <TutorialStep
          onComplete={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
        />
      )

    default:
      return null
  }
}
