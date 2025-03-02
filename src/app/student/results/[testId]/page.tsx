import { Suspense } from 'react'
import ResultsContent from '@/components/student/TestResults'

type Props = {
  params: { testId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ResultsPage({ params }: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsContent testId={params.testId} />
    </Suspense>
  )
} 