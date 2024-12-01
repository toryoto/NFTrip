'use server'

import { supabase } from '@/lib/supabase'
import { Quiz, QuizAnswers } from '../types/quiz'

// Supabaseから観光地のクイズを3つ取得するメソッド
export async function getLocationQuizzes(locationId: number): Promise<Quiz[]> {
  // Quizzesテーブルから問題を3問、Quizzes_Optionsからその問題の選択肢を取得する
  const { data: quizzes, error } = await supabase
    .from('random_location_quizzes')
    .select('id, question_text, quizzes_options')
    .eq('location_id', locationId)
    .limit(3)

  if (error) throw error

  return quizzes.map((quiz) => ({
    id: quiz.id,
    question_text: quiz.question_text,
    options: (quiz.quizzes_options as any[]).map((option) => ({
      id: option.id,
      option_text: option.option_text
    }))
  }))
}

// ユーザの回答を受け取り、それぞれの問題のis_correct, explanation_textm, additional_resourcesをSupabaseから取得する
// userAnswers {quizId: selectedOption}
export async function getQuizAnswers(userAnswers: {
  [key: number]: number
}): Promise<{ [key: number]: QuizAnswers }> {
  const results = await Promise.all(
    Object.entries(userAnswers).map(async ([quizId]) => {
      // クイズごとにquizzes_optionsテーブルから正解の選択肢のidを取得
      const { data: optionData, error: optionError } = await supabase
        .from('quizzes_options')
        .select('id')
        .eq('quiz_id', quizId)
        .eq('is_correct', true)
        .single()

      if (optionError) throw optionError

      // quizzes_explanationsテーブルから全ての問題のqexplanation_textとadditional_resourcesを取得
      const { data: explanationData, error: explanationError } = await supabase
        .from('quizzes_explanations')
        .select('explanation_text, additional_resources')
        .eq('quiz_id', quizId)
        .single()

      if (explanationError) throw explanationError

      // クイズごとに正解のoption
      return {
        [quizId]: {
          correct_option_id: optionData.id,
          explanation_text: explanationData.explanation_text,
          additional_resources: explanationData.additional_resources
        }
      }
    })
  )

  // 複数のresults配列を1つのオブジェクトにまとめる
  return results.reduce((acc, result) => ({ ...acc, ...result }), {})
}
