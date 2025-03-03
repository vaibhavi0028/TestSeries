/* eslint-disable @typescript-eslint/no-explicit-any */

import { Suspense } from 'react'
import ResultsContent from '@/components/student/TestResults'
import { Metadata } from 'next'

export interface PageProps {
  params: Promise<{ testId: string }>
  searchParams?: any
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  return {
    title: `Test Results - ${resolvedParams.testId}`,
  }
}

export default async function ResultsPage(props: PageProps) {
  const resolvedParams = await props.params
  const testId = resolvedParams.testId

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsContent testId={testId} />
    </Suspense>
  )
} 