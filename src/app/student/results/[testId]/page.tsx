import TestResults from '@/components/student/TestResults'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { testId: string } }) {
  return {
    title: `Test Results - ${params.testId}`,
  }
}

export default function Page({
  params,
}: {
  params: { testId: string }
}) {
  return <TestResults testId={params.testId} />
} 