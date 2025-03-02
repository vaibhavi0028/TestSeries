"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import TestCreator from "@/components/teacher/TestCreator"
import type { TestConfig } from "@/types"

export default function TeacherDashboard() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<"tests" | "create">("tests")
  const [tests, setTests] = useState<TestConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/")
      return
    }

    const parsedUser = JSON.parse(storedUser)
    if (parsedUser.role !== "teacher") {
      router.push("/")
      return
    }

    const storedTests = localStorage.getItem("tests")
    if (storedTests) {
      setTests(JSON.parse(storedTests))
    }

    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    router.push('/')
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading dashboard...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sstudize</h1>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-white border-white hover:bg-blue-800"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-black">Teacher Dashboard</h2>
          <div className="flex gap-4">
            <Button
              onClick={() => setActiveView("create")}
              className={`flex items-center gap-2 ${
                activeView === "create"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100 border-2 border-dashed border-blue-200"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Test
            </Button>
          </div>
        </div>

        {activeView === "tests" ? (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors cursor-pointer" onClick={() => setActiveView("create")}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">Create New Test</h3>
                  <p className="text-gray-600">Create a new test with custom questions and assign it to students</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-green-200 hover:border-green-400 transition-colors">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">Test Analytics Overview</h3>
                  <p className="text-gray-600 mb-4">View performance analytics across all your tests</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-green-50 p-2 rounded">
                      <div className="font-semibold text-green-700">Total Tests</div>
                      <div className="text-2xl font-bold text-green-800">{tests.length}</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="font-semibold text-blue-700">Active Tests</div>
                      <div className="text-2xl font-bold text-blue-800">
                        {tests.filter(t => new Date(t.scheduledFor) > new Date()).length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {tests.length > 0 ? (
                tests.map((test) => (
                  <div key={test.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-black mb-2">{test.title}</h3>
                        <p className="text-gray-600 mb-4">{test.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-black">Scheduled for: </span>
                            <span className="text-black">{new Date(test.scheduledFor).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="font-medium text-black">Duration: </span>
                            <span className="text-black">{test.duration / 60} minutes</span>
                          </div>
                          <div>
                            <span className="font-medium text-black">Questions: </span>
                            <span className="text-black">{test.questionIds.length}</span>
                          </div>
                          <div>
                            <span className="font-medium text-black">Students: </span>
                            <span className="text-black">{test.assignedTo.length}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push(`/teacher/analytics/${test.id}`)}
                        className="bg-gray-800 hover:bg-gray-900 text-white"
                      >
                        View Analytics
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Tests Created Yet</h3>
                </div>
              )}
            </div>
          </>
        ) : (
          <TestCreator />
        )}
      </main>
    </div>
  )
} 