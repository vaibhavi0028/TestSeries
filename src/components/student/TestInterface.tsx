"use client"

import { useState, useEffect, useRef } from "react"
import { useCallback } from "react";
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { QuestionType, TestConfig, TestSession } from "@/types"
import { formatTime, generateSessionId, getQuestionStatus } from "@/lib/utils"
import { questions } from "@/data/mockData"
import Image from 'next/image'

interface TestInterfaceProps {
  test: TestConfig
  userId: string
}

export default function TestInterface({ test, userId }: TestInterfaceProps) {
  const router = useRouter()
  const [session, setSession] = useState<TestSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<QuestionType | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWarning, setShowWarning] = useState(false)
  const [currentSubject, setCurrentSubject] = useState<string | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const questionStartTimeRef = useRef<number>(Date.now())
  const visibilityWarningCount = useRef<number>(0)

  const submitTest = useCallback(() => {
    if (!session) return

    const results = {
      testId: test.id,
      userId: userId,
      score: 0,
      totalQuestions: test.questionIds.length,
      correctAnswers: 0,
      incorrectAnswers: 0,
      unattempted: 0,
      markedForReview: 0,
      timeTaken: test.duration - session.remainingTime,
      submittedAt: Date.now(),
      questionStats: [] as { questionId: number; timeSpent: number; isCorrect: boolean; attempted: boolean }[],
    }

    Object.values(session.answers).forEach((answer) => {
      const question = questions.find((q) => q.id === answer.questionId)
      if (!question) return

      const isAttempted = answer.selectedOption !== null
      const isCorrect = isAttempted && answer.selectedOption === question.correctAnswer

      if (isAttempted) {
        if (isCorrect) {
          results.correctAnswers += 1
          results.score += 4
        } else {
          results.incorrectAnswers += 1
          results.score -= 1
        }
      } else {
        results.unattempted += 1
      }

      if (answer.markedForReview) {
        results.markedForReview += 1
      }

      results.questionStats.push({
        questionId: answer.questionId,
        timeSpent: answer.timeSpent,
        isCorrect: isCorrect,
        attempted: isAttempted,
      })
    })

    localStorage.setItem(`test_result_${test.id}_${userId}`, JSON.stringify(results))

    setSession((prev) => {
      if (!prev) return prev

      const updatedSession = {
        ...prev,
        completed: true,
        endTime: Date.now(),
      }

      localStorage.setItem(`test_session_${test.id}_${userId}`, JSON.stringify(updatedSession))

      return updatedSession
    })

    router.push(`/student/results/${test.id}`)
  }, [session, test.id, test.duration, test.questionIds.length, userId, router])

  useEffect(() => {
    const storedSession = localStorage.getItem(`test_session_${test.id}_${userId}`)

    if (storedSession) {
      const parsedSession: TestSession = JSON.parse(storedSession)
      setSession(parsedSession)

      const question = questions.find((q) => q.id === parsedSession.currentQuestionId)
      if (question) {
        setCurrentQuestion(question)
        setCurrentSubject(question.subject)
      }
    } else {
      const newSession: TestSession = {
        id: generateSessionId(),
        userId,
        testId: test.id,
        startTime: Date.now(),
        remainingTime: test.duration,
        currentQuestionId: test.questionIds[0],
        answers: {},
        tabSwitchCount: 0,
        completed: false,
      }

      test.questionIds.forEach((qId) => {
        newSession.answers[qId] = {
          questionId: qId,
          selectedOption: null,
          markedForReview: false,
          timeSpent: 0,
          visited: false,
        }
      })

      setSession(newSession)

      const firstQuestion = questions.find((q) => q.id === test.questionIds[0])
      if (firstQuestion) {
        setCurrentQuestion(firstQuestion)
        setCurrentSubject(firstQuestion.subject)
      }
    }

    setLoading(false)
  }, [test, userId])

  useEffect(() => {
    if (!session) return

    timerRef.current = setInterval(() => {
      setSession((prev) => {
        if (!prev) return prev

        const newRemainingTime = prev.remainingTime - 1

        if (newRemainingTime <= 0) {
          clearInterval(timerRef.current!)
          submitTest()
          return prev
        }

        const updatedSession = {
          ...prev,
          remainingTime: newRemainingTime,
        }

        localStorage.setItem(`test_session_${test.id}_${userId}`, JSON.stringify(updatedSession))

        return updatedSession
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [session, test.id, userId, submitTest])

  useEffect(() => {
    if (!session || !currentQuestion) return

    questionStartTimeRef.current = Date.now()

    questionTimerRef.current = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000)

      setSession((prev) => {
        if (!prev || !currentQuestion) return prev

        const updatedAnswers = { ...prev.answers }
        updatedAnswers[currentQuestion.id] = {
          ...updatedAnswers[currentQuestion.id],
          timeSpent: (updatedAnswers[currentQuestion.id]?.timeSpent || 0) + 1,
          visited: true,
        }

        const updatedSession = {
          ...prev,
          answers: updatedAnswers,
        }

        if (timeSpent % 5 === 0) {
          localStorage.setItem(`test_session_${test.id}_${userId}`, JSON.stringify(updatedSession))
        }

        return updatedSession
      })
    }, 1000)

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current)
    }
  }, [currentQuestion, session, test.id, userId, submitTest])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        visibilityWarningCount.current += 1
        setShowWarning(true)

        if (visibilityWarningCount.current >= 3) {
          submitTest()
        }

        setSession((prev) => {
          if (!prev) return prev

          const updatedSession = {
            ...prev,
            tabSwitchCount: prev.tabSwitchCount + 1,
          }

          localStorage.setItem(`test_session_${test.id}_${userId}`, JSON.stringify(updatedSession))

          return updatedSession
        })
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [test.id, userId, submitTest])

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "v" || e.key === "x")) {
        e.preventDefault()
      }
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullScreen(false)
        })
      }
    }
  }

  const handleOptionSelect = (optionIndex: number) => {
    if (!session || !currentQuestion) return

    setSession((prev) => {
      if (!prev || !currentQuestion) return prev

      const updatedAnswers = { ...prev.answers }
      updatedAnswers[currentQuestion.id] = {
        ...updatedAnswers[currentQuestion.id],
        selectedOption: optionIndex,
        visited: true,
      }

      const updatedSession = {
        ...prev,
        answers: updatedAnswers,
      }

      localStorage.setItem(`test_session_${test.id}_${userId}`, JSON.stringify(updatedSession))

      return updatedSession
    })
  }

  const goToNextQuestion = () => {
    if (!session || !currentQuestion) return

    const currentIndex = test.questionIds.indexOf(currentQuestion.id)
    if (currentIndex < test.questionIds.length - 1) {
      const nextQuestionId = test.questionIds[currentIndex + 1]
      navigateToQuestion(nextQuestionId)
    }
  }

  const goToPrevQuestion = () => {
    if (!session || !currentQuestion) return

    const currentIndex = test.questionIds.indexOf(currentQuestion.id)
    if (currentIndex > 0) {
      const prevQuestionId = test.questionIds[currentIndex - 1]
      navigateToQuestion(prevQuestionId)
    }
  }

  const navigateToQuestion = (questionId: number) => {
    if (!session) return

    const question = questions.find((q) => q.id === questionId)
    if (!question) return

    setSession((prev) => {
      if (!prev) return prev

      const updatedSession = {
        ...prev,
        currentQuestionId: questionId,
      }

      localStorage.setItem(`test_session_${test.id}_${userId}`, JSON.stringify(updatedSession))

      return updatedSession
    })

    setCurrentQuestion(question)
    setCurrentSubject(question.subject)
  }

  const markForReview = () => {
    if (!session || !currentQuestion) return

    setSession((prev) => {
      if (!prev || !currentQuestion) return prev

      const updatedAnswers = { ...prev.answers }
      updatedAnswers[currentQuestion.id] = {
        ...updatedAnswers[currentQuestion.id],
        markedForReview: true,
        visited: true,
      }

      const updatedSession = {
        ...prev,
        answers: updatedAnswers,
      }

      localStorage.setItem(`test_session_${test.id}_${userId}`, JSON.stringify(updatedSession))

      return updatedSession
    })

    goToNextQuestion()
  }

  const clearResponse = () => {
    if (!session || !currentQuestion) return

    setSession((prev) => {
      if (!prev || !currentQuestion) return prev

      const updatedAnswers = { ...prev.answers }
      updatedAnswers[currentQuestion.id] = {
        ...updatedAnswers[currentQuestion.id],
        selectedOption: null,
      }

      const updatedSession = {
        ...prev,
        answers: updatedAnswers,
      }

      localStorage.setItem(`test_session_${test.id}_${userId}`, JSON.stringify(updatedSession))

      return updatedSession
    })
  }

  const filterQuestionsBySubject = (subject: string) => {
    setCurrentSubject(subject)

    const firstQuestionOfSubject = questions.find((q) => q.subject === subject && test.questionIds.includes(q.id))
    if (firstQuestionOfSubject) {
      navigateToQuestion(firstQuestionOfSubject.id)
    }
  }

  if (loading || !session || !currentQuestion) {
    return <div className="flex items-center justify-center h-screen">Loading test...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Warning!</h2>
            <p className="mb-4">You have switched tabs or windows. This is against the test rules.</p>
            <p className="mb-4">Warnings: {visibilityWarningCount.current}/3</p>
            <p className="mb-4 font-semibold">Your test will be automatically submitted after 3 warnings.</p>
            <Button onClick={() => setShowWarning(false)} className="w-full">
              I Understand
            </Button>
          </div>
        </div>
      )}

      <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Image
            src="/placeholder.svg?height=50&width=50"
            alt="Logo"
            width={50}
            height={50}
            layout="responsive"
          />
          <div>
            <h1 className="text-xl font-bold">National Testing Agency</h1>
            <p className="text-sm">Ministry of Education, Government of India</p>
          </div>
        </div>
        <div>
          <Button variant="outline" onClick={toggleFullScreen} className="text-white border-white hover:bg-blue-800">
            {isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          </Button>
        </div>
      </header>

      <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="bg-gray-300 p-2 rounded-md">
            <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-x-2 text-sm">
              <span className="font-semibold">Candidate Name:</span>
              <span>{userId}</span>
              <span className="font-semibold">Exam Name:</span>
              <span>{test.title}</span>
              <span className="font-semibold">Subject Name:</span>
              <span>{currentSubject}</span>
              <span className="font-semibold">Remaining Time:</span>
              <span className="bg-blue-500 text-white px-2 py-1 rounded">{formatTime(session.remainingTime)}</span>
            </div>
          </div>
        </div>

        <div>
          <select
            className="p-2 border rounded-md"
            value={currentSubject || ""}
            onChange={(e) => filterQuestionsBySubject(e.target.value)}
          >
            {test.subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-1 h-[calc(100vh-180px)]">
        <div className="w-3/4 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Question {test.questionIds.indexOf(currentQuestion.id) + 1}:</h2>
              <Button variant="outline" size="sm">
                <span className="text-blue-600">Report Issue</span>
              </Button>
            </div>

            <div className="mb-6">
              <p className="text-lg">{currentQuestion.text}</p>
            </div>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-md cursor-pointer ${
                    session.answers[currentQuestion.id]?.selectedOption === index
                      ? "bg-blue-100 border-blue-500"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleOptionSelect(index)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                        session.answers[currentQuestion.id]?.selectedOption === index
                          ? "bg-blue-500 text-white"
                          : "border border-gray-400"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <div className="space-x-2">
                <Button
                  variant="success"
                  onClick={() => {
                    goToNextQuestion()
                  }}
                >
                  Save & Next
                </Button>
                <Button variant="outline" onClick={clearResponse}>
                  Clear
                </Button>
                <Button variant="warning" onClick={markForReview}>
                  Save & Mark for Review
                </Button>
                <Button
                  variant="info"
                  onClick={() => {
                    markForReview()
                    goToNextQuestion()
                  }}
                >
                  Mark for Review & Next
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={goToPrevQuestion}
              disabled={test.questionIds.indexOf(currentQuestion.id) === 0}
            >
              « Back
            </Button>
            <Button
              variant="outline"
              onClick={goToNextQuestion}
              disabled={test.questionIds.indexOf(currentQuestion.id) === test.questionIds.length - 1}
            >
              Next »
            </Button>
            <Button
              variant="success"
              onClick={() => {
                if (window.confirm("Are you sure you want to submit the test? This action cannot be undone.")) {
                  submitTest()
                }
              }}
            >
              Submit
            </Button>
          </div>
        </div>

        <div className="w-1/4 bg-white border-l p-4 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Question Palette</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-300 mr-2"></div>
                <span className="text-sm">Not Visited</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 mr-2"></div>
                <span className="text-sm">Not Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 mr-2"></div>
                <span className="text-sm">Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 mr-2"></div>
                <span className="text-sm">Marked for Review</span>
              </div>
              <div className="flex items-center col-span-2">
                <div className="w-4 h-4 bg-purple-300 mr-2"></div>
                <span className="text-sm">Answered & Marked for Review (will be considered for evaluation)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {test.questionIds.map((qId, index) => {
              const status = getQuestionStatus(qId, session.answers)
              let bgColor = "bg-gray-300"

              if (status === "not-answered") bgColor = "bg-red-500"
              if (status === "answered") bgColor = "bg-green-500"
              if (status === "marked-for-review") bgColor = "bg-purple-500"
              if (status === "answered-and-marked") bgColor = "bg-purple-300"

              return (
                <button
                  key={qId}
                  className={`${bgColor} text-white w-10 h-10 rounded-md flex items-center justify-center font-medium hover:opacity-80 ${
                    currentQuestion.id === qId ? "ring-2 ring-blue-500 ring-offset-2" : ""
                  }`}
                  onClick={() => navigateToQuestion(qId)}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

