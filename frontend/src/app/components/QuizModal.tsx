'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, Award, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Quiz, QuizAnswers } from '../types/quiz'
import { getLocationQuizzes, getQuizAnswers } from '../actions/quiz'

export default function EnhancedQuizModal({ locationId, locationName }: { locationId: number, locationName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [answers, setAnswers] = useState<{ [key: number]: QuizAnswers }>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showNFTReward, setShowNFTReward] = useState(false)

  useEffect(() => {
    if (isOpen) {
      getQuizzes()
    } else {
      resetQuiz()
    }
  }, [isOpen])

  const getQuizzes = async () => {
    const quizzes = await getLocationQuizzes(locationId)
    setQuizzes(quizzes)
  }

  const handleAnswerChange = (quizId: number, optionId: number) => {
    setUserAnswers(prev => ({ ...prev, [quizId]: optionId }))
  }

  const handleSubmit = async () => {
    if (currentQuestionIndex < quizzes.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      const fetchedAnswers = await getQuizAnswers(userAnswers)
      setAnswers(fetchedAnswers)
      const newScore = Object.keys(fetchedAnswers).reduce((acc, quizId) => {
        return acc + (userAnswers[Number(quizId)] === fetchedAnswers[Number(quizId)].correct_option_id ? 1 : 0)
      }, 0)
      setScore(newScore)
      setShowResults(true)
      if (newScore === quizzes.length) {
        setShowNFTReward(true)
      }
    }
  }

  const resetQuiz = () => {
    setUserAnswers({})
    setShowResults(false)
    setAnswers({})
    setCurrentQuestionIndex(0)
    setScore(0)
    setShowNFTReward(false)
  }

  const currentQuiz = quizzes[currentQuestionIndex]

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transform transition duration-500 hover:scale-105">
        <Sparkles className="mr-2 h-5 w-5" />
        クイズに挑戦
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              {locationName}のクイズチャレンジ
            </DialogTitle>
          </DialogHeader>
          <div className="mb-6 space-y-2">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>問題 {currentQuestionIndex + 1} / {quizzes.length}</span>
              <span>{Math.round((currentQuestionIndex) / quizzes.length * 100)}% 完了</span>
            </div>
            <Progress value={(currentQuestionIndex) / quizzes.length * 100} className="h-2 bg-gray-700" />
          </div>
          <ScrollArea className="h-[60vh] pr-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {!showResults ? (
                  <div className="mb-8 p-6 bg-gray-800 rounded-xl shadow-inner">
                    <h3 className="text-xl font-semibold mb-4 text-blue-300">{currentQuiz?.question_text}</h3>
                    <div className="space-y-3">
                      {currentQuiz?.options.map((option) => (
                        <motion.div
                          key={option.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            userAnswers[currentQuiz.id] === option.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                          onClick={() => handleAnswerChange(currentQuiz.id, option.id)}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            userAnswers[currentQuiz.id] === option.id
                              ? 'border-white bg-white'
                              : 'border-gray-400'
                          }`} />
                          <span className="flex-grow">{option.option_text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {quizzes.map((quiz, index) => (
                      <div key={quiz.id} className="p-6 bg-gray-800 rounded-xl shadow-inner">
                        <h3 className="text-xl font-semibold mb-4 text-blue-300">問題 {index + 1}: {quiz.question_text}</h3>
                        <div className="space-y-3">
                          {quiz.options.map((option) => (
                            <div
                              key={option.id}
                              className={`p-3 rounded-lg flex items-center justify-between ${
                                answers[quiz.id].correct_option_id === option.id
                                  ? 'bg-green-600'
                                  : userAnswers[quiz.id] === option.id
                                  ? 'bg-red-600'
                                  : 'bg-gray-700'
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
                          <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                            <p className="text-sm font-semibold mb-2">
                              <span className={`font-bold ${userAnswers[quiz.id] === answers[quiz.id].correct_option_id ? 'text-green-400' : 'text-red-400'}`}>
                                {userAnswers[quiz.id] === answers[quiz.id].correct_option_id
                                  ? "正解です！"
                                  : "不正解です。"}
                              </span>
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
          <div className="mt-6">
            {!showResults ? (
              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 rounded-full text-lg shadow-lg transform transition duration-500 hover:scale-105"
                disabled={!userAnswers[currentQuiz?.id]}
              >
                {currentQuestionIndex < quizzes.length - 1 ? '次の問題' : '結果を見る'}
              </Button>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-2xl font-bold">
                  あなたのスコア: {score} / {quizzes.length}
                </div>
                {showNFTReward && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="p-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-xl"
                  >
                    <Award className="h-16 w-16 text-white mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">おめでとうございます！</h3>
                    <p className="text-white">全問正解でNFTを獲得しました！</p>
                  </motion.div>
                )}
                <Button onClick={() => setIsOpen(false)} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-full text-lg shadow-lg transform transition duration-500 hover:scale-105">
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