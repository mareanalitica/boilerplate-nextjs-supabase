/**
 * Preferences Context Provider
 * Manages user preferences and settings
 */

'use client'

import React, { createContext, useReducer } from 'react'
import {
  PreferencesState,
  PreferencesContextType,
  initialPreferencesState,
} from '../types/preferences-state'
import { preferencesReducer } from '../reducers/preferences-reducer'

export const PreferencesContext = createContext<
  PreferencesContextType | undefined
>(undefined)

interface PreferencesProviderProps {
  children: React.ReactNode
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [state, dispatch] = useReducer(
    preferencesReducer,
    initialPreferencesState
  )

  const value: PreferencesContextType = {
    state,
    dispatch,
  }

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

/**
 * Hook to use Preferences Context
 */
export function usePreferencesContext(): PreferencesContextType {
  const context = React.useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error(
      'usePreferencesContext must be used inside PreferencesProvider'
    )
  }
  return context
}
