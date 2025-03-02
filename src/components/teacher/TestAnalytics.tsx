"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { TestConfig, TestResult } from "@/types"
import { formatTime } from "@/lib/utils"
import { questions, users } from "@/data/mockData"

interface TestAnalyticsProps {
  testId: string
}

export default function TestAnalytics({ testId }: TestAnalyticsProps) {
  const [test, setTest] = useState<TestConfig | null>(null)
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedTests = localStorage.getItem("tests")
    if (storedTests) {
      const tests: TestConfig[] = JSON.parse(storedTests)
      const foundTest = tests.find((t) => t.id === testId)
      if (foundTest) {
        setTest(foundTest)

        const allResults: TestResult[] = []
        foundTest?.assignedTo.forEach((userId) => {
          const storedResult = localStorage.getItem(`test_result_${testId}_${userId}`)
          if (storedResult) {
            allResults.push(JSON.parse(storedResult))
          }
        })

        setResults(allResults)
      }
    }

    setLoading(false)
  }, [testId])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading analytics...</div>
  }

  if (!test) {
    return <div className="flex items-center justify-center h-screen">Test not found</div>
  }

  const totalStudents = test.assignedTo.length
  const attemptedCount = results.length
  const averageScore =
    results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0
  const highestScore = results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0
  const lowestScore = results.length > 0 ? Math.min(...results.map((r) => r.score)) : 0
  const averageAccuracy =
    results.length > 0
      ? Math.round(
          results.reduce(
            (sum, r) => sum + ((r.correctAnswers / (r.correctAnswers + r.incorrectAnswers)) * 100 || 0),
            0,
          ) / results.length,
        )
      : 0
  const questionDifficulty = test.questionIds
    .map((qId) => {
      const questionResults = results.filter((r) => r.questionStats.some((s) => s.questionId === qId && s.attempted))

      const correctCount = questionResults.filter((r) =>
        r.questionStats.some((s) => s.questionId === qId && s.isCorrect),
      ).length

      const attemptedCount = questionResults.length

      return {
        questionId: qId,
        correctRate: attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0,
        attemptedCount,
      }
    })
    .sort((a, b) => a.correctRate - b.correctRate)

  const exportCSV = () => {
    let csv = "Student ID,Student Name,Score,Correct Answers,Incorrect Answers,Unattempted,Time Taken,Submission Time\n"

    results.forEach((result) => {
      const student = users.find((u) => u.id === result.userId)
      csv += `${result.userId},${student?.name || "Unknown"},${result.score},${result.correctAnswers},${result.incorrectAnswers},${result.unattempted},${formatTime(result.timeTaken)},${new Date(result.submittedAt).toLocaleString()}\n`
    })

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", `${test.title}_results.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="bg-blue-900 text-white p-6">
            <h1 className="text-2xl font-bold">{test.title} - Analytics</h1>
            <p className="text-sm mt-2">Scheduled for {new Date(test.scheduledFor).toLocaleString()}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg shadow-md border-t-4 border-blue-600">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Participation</h3>
                <p className="text-3xl font-bold text-blue-700 mb-1">{attemptedCount}/{totalStudents}</p>
                <p className="text-sm text-blue-600">Students completed</p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg shadow-md border-t-4 border-green-600">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Average Score</h3>
                <p className="text-3xl font-bold text-green-700 mb-1">{averageScore}</p>
                <p className="text-sm text-green-600">Out of {test.questionIds.length * 4}</p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg shadow-md border-t-4 border-yellow-600">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Score Range</h3>
                <p className="text-3xl font-bold text-yellow-700 mb-1">{lowestScore} - {highestScore}</p>
                <p className="text-sm text-yellow-600">Min - Max</p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg shadow-md border-t-4 border-purple-600">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Average Accuracy</h3>
                <p className="text-3xl font-bold text-purple-700 mb-1">{averageAccuracy}%</p>
                <p className="text-sm text-purple-600">Correct answers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-black">Student Performance</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-600 p-3 border-b grid grid-cols-12 gap-2">
                    <div className="col-span-3 font-medium">Student</div>
                    <div className="col-span-2 font-medium">Score</div>
                    <div className="col-span-2 font-medium">Correct</div>
                    <div className="col-span-2 font-medium">Incorrect</div>
                    <div className="col-span-3 font-medium">Time Taken</div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {results.length > 0 ? (
                      results
                        .sort((a, b) => b.score - a.score)
                        .map((result) => {
                          const student = users.find((u) => u.id === result.userId)
                          return (
                            <div key={result.userId} className="p-3 border-b grid grid-cols-12 gap-2 hover:bg-gray-50">
                              <div className="col-span-3 truncate text-black">{student?.name || result.userId}</div>
                              <div className="col-span-2 font-semibold text-black">{result.score}</div>
                              <div className="col-span-2 text-black">{result.correctAnswers}</div>
                              <div className="col-span-2 text-black">{result.incorrectAnswers}</div>
                              <div className="col-span-3 text-black">{formatTime(result.timeTaken)}</div>
                            </div>
                          )
                        })
                    ) : (
                      <div className="p-4 text-center text-black">No students have completed this test yet</div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-black">Question Difficulty</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-600 p-3 border-b grid grid-cols-12 gap-2">
                    <div className="col-span-1 font-medium">ID</div>
                    <div className="col-span-7 font-medium">Question</div>
                    <div className="col-span-2 font-medium">Attempted</div>
                    <div className="col-span-2 font-medium">Correct %</div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {questionDifficulty.length > 0 ? (
                      questionDifficulty.map((qData) => {
                        const question = questions.find((q) => q.id === qData.questionId)
                        return (
                          <div key={qData.questionId} className="p-3 border-b grid grid-cols-12 gap-2 hover:bg-gray-50">
                            <div className="col-span-1 text-black">{qData.questionId}</div>
                            <div className="col-span-7 truncate text-black">{question?.text}</div>
                            <div className="col-span-2 text-black">
                              {qData.attemptedCount}/{results.length}
                            </div>
                            <div className="col-span-2">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div
                                    className={`h-2.5 rounded-full ${
                                      qData.correctRate < 30
                                        ? "bg-red-600"
                                        : qData.correctRate < 70
                                          ? "bg-yellow-500"
                                          : "bg-green-600"
                                    }`}
                                    style={{ width: `${qData.correctRate}%` }}
                                  ></div>
                                </div>
                                <span className="text-black">{Math.round(qData.correctRate)}%</span>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-4 text-center text-black">No data available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-black">Subject-wise Performance</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-600 p-3 border-b grid grid-cols-12 gap-2">
                  <div className="col-span-3 font-medium text-white">Subject</div>
                  <div className="col-span-2 font-medium text-white">Questions</div>
                  <div className="col-span-2 font-medium text-white">Avg. Correct</div>
                  <div className="col-span-2 font-medium text-white">Avg. Incorrect</div>
                  <div className="col-span-3 font-medium text-white">Avg. Accuracy</div>
                </div>

                <div>
                  {test.subjects.map((subject) => {
                    const subjectQuestions = questions.filter(
                      (q) => q.subject === subject && test.questionIds.includes(q.id),
                    )

                    let totalCorrect = 0
                    let totalIncorrect = 0
                    let totalAttempted = 0

                    results.forEach((result) => {
                      subjectQuestions.forEach((q) => {
                        const stat = result.questionStats.find((s) => s.questionId === q.id)
                        if (stat) {
                          if (stat.attempted) {
                            totalAttempted++
                            if (stat.isCorrect) {
                              totalCorrect++
                            } else {
                              totalIncorrect++
                            }
                          }
                        }
                      })
                    })

                    const avgCorrect = results.length > 0 ? (totalCorrect / results.length).toFixed(1) : "0"

                    const avgIncorrect = results.length > 0 ? (totalIncorrect / results.length).toFixed(1) : "0"

                    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0

                    return (
                      <div key={subject} className="p-3 border-b grid grid-cols-12 gap-2 hover:bg-gray-50">
                        <div className="col-span-3 text-black">{subject}</div>
                        <div className="col-span-2 text-black">{subjectQuestions.length}</div>
                        <div className="col-span-2 text-black">{avgCorrect}</div>
                        <div className="col-span-2 text-black">{avgIncorrect}</div>
                        <div className="col-span-3">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                              <div
                                className={`h-2.5 rounded-full ${
                                  accuracy < 30 ? "bg-red-600" : accuracy < 70 ? "bg-yellow-500" : "bg-green-600"
                                }`}
                                style={{ width: `${accuracy}%` }}
                              ></div>
                            </div>
                            <span className="text-black">{accuracy}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
          >
            Back
          </Button>
          <Button 
            onClick={exportCSV}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Export Results (CSV)
          </Button>
        </div>
      </div>
    </div>
  )
}

