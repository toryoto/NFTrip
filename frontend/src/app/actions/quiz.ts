'use server'

import { supabase } from "@/lib/supabase";

// Supabaseから観光地のクイズを3つ取得するメソッド
export async function getLocationQuizzes(locationId: number) {
	console.log('locationId: ', locationId)
	// Quizzesテーブルから問題を3問、Quizzes_Optionsからその問題の選択肢を取得する
	const { data: quizzes, error } = await supabase
		.from('quizzes')
		.select(`
			id,
			question_text,
			quizzes_options(
				id,
				option_text
			)
		`)
		.eq('location_id', locationId);

	if (error) throw error;

	return quizzes
}