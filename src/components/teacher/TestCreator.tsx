"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { Subject, TestConfig } from "@/types"
import { questions, users } from "@/data/mockData"
import { generateSessionId } from "@/lib/utils"

export default function TestCreator() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState(180) 
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([])
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [step, setStep] = useState(1)

  const students = users.filter((user) => user.role === "student")

  const toggleSubject = (subject: Subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subject))
    } else {
      setSelectedSubjects([...selectedSubjects, subject])
    }
  }

  const toggleQuestion = (questionId: number) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter((id) => id !== questionId))
    } else {
      setSelectedQuestions([...selectedQuestions, questionId])
    }
  }

  const toggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
    } else {
      setSelectedStudents([...selectedStudents, studentId])
    }
  }

  const selectAllQuestionsFromSubjects = () => {
    const questionsFromSubjects = questions.filter((q) => selectedSubjects.includes(q.subject)).map((q) => q.id)

    setSelectedQuestions(questionsFromSubjects)
  }

  const selectAllStudents = () => {
    setSelectedStudents(students.map((s) => s.id))
  }

  const createTest = () => {
    if (!title || selectedQuestions.length === 0 || !scheduledDate || !scheduledTime || selectedStudents.length === 0) {
      alert("Please fill in all required fields")
      return
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)

    const newTest: TestConfig = {
      id: generateSessionId(),
      title,
      description,
      duration: duration * 60, 
      subjects: selectedSubjects,
      questionIds: selectedQuestions,
      scheduledFor: scheduledDateTime.getTime(),
      scheduledBy: "teacher1", 
      assignedTo: selectedStudents,
      totalMarks: selectedQuestions.length * 4, 
      passingMarks: Math.ceil(selectedQuestions.length * 4 * 0.33), 
    }

    const storedTests = localStorage.getItem("tests")
    const tests = storedTests ? JSON.parse(storedTests) : []
    tests.push(newTest)
    localStorage.setItem("tests", JSON.stringify(tests))

    router.push("/teacher/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-blue-900 text-white p-6">
            <h1 className="text-2xl font-bold">Create New Test</h1>
            <p className="text-sm mt-2">Configure test settings, select questions, and assign to students</p>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    1
                  </div>
                  <span className="text-sm mt-1 text-black">Basic Info</span>
                </div>
                <div className="flex-1 h-1 mx-2 bg-gray-200">
                  <div
                    className={`h-full ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
                    style={{ width: step >= 2 ? "100%" : "0%" }}
                  ></div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    2
                  </div>
                  <span className="text-sm mt-1 text-black">Questions</span>
                </div>
                <div className="flex-1 h-1 mx-2 bg-gray-200">
                  <div
                    className={`h-full ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}
                    style={{ width: step >= 3 ? "100%" : "0%" }}
                  ></div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    3
                  </div>
                  <span className="text-sm mt-1 text-black">Assign</span>
                </div>
              </div>
            </div>

            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-black">Test Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Title*</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2 border rounded-md text-black"
                      placeholder="e.g., JEE-Main Mock Test 1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2 border rounded-md text-black"
                      placeholder="Provide a brief description of the test"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)*</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number.parseInt(e.target.value))}
                      className="w-full p-2 border rounded-md text-black"
                      min={1}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subjects*</label>
                    <div className="flex flex-wrap gap-2">
                      {(["Physics", "Chemistry", "Mathematics"] as Subject[]).map((subject) => (
                        <div
                          key={subject}
                          onClick={() => toggleSubject(subject)}
                          className={`px-4 py-2 rounded-md cursor-pointer text-black ${
                            selectedSubjects.includes(subject)
                              ? "bg-blue-100 border-blue-500 border"
                              : "bg-gray-100 border-gray-300 border"
                          }`}
                        >
                          {subject}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date*</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full p-2 border rounded-md text-black"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time*</label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full p-2 border rounded-md text-black"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => {
                      if (!title || selectedSubjects.length === 0 || !scheduledDate || !scheduledTime) {
                        alert("Please fill in all required fields")
                        return
                      }
                      setStep(2)
                    }}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Next: Select Questions
                  </Button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-black">Select Questions</h2>

                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-black">Selected: {selectedQuestions.length} questions</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={selectAllQuestionsFromSubjects}>
                    <span className="text-black">Select All from Subjects</span>
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-3 border-b flex items-center">
                    <div className="w-16 font-medium text-black">ID</div>
                    <div className="w-24 font-medium text-black">Subject</div>
                    <div className="flex-1 font-medium text-black">Question</div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {questions
                      .filter((q) => selectedSubjects.includes(q.subject))
                      .map((question) => (
                        <div
                          key={question.id}
                          className={`p-3 border-b flex items-center hover:bg-gray-50 cursor-pointer ${
                            selectedQuestions.includes(question.id) ? "bg-blue-50" : ""
                          }`}
                          onClick={() => toggleQuestion(question.id)}
                        >
                          <div className="w-16 text-black">{question.id}</div>
                          <div className="w-24 text-black">{question.subject}</div>
                          <div className="flex-1 truncate text-black">{question.text}</div>
                          <div className="w-6 h-6 rounded-md border flex items-center justify-center ml-2">
                            {selectedQuestions.includes(question.id) && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-blue-600"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} className="text-black hover:bg-gray-100">
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedQuestions.length === 0) {
                        alert("Please select at least one question")
                        return
                      }
                      setStep(3)
                    }}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Next: Assign to Students
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-black">Assign to Students</h2>

                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-black">Selected: {selectedStudents.length} students</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={selectAllStudents}>
                    <span className="text-black">Select All Students</span>
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-3 border-b flex items-center">
                    <div className="w-16 font-medium text-black">ID</div>
                    <div className="flex-1 font-medium text-black">Name</div>
                    <div className="w-48 font-medium text-black">Email</div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className={`p-3 border-b flex items-center hover:bg-gray-50 cursor-pointer ${
                          selectedStudents.includes(student.id) ? "bg-blue-50" : ""
                        }`}
                        onClick={() => toggleStudent(student.id)}
                      >
                        <div className="w-16 text-black">{student.id}</div>
                        <div className="flex-1 text-black">{student.name}</div>
                        <div className="w-48 truncate text-black">{student.email}</div>
                        <div className="w-6 h-6 rounded-md border flex items-center justify-center ml-2">
                          {selectedStudents.includes(student.id) && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-blue-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)} className="text-black hover:bg-gray-100">
                    Back
                  </Button>
                  <Button onClick={createTest} className="bg-blue-600 text-white hover:bg-blue-700">
                    Create Test
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

