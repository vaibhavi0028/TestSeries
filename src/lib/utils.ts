import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ].join(":")
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function getQuestionStatus(
  questionId: number,
  answers: Record<number, { selectedOption: number | null; markedForReview: boolean; visited: boolean }>,
): "not-visited" | "not-answered" | "answered" | "marked-for-review" | "answered-and-marked" {
  const answer = answers[questionId]

  if (!answer || !answer.visited) {
    return "not-visited"
  }

  if (answer.markedForReview) {
    return answer.selectedOption !== null ? "answered-and-marked" : "marked-for-review"
  }

  return answer.selectedOption !== null ? "answered" : "not-answered"
}

