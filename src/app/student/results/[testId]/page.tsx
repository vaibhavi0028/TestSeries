import { Suspense } from 'react'
import ResultsContent from '@/components/student/TestResults'

interface PageProps {
  params: {
    testId: string
  }
}

export default function ResultsPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsContent testId={params.testId} />
    </Suspense>
  )
} 