export type Quiz = {
  id: number
  question_text: string
  options: QuizOption[]
  explanation: QuizExplanation
}

export type QuizOption = {
  id: number
  option_text: string
  is_correct: boolean
}

export type QuizExplanation = {
  explanation_text: string
  additional_resources: string
}