export type Quiz = {
  id: number
  question_text: string
  options: QuizOption[]
}

export type QuizOption = {
  id: number
  option_text: string
}

export type QuizAnswers = {
	correct_option_id: number
	explanation_text: string
  additional_resources: string
}