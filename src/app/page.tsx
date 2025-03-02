"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { tests, questions } from "@/data/mockData"

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"student" | "teacher">("student")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    localStorage.setItem("currentUser", JSON.stringify({
      id: role === "student" ? "student1" : "teacher1",
      name: role === "student" ? "Student" : "Teacher",
      role: role,
      email: email
    }))

    localStorage.setItem("tests", JSON.stringify(tests))
    localStorage.setItem("questions", JSON.stringify(questions))
    
    router.push(role === "student" ? "/student/dashboard" : "/teacher/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-black">Sstudize</h1>
          <p className="mt-2 text-sm text-black">Online Test Simulation Platform for Engineering Exam Aspirants</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                  role === "student"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-black hover:bg-gray-200"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                  role === "teacher"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-black hover:bg-gray-200"
                }`}
              >
                Teacher
              </button>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-black">Demo Account</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 text-center">
              <ul className="mt-2 text-sm text-black">
                <li>john@example.com</li>
                <li>smith@example.com</li>
              </ul>
          </div>
        </div>
      </div>
    </div>
  )
}


