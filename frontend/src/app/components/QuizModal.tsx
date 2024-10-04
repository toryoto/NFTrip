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
import { CheckCircle2, XCircle } from 'lucide-react'
import { Quiz, QuizAnswers } from '../types/quiz'
import { getLocationQuizzes } from '../actions/quiz'

// Dummy function to simulate fetching answers
const fetchAnswers = async (userAnswers: { [key: number]: number }): Promise<{ [key: number]: QuizAnswers }> => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    1: {
      correct_option_id: 1,
      explanation_text: "東京は日本の首都であり、最大の都市です。",
      additional_resources: "https://ja.wikipedia.org/wiki/東京都"
    },
    2: {
      correct_option_id: 7,
      explanation_text: "ヒュンダイは韓国の自動車メーカーで、日本のメーカーではありません。",
      additional_resources: "https://ja.wikipedia.org/wiki/現代自動車"
    },
    3: {
      correct_option_id: 9,
      explanation_text: "富士山は日本最高峰で、標高は3,776.24メートルです。",
      additional_resources: "https://ja.wikipedia.org/wiki/富士山"
    }
  };
}

export default function QuizModal({ locationId }: { locationId: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [answers, setAnswers] = useState<{ [key: number]: QuizAnswers }>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  useEffect(() => {
    if (isOpen) {
			getQuizzes()
    } else {
      resetQuiz()
    }
  }, [isOpen])

	const getQuizzes= async () => {
		const quizzes = await getLocationQuizzes(locationId);
		console.log(quizzes)
		setQuizzes(quizzes);
	}

  const handleAnswerChange = (quizId: number, optionId: number) => {
    setUserAnswers(prev => ({ ...prev, [quizId]: optionId }))
  }

  const handleSubmit = async () => {
    if (currentQuestionIndex < quizzes.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      const fetchedAnswers = await fetchAnswers(userAnswers)
      setAnswers(fetchedAnswers)
      setShowResults(true)
    }
  }

  const resetQuiz = () => {
    setUserAnswers({})
    setShowResults(false)
    setAnswers({})
    setCurrentQuestionIndex(0)
  }

  const handleOpenModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(true)
  }

  const handleCloseModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)
  }

  const currentQuiz = quizzes[currentQuestionIndex]

  return (
    <div>
      <Button onClick={handleOpenModal} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                    <h3 className="text-lg font-semibold mb-4">{currentQuiz?.question_text}</h3>
                    <div className="space-y-2">
                      {currentQuiz?.options.map(option => (
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
                              className={`p-2 rounded-md flex items-center justify-between ${
                                answers[quiz.id].correct_option_id === option.id
                                  ? 'bg-green-600'
                                  : userAnswers[quiz.id] === option.id
                                  ? 'bg-red-600'
                                  : 'bg-gray-600'
                              }`}
                            >
                              <span>{option.option_text}</span>
                              {answers[quiz.id].correct_option_id === option.id && (
                                <CheckCircle2 className="h-5 w-5 text-white" />
                              )}
                              {userAnswers[quiz.id] === option.id && answers[quiz.id].correct_option_id !== option.id && (
                                <XCircle className="h-5 w-5 text-white" />
                              )}
                            </div>
                          ))}
                        </div>
                        {answers[quiz.id] && (
                          <div className="mt-4 p-3 bg-gray-600 rounded-md">
                            <p className="text-sm font-semibold mb-2">
                              {userAnswers[quiz.id] === answers[quiz.id].correct_option_id
                                ? "正解です！"
                                : "不正解です。"}
                            </p>
                            <p className="text-sm">{answers[quiz.id].explanation_text}</p>
                            <a href={answers[quiz.id].additional_resources} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm mt-2 inline-block">
                              詳しく学ぶ
                            </a>
                          </div>
                        )}
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
                disabled={!userAnswers[currentQuiz?.id]}
              >
                {currentQuestionIndex < quizzes.length - 1 ? '次の問題' : '結果を見る'}
              </Button>
            ) : (
              <div className="text-center">
                <Button onClick={handleCloseModal} className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-2">
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