'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { getChatResponse } from '../actions/chat'
import { ChatMessage } from '../types/chat'
import { LocationWithThumbnail } from '../types/location'

export default function ChatbotModal({
  location
}: {
  location: LocationWithThumbnail
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const { user } = useAuth()
  const { userProfile } = useUserProfile(user?.id)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    `${location.name}の歴史について教えてください。`,
    `${location.name}のおすすめの観光スポットは？`,
    `${location.name}で開かれるイベントはありますか？`
  ])

  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      {
        role: 'assistant',
        content: `こんにちは！${location.name}に関する情報を何でもわかりやすくお答えします！下のおすすめの質問をクリックするか、自由に質問を入力してください。`
      }
    ]

    setMessages(initialMessages)
  }, [location.name])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    await sendMessage(input)
  }

  const handleSuggestedQuestion = async (question: string) => {
    await sendMessage(question)
    setSuggestedQuestions((prev) => prev.filter((q) => q !== question))
  }

  const sendMessage = async (message: string) => {
    const userMessage: ChatMessage = { role: 'user', content: message }
    setMessages((prev) => [...prev, userMessage])
    setInput('')

    try {
      const aiResponse = await getChatResponse(
        [...messages, userMessage],
        location
      )
      if (aiResponse) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: aiResponse }
        ])
      } else {
        throw Error
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'すみません、エラーが発生しました。もう一度お試しください。'
        }
      ])
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        AIに聞く
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] bg-gray-800 text-white">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>AIチャットアシスタント</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-[70vh]">
            <ScrollArea className="flex-grow border-t border-gray-700 pr-4">
              <div className="pt-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div
                      className={`flex items-end ${message.role === 'user' ? 'flex-row-reverse' : ''} max-w-full`}
                    >
                      {message.role === 'user' ? (
                        <Link
                          href={`/profile/${user?.id}`}
                          className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden ml-2 flex-shrink-0"
                        >
                          <Image
                            src={
                              userProfile?.avatar_url ||
                              '/images/no-user-icon.png'
                            }
                            alt="User Avatar"
                            style={{ objectFit: 'cover' }}
                            className="transition-opacity duration-300 group-hover:opacity-50"
                            fill
                            sizes="(max-width: 640px) 32px, 40px"
                          />
                        </Link>
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500 mr-2 flex-shrink-0">
                          🤖
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-lg text-sm sm:text-base ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'} mx-1`}
                      >
                        <div
                          dangerouslySetInnerHTML={{ __html: message.content }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
            {suggestedQuestions.length > 0 && (
              <div className="mt-4 mb-2">
                <p className="text-sm text-gray-400 mb-2">おすすめの質問:</p>
                <ScrollArea className="h-20">
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="bg-gray-700 hover:bg-gray-600 text-white text-xs sm:text-sm"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            <form onSubmit={handleSend} className="mt-2 flex items-center">
              <Input
                type="text"
                placeholder="メッセージを入力..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow mr-2 bg-gray-700 text-white text-base sm:text-base"
              />
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
              >
                送信
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
