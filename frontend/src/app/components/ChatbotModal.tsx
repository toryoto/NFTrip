'use client'

import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { getChatResponse } from "../actions/chat"
import { ChatMessage } from "../types/chat"
import { LocationWithThumbnail } from "../types/location"

interface ChatbotModalProps {
  location: LocationWithThumbnail;
}

export default function ChatbotModal({ location }: ChatbotModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const { user } = useAuth();
  const { userProfile } = useUserProfile(user?.id);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      { role: 'assistant', content: `こんにちは！${location.name}に関する情報を何でもわかりやすくお答えします！` },
    ];
    
    setMessages(initialMessages);
  }, [])
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: ChatMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const aiResponse = await getChatResponse([...messages, userMessage], location);
      if (aiResponse) {
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      } else {
        throw Error;
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'すみません、エラーが発生しました。もう一度お試しください。' }])
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
        AIに聞く
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] bg-gray-800 text-white">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>AIチャットアシスタント</DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-4 border-t border-gray-700 h-[60vh] pr-4">
            <div className="pt-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div className={`flex items-end ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {message.role === 'user' ? (
                      <Link href={`/profile/${user?.wallet_address}`} className="relative w-10 h-10 rounded-full overflow-hidden ml-2">
                        <Image
                          src={userProfile?.avatar_url || "/images/no-user-icon.png"}
                          alt="User Avatar"
                          style={{ objectFit: 'cover' }}
                          className="transition-opacity duration-300 group-hover:opacity-50"
                          fill
                          sizes="40px"
                        />
                      </Link>
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 mr-2">
                        🤖
                      </div>
                    )}
                    <div className={`max-w-xs px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white text-right' : 'bg-gray-700 text-white'}`}>
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
          <form onSubmit={handleSend} className="mt-4 flex items-center">
            <Input
              type="text"
              placeholder="メッセージを入力..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow mr-2 bg-gray-700 text-white"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              送信
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}