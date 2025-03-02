"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import TestAnalytics from "@/components/teacher/TestAnalytics"
import type { User } from "@/types"

export default function AnalyticsPage({ params }: { params: Promise<{ testId: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const { testId } = use(params)

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (!storedUser) {
      router.push('/')
      return
    }

    const parsedUser: User = JSON.parse(storedUser)
    if (parsedUser.role !== 'teacher') {
      router.push('/')
      return
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading analytics...</div>
  }

  return <TestAnalytics testId={testId} />
} 