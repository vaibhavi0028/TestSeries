/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { TestConfig } from "@/types"
import { tests } from "@/data/mockData"
import TestInterface from "./testinterface"

export default function Page({ params }: any) {
  const router = useRouter()
  const [test, setTest] = useState<TestConfig | null>(null)
  const [user, setUser] = useState<{ id: string; role: string } | null>(null)
  const testId = params?.testId

  useEffect(() => {
    // Check user authentication
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userStr)
      setUser(parsedUser)

      // Find the test
      const foundTest = tests.find((t) => t.id.toString() === testId)
      if (!foundTest) {
        router.push("/student/dashboard")
        return
      }

      setTest(foundTest)
    } catch (error) {
      console.error("Error loading test:", error)
      router.push("/student/dashboard")
    }
  }, [testId, router])

  if (!test || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return <TestInterface test={test} userId={user.id} />
} 