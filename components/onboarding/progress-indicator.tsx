/**
 * Onboarding Progress Indicator
 * Visual representation of onboarding progress
 */

'use client'

import { useOnboarding } from '@/lib/hooks'

export interface ProgressIndicatorProps {
  className?: string
}

export function ProgressIndicator({ className = '' }: ProgressIndicatorProps) {
  const { progress, completedSteps } = useOnboarding()

  const steps = [
    { id: 'verify_email', label: 'Verify Email' },
    { id: 'create_profile', label: 'Profile' },
    { id: 'create_organization', label: 'Organization' },
    { id: 'select_plan', label: 'Plan' },
    { id: 'configure_basics', label: 'Configure' },
    { id: 'tutorial', label: 'Tutorial' },
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Setup Progress
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id as any)
          const isCurrent = index === completedSteps.length

          return (
            <div key={step.id} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isCompleted
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : isCurrent
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 ring-2 ring-blue-300 dark:ring-blue-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={`text-xs text-center leading-tight ${
                  isCompleted || isCurrent
                    ? 'text-gray-900 dark:text-white font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Completed Count */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {completedSteps.length} of 6 steps completed
        </p>
      </div>
    </div>
  )
}
