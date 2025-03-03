'use client'

import { Suspense } from 'react'
import TestResults from './TestResults'

interface ResultsPageProps {
  testId: string
}

export default function ResultsPage({ testId }: ResultsPageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestResults testId={testId} />
    </Suspense>
  )
} 