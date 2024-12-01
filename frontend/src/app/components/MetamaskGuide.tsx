import React, { useState } from 'react'
import { X } from 'lucide-react'

// Propsで親コンポーネントの表示管理Stateをfalseにするメソッドを受け取る
export const MetamaskGuide = ({ onClose }: { onClose: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = [
		{ title: 'Metamaskをインストールしてください', content: 'MetamaskをインストールしているブラウザのみがMetamask認証ができます。' },
    { title: 'Metamaskとは？', content: 'Metamaskは暗号通貨ウォレットであり、ブロックチェーンアプリへのゲートウェイです。' },
    { title: 'なぜ必要なのか？', content: '私たちのNFTプラットフォームと安全にやり取りするために必要です。' },
    { title: 'インストール方法', content: 'metamask.ioにアクセスし、お使いのブラウザ向けのインストールガイドに従ってください。' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold text-black">Metamaskガイド</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-black">{steps[currentStep].title}</h3>
          <p className='text-black'>{steps[currentStep].content}</p>
        </div>
        <div className="flex justify-between">
          <button 
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={currentStep === 0}
          >
            前へ
          </button>
          {currentStep < steps.length - 1 ? (
            <button 
              onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              次へ
            </button>
          ) : (
            <button 
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Metamaskをインストール
            </button>
          )}
        </div>
      </div>
    </div>
  )
}