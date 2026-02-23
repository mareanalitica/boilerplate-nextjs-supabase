/**
 * Tutorial Step
 * Sixth step (optional) - Interactive tutorial
 */

'use client'

import { useState } from 'react'
import { useOnboarding } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const TUTORIALS = [
  {
    id: 1,
    title: 'Dashboard Overview',
    description: 'Learn about the main dashboard and what you can do there.',
    icon: '📊',
  },
  {
    id: 2,
    title: 'Team Management',
    description: 'Add team members and manage their roles and permissions.',
    icon: '👥',
  },
  {
    id: 3,
    title: 'Settings & Configuration',
    description: 'Customize your account and organization settings.',
    icon: '⚙️',
  },
  {
    id: 4,
    title: 'Billing & Plans',
    description: 'Manage your subscription and view invoices.',
    icon: '💳',
  },
]

export interface TutorialStepProps {
  onComplete?: () => void
  onPrevious?: () => void
  onSkip?: () => void
}

export function TutorialStep({ onComplete, onPrevious, onSkip }: TutorialStepProps) {
  const { completeStep, completeOnboarding } = useOnboarding()
  const [isLoading, setIsLoading] = useState(false)
  const [completedTutorials, setCompletedTutorials] = useState<number[]>([])

  const handleCompleteTutorial = (tutorialId: number) => {
    setCompletedTutorials((prev) =>
      prev.includes(tutorialId)
        ? prev.filter((id) => id !== tutorialId)
        : [...prev, tutorialId]
    )
  }

  const handleFinish = async () => {
    try {
      setIsLoading(true)

      await completeStep('tutorial')
      await completeOnboarding()

      setTimeout(() => {
        onComplete?.()
      }, 500)
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Learn the Basics
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          We've prepared some quick tutorials to help you get started. Check the ones
          you'd like to watch.
        </p>
      </div>

      {/* Tutorials Grid */}
      <div className="space-y-3">
        {TUTORIALS.map((tutorial) => (
          <div
            key={tutorial.id}
            onClick={() => handleCompleteTutorial(tutorial.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              completedTutorials.includes(tutorial.id)
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{tutorial.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {tutorial.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {tutorial.description}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    completedTutorials.includes(tutorial.id)
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {completedTutorials.includes(tutorial.id) && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="text-sm">
          <div className="flex justify-between mb-2">
            <span className="font-medium text-gray-900 dark:text-white">
              Tutorials watched
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {completedTutorials.length}/{TUTORIALS.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{
                width: `${(completedTutorials.length / TUTORIALS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          💡 <strong>Tip:</strong> You can always access these tutorials later from the help
          menu in your account.
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
        <Button onClick={handleFinish} disabled={isLoading} className="flex-1">
          {isLoading ? 'Completing...' : 'Finish'}
        </Button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        This is the last optional step. You're almost done!
      </p>
    </div>
  )
}
