export type Subject = "Physics" | "Chemistry" | "Mathematics"

export type QuestionType = {
  id: number
  subject: string
  text: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export type UserAnswer = {
  questionId: number
  selectedOption: number | null
  markedForReview: boolean
  timeSpent: number
  visited: boolean
}

export type TestSession = {
  id: string
  userId: string
  testId: string
  startTime: number
  remainingTime: number
  currentQuestionId: number
  answers: Record<number, UserAnswer>
  tabSwitchCount: number
  completed: boolean
}

export type TestConfig = {
  id: string
  title: string
  description: string
  duration: number
  totalMarks: number
  passingMarks: number
  subjects: string[]
  questionIds: number[]
  scheduledFor: number
  scheduledBy: string
  assignedTo: string[]
}

export type User = {
  id: string
  name: string
  email: string
  role: "student" | "teacher" | "admin"
}

export type TestResult = {
  testId: string
  userId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  unattempted: number
  markedForReview: number
  timeTaken: number
  submittedAt: number
  questionStats: {
    questionId: number
    timeSpent: number
    isCorrect: boolean
    attempted: boolean
  }[]
}

