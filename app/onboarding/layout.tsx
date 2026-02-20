/**
 * Onboarding Layout
 * Layout container for the onboarding flow
 */

import { ProgressIndicator } from '@/components/onboarding'

export const metadata = {
  title: 'Get Started - SaaS Minimal',
  description: 'Complete your account setup and get started with SaaS Minimal.',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="flex h-screen">
        {/* Left Side - Progress and Info */}
        <div className="hidden lg:flex lg:w-1/3 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col justify-between p-8">
          <div>
            {/* Logo/Branding */}
            <div className="mb-12">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                SaaS Minimal
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Welcome to your new workspace
              </p>
            </div>

            {/* Progress */}
            <ProgressIndicator />
          </div>

          {/* Footer Info */}
          <div className="space-y-4 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p className="font-semibold mb-2">You'll need:</p>
              <ul className="space-y-1">
                <li>✓ Your email address</li>
                <li>✓ A name for your organization</li>
                <li>✓ A few minutes of your time</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-2/3 flex flex-col justify-center p-4 sm:p-6 lg:p-12">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Progress */}
            <div className="lg:hidden mb-8">
              <ProgressIndicator />
            </div>

            {/* Step Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
