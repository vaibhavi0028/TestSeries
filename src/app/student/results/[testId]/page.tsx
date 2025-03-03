import { Metadata } from 'next'
import ResultsPage from '@/components/student/ResultsPage'

interface Props {
  params: {
    testId: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Test Results - ${params.testId}`,
  }
}

export default function Page({ params }: Props) {
  return <ResultsPage testId={params.testId} />
} 