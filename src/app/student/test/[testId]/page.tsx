"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { TestConfig } from "@/types"
import { tests } from "@/data/mockData"
import TestInterface from "./testinterface"

interface User {
  id: string;
  role: string;
}

export default function TestPage({ params: { testId } }: { params: { testId: string } }) {
  const router = useRouter()
  const [test, setTest] = useState<TestConfig | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userStr)
    setUser(parsedUser)

    const foundTest = tests.find((t) => t.id.toString() === testId)
    if (!foundTest) {
      router.push("/student/dashboard")
      return
    }

    setTest(foundTest)
  }, [testId, router])

  if (!test || !user) {
    return <div>Loading...</div>
  }

  return <TestInterface test={test} userId={user.id} />
} 