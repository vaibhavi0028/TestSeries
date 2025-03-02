"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { TestConfig, TestResult } from "@/types"
import { formatTime } from "@/lib/utils"
import { questions } from "@/data/mockData"

interface TestResultsProps {
  testId: string
}

export default function TestResults({ testId }: TestResultsProps) {
  const router = useRouter()
  const [results, setResults] = useState<TestResult | null>(null)
  const [test, setTest] = useState<TestConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userStr)
    const userId = parsedUser.id

    const storedResults = localStorage.getItem(`test_result_${testId}_${userId}`)
    if (storedResults) {
      setResults(JSON.parse(storedResults))
    }

    const storedTests = localStorage.getItem("tests")
    if (storedTests) {
      const tests: TestConfig[] = JSON.parse(storedTests)
      const foundTest = tests.find((t) => t.id === testId)
      if (foundTest) {
        setTest(foundTest)
      }
    }

    setLoading(false)
  }, [testId, router])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading results...</div>
  }

  if (!results || !test) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Results Not Found</h1>
        <p className="mb-6">We couldn&apos;t find the results for this test.</p>
        <Button onClick={() => router.push("/student/dashboard")}>Back to Dashboard</Button>
      </div>
    )
  }

  const accuracy =
    results.totalQuestions > 0
      ? Math.round((results.correctAnswers / (results.correctAnswers + results.incorrectAnswers)) * 100)
      : 0

  const sortedQuestions = [...results.questionStats].sort((a, b) => b.timeSpent - a.timeSpent)
  const topTimeQuestions = sortedQuestions.slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="bg-blue-900 text-white p-6">
            <h1 className="text-2xl font-bold">{test.title} - Results</h1>
            <p className="text-sm mt-2">Completed on {new Date(results.submittedAt).toLocaleString()}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Score</h3>
                <p className="text-3xl font-bold text-blue-600">{results.score}</p>
                <p className="text-sm text-gray-500">Out of {results.totalQuestions * 4}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Accuracy</h3>
                <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
                <p className="text-sm text-gray-500">
                  {results.correctAnswers} correct, {results.incorrectAnswers} incorrect
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Time Taken</h3>
                <p className="text-3xl font-bold text-purple-600">{formatTime(results.timeTaken)}</p>
                <p className="text-sm text-gray-500">Out of {formatTime(test.duration)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Question Summary</h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-2 gap-4 p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Total Questions</span>
                      <span className="text-xl font-semibold">{results.totalQuestions}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Attempted</span>
                      <span className="text-xl font-semibold">{results.correctAnswers + results.incorrectAnswers}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Correct</span>
                      <span className="text-xl font-semibold text-green-600">{results.correctAnswers}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Incorrect</span>
                      <span className="text-xl font-semibold text-red-600">{results.incorrectAnswers}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Unattempted</span>
                      <span className="text-xl font-semibold text-gray-600">{results.unattempted}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Marked for Review</span>
                      <span className="text-xl font-semibold text-purple-600">{results.markedForReview}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Time Analysis</h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="p-4">
                    <h4 className="text-md font-medium mb-2">Questions with Most Time Spent</h4>
                    <div className="space-y-3">
                      {topTimeQuestions.map((stat) => {
                        const question = questions.find((q) => q.id === stat.questionId)
                        return (
                          <div key={stat.questionId} className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="text-sm font-medium truncate">
                                Q{stat.questionId}: {question?.text.substring(0, 40)}...
                              </p>
                              <p className="text-xs text-gray-500">
                                {stat.attempted ? (stat.isCorrect ? "Correct" : "Incorrect") : "Unattempted"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{formatTime(stat.timeSpent)}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-black">Subject-wise Performance</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                  <thead>
                    <tr className="bg-gray-600">
                      <th className="py-3 px-4 text-left">Subject</th>
                      <th className="py-3 px-4 text-left">Questions</th>
                      <th className="py-3 px-4 text-left">Attempted</th>
                      <th className="py-3 px-4 text-left">Correct</th>
                      <th className="py-3 px-4 text-left">Incorrect</th>
                      <th className="py-3 px-4 text-left">Score</th>
                      <th className="py-3 px-4 text-left">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {test.subjects.map((subject) => {
                      const subjectQuestions = questions.filter(
                        (q) => q.subject === subject && test.questionIds.includes(q.id),
                      )

                      const subjectStats = {
                        total: subjectQuestions.length,
                        attempted: 0,
                        correct: 0,
                        incorrect: 0,
                        score: 0,
                      }

                      subjectQuestions.forEach((q) => {
                        const stat = results.questionStats.find((s) => s.questionId === q.id)
                        if (stat) {
                          if (stat.attempted) {
                            subjectStats.attempted++
                            if (stat.isCorrect) {
                              subjectStats.correct++
                              subjectStats.score += 4
                            } else {
                              subjectStats.incorrect++
                              subjectStats.score -= 1
                            }
                          }
                        }
                      })

                      const subjectAccuracy =
                        subjectStats.attempted > 0
                          ? Math.round((subjectStats.correct / subjectStats.attempted) * 100)
                          : 0

                      return (
                        <tr key={subject} className="border-t">
                          <td className="py-3 px-4">{subject}</td>
                          <td className="py-3 px-4">{subjectStats.total}</td>
                          <td className="py-3 px-4">{subjectStats.attempted}</td>
                          <td className="py-3 px-4 text-green-600">{subjectStats.correct}</td>
                          <td className="py-3 px-4 text-red-600">{subjectStats.incorrect}</td>
                          <td className="py-3 px-4 font-semibold">{subjectStats.score}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full"
                                  style={{ width: `${subjectAccuracy}%` }}
                                ></div>
                              </div>
                              <span>{subjectAccuracy}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/student/dashboard")}>
            Back to Dashboard
          </Button>
          <Button
            onClick={() => {
              window.print()
            }}
          >
            Download Report
          </Button>
        </div>
      </div>
    </div>
  )
}

