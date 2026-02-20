/**
 * Select Plan Step
 * Fourth step - Plan selection
 */

'use client'

import { useState } from 'react'
import { useOnboarding } from '@/lib/hooks'
import { getBillingService, PLAN_CONFIG } from '@/lib/services'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

export interface SelectPlanStepProps {
  onNext?: () => void
  onPrevious?: () => void
}

export function SelectPlanStep({ onNext, onPrevious }: SelectPlanStepProps) {
  const { completeStep, updateMetadata, data } = useOnboarding()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'enterprise'>(
    'free'
  )

  const handleSelectPlan = async (plan: 'free' | 'pro' | 'enterprise') => {
    try {
      setIsLoading(true)
      setError(null)

      // Store selected plan in metadata
      await updateMetadata({
        selectedPlan: plan,
      })

      setSelectedPlan(plan)
      await completeStep('select_plan')
      setTimeout(() => onNext?.(), 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select plan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Select the plan that best fits your needs. You can always upgrade or downgrade
          later.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" title="Error" description={error} />
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Free Plan */}
        <div
          className={`border rounded-lg p-6 cursor-pointer transition-all ${
            selectedPlan === 'free'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          onClick={() => handleSelectPlan('free')}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Free
              </h3>
              <p className="text-2xl font-bold text-green-600 mt-2">$0</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Forever free</p>
            </div>

            <div className="space-y-2">
              {PLAN_CONFIG.free.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <li>👤 1 user</li>
                <li>💾 1 GB storage</li>
                <li>📊 10k monthly requests</li>
              </ul>
            </div>

            <Button
              onClick={() => handleSelectPlan('free')}
              disabled={isLoading}
              variant={selectedPlan === 'free' ? 'default' : 'outline'}
              className="w-full"
            >
              {selectedPlan === 'free' ? 'Selected ✓' : 'Select'}
            </Button>
          </div>
        </div>

        {/* Pro Plan */}
        <div
          className={`border rounded-lg p-6 cursor-pointer transition-all relative ${
            selectedPlan === 'pro'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          onClick={() => handleSelectPlan('pro')}
        >
          <div className="absolute top-3 right-3 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs font-semibold px-2 py-1 rounded">
            Popular
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Pro
              </h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                ${PLAN_CONFIG.pro.price}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                /month, billed monthly
              </p>
            </div>

            <div className="space-y-2">
              {PLAN_CONFIG.pro.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <li>👥 5 users</li>
                <li>💾 100 GB storage</li>
                <li>📊 100k monthly requests</li>
              </ul>
            </div>

            <Button
              onClick={() => handleSelectPlan('pro')}
              disabled={isLoading}
              variant={selectedPlan === 'pro' ? 'default' : 'outline'}
              className="w-full"
            >
              {selectedPlan === 'pro' ? 'Selected ✓' : 'Select'}
            </Button>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div
          className={`border rounded-lg p-6 cursor-pointer transition-all ${
            selectedPlan === 'enterprise'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          onClick={() => handleSelectPlan('enterprise')}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Enterprise
              </h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">Custom</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Contact us for pricing
              </p>
            </div>

            <div className="space-y-2">
              {PLAN_CONFIG.enterprise.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <li>👥 Unlimited users</li>
                <li>💾 Unlimited storage</li>
                <li>📊 Unlimited requests</li>
              </ul>
            </div>

            <Button
              onClick={() => handleSelectPlan('enterprise')}
              disabled={isLoading}
              variant={selectedPlan === 'enterprise' ? 'default' : 'outline'}
              className="w-full"
            >
              {selectedPlan === 'enterprise' ? 'Selected ✓' : 'Select'}
            </Button>
          </div>
        </div>
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
        <Button disabled={isLoading} onClick={onNext} className="flex-1">
          {isLoading ? 'Processing...' : 'Continue'}
        </Button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        This is a required step and cannot be skipped.
      </p>
    </div>
  )
}
