'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"

// Types based on the ER diagram
type Quiz = {
  id: number
  question_text: string
  options: QuizOption[]
  explanation: QuizExplanation
}

type QuizOption = {
  id: number
  option_text: string
  is_correct: boolean
}

type QuizExplanation = {
  explanation_text: string
  additional_resources: string
}

// Dummy data for 3 quizzes
const dummyQuizzes: Quiz[] = [
  {
    id: 1,
    question_text: "日本の首都は？",
    options: [
      { id: 1, option_text: "東京", is_correct: true },
      { id: 2, option_text: "京都", is_correct: false },
      { id: 3, option_text: "大阪", is_correct: false },
      { id: 4, option_text: "横浜", is_correct: false },
    ],
    explanation: {
      explanation_text: "東京は日本の首都であり、最大の都市です。",
      additional_resources: "https://ja.wikipedia.org/wiki/東京都"
    }
  },
  {
    id: 2,
    question_text: "次のうち、日本の自動車メーカーではないのは？",
    options: [
      { id: 5, option_text: "トヨタ", is_correct: false },
      { id: 6, option_text: "ホンダ", is_correct: false },
      { id: 7, option_text: "ヒュンダイ", is_correct: true },
      { id: 8, option_text: "日産", is_correct: false },
    ],
    explanation: {
      explanation_text: "ヒュンダイは韓国の自動車メーカーで、日本のメーカーではありません。",
      additional_resources: "https://ja.wikipedia.org/wiki/現代自動車"
    }
  },
  {
    id: 3,
    question_text: "日本で最も高い山は？",
    options: [
      { id: 9, option_text: "富士山", is_correct: true },
      { id: 10, option_text: "阿蘇山", is_correct: false },
      { id: 11, option_text: "白山", is_correct: false },
      { id: 12, option_text: "立山", is_correct: false },
    ],
    explanation: {
      explanation_text: "富士山は日本最高峰で、標高は3,776.24メートルです。",
      additional_resources: "https://ja.wikipedia.org/wiki/富士山"
    }
  }
]

export default function QuizModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [quizzes] = useState<Quiz[]>(dummyQuizzes)
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      resetQuiz()
    }
  }, [isOpen])

  const handleAnswerChange = (quizId: number, optionId: number) => {
    setUserAnswers(prev => ({ ...prev, [quizId]: optionId }))
  }

  const handleSubmit = () => {
    if (currentQuestionIndex < quizzes.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      let newScore = 0
      quizzes.forEach(quiz => {
        const selectedOptionId = userAnswers[quiz.id]
        const selectedOption = quiz.options.find(option => option.id === selectedOptionId)
        if (selectedOption && selectedOption.is_correct) {
          newScore++
        }
      })
      setScore(newScore)
      setShowResults(true)
    }
  }

  const resetQuiz = () => {
    setUserAnswers({})
    setShowResults(false)
    setScore(0)
    setCurrentQuestionIndex(0)
  }

  const currentQuiz = quizzes[currentQuestionIndex]

  return (
    <div>
      <Button 
				onClick={(event) => {
					event.preventDefault()
					setIsOpen(true)
				}}
				className="bg-blue-600 hover:bg-blue-700 text-white" >
        クイズに挑戦
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">日本に関するクイズ</DialogTitle>
          </DialogHeader>
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm">
              問題 {currentQuestionIndex + 1} / {quizzes.length}
            </div>
            <div className="w-2/3 bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentQuestionIndex + 1) / quizzes.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <ScrollArea className="h-[60vh] pr-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {!showResults ? (
                  <div className="mb-8 p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">{currentQuiz.question_text}</h3>
                    <div className="space-y-2">
                      {currentQuiz.options.map(option => (
                        <div key={option.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-600 transition-colors">
                          <input
                            type="radio"
                            id={`option-${currentQuiz.id}-${option.id}`}
                            name={`quiz-${currentQuiz.id}`}
                            value={option.id}
                            checked={userAnswers[currentQuiz.id] === option.id}
                            onChange={() => handleAnswerChange(currentQuiz.id, option.id)}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                          />
                          <label htmlFor={`option-${currentQuiz.id}-${option.id}`} className="flex-grow cursor-pointer">
                            {option.option_text}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    {quizzes.map((quiz, index) => (
                      <div key={quiz.id} className="mb-8 p-4 bg-gray-700 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">問題 {index + 1}: {quiz.question_text}</h3>
                        <div className="space-y-2">
                          {quiz.options.map(option => (
                            <div
                              key={option.id}
                              className={`p-2 rounded-md ${
                                option.is_correct
                                  ? 'bg-green-600'
                                  : userAnswers[quiz.id] === option.id
                                  ? 'bg-red-600'
                                  : 'bg-gray-600'
                              }`}
                            >
                              {option.option_text}
                              {option.is_correct && ' ✅'}
                              {!option.is_correct && userAnswers[quiz.id] === option.id && ' ❌'}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 p-3 bg-gray-600 rounded-md">
                          <p className="text-sm">{quiz.explanation.explanation_text}</p>
                          <a href={quiz.explanation.additional_resources} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm mt-2 inline-block">
                            詳しく学ぶ
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </ScrollArea>
          <div className="mt-4">
            {!showResults ? (
              <Button
                onClick={handleSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-2"
                disabled={!userAnswers[currentQuiz.id]}
              >
                {currentQuestionIndex < quizzes.length - 1 ? '次の問題' : '結果を見る'}
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-2xl font-bold mb-4">あなたのスコア: {score} / {quizzes.length}</p>
                <Button onClick={() => setIsOpen(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-2">
                  閉じる
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}