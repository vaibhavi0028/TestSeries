"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { QuestionType, TestConfig, TestResult, User } from "@/types"
import { Button } from "@/components/ui/button"

export default function TestResults({ params }: { params: { testId: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [test, setTest] = useState<TestConfig | null>(null)
  const [questions, setQuestions] = useState<QuestionType[]>([])
  const [result, setResult] = useState<TestResult | null>(null)

  useEffect(() => {
    const storedTests = localStorage.getItem('tests')
    const storedQuestions = localStorage.getItem('questions')
    const storedUser = localStorage.getItem('currentUser')
    const storedResults = localStorage.getItem('testResults')

    if (!storedTests || !storedQuestions || !storedUser || !storedResults) {
      router.push('/')
      return
    }

    const tests: TestConfig[] = JSON.parse(storedTests)
    const allQuestions: QuestionType[] = JSON.parse(storedQuestions)
    const user: User = JSON.parse(storedUser)
    const results = JSON.parse(storedResults)

    const currentTest = tests.find(t => t.id === params.testId)
    if (!currentTest) {
      router.push('/student/dashboard')
      return
    }

    const testResult = results[`${params.testId}_${user.id}`]
    if (!testResult) {
      router.push('/student/dashboard')
      return
    }

    setTest(currentTest)
    setQuestions(allQuestions.filter(q => currentTest.questionIds.includes(q.id)))
    setResult(testResult)
    setLoading(false)
  }, [params.testId, router])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  }

  if (loading) {
    return <div>Loading results...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-black">{test?.title} - Results</h1>
            <Button 
              onClick={() => router.push('/student/dashboard')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-black">Total Questions</h3>
              <p className="text-2xl font-bold text-black">{result?.totalQuestions}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-black">Correct Answers</h3>
              <p className="text-2xl font-bold text-green-600">{result?.correctAnswers}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-black">Incorrect Answers</h3>
              <p className="text-2xl font-bold text-red-600">{result?.incorrectAnswers}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-black">Marked for Review</h3>
              <p className="text-2xl font-bold text-yellow-600">{result?.markedForReview}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-black mb-4">Performance Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-black">Time Taken:</span>
                <span className="font-medium text-black">{formatTime(result?.timeTaken || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black">Score:</span>
                <span className="font-medium text-black">{result?.score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black">Accuracy:</span>
                <span className="font-medium text-black">
                  {((result?.correctAnswers || 0) / (result?.totalQuestions || 1) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-4">Question-wise Analysis</h2>
            <div className="space-y-4">
              {questions.map((question, index) => {
                const stat = result?.questionStats.find(s => s.questionId === question.id)
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-black font-medium">Question {index + 1}</h3>
                      <div className={`px-2 py-1 rounded text-sm ${
                        !stat?.attempted ? 'bg-gray-100 text-gray-700' :
                        stat.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {!stat?.attempted ? 'Not Attempted' : stat.isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>
                    <p className="text-black mb-2">{question.text}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            question.correctAnswer === optIndex ? 'bg-green-100' :
                            stat?.attempted && !stat.isCorrect ? 'bg-red-100' : 'bg-gray-50'
                          }`}
                        >
                          <span className="text-black">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 