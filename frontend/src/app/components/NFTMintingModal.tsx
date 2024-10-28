import React from 'react';
import { 
  AlertDialog, 
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription
} from "@/components/ui/alert-dialog";
import { Check, Loader2, Image as ImageIcon, Database, Share2, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EducationalTip = ({ tip }: { tip: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-100"
  >
    <div className="flex items-start gap-3">
      <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
      <div>
        <h4 className="text-sm font-medium text-blue-700">豆知識</h4>
        <p className="text-sm text-blue-600 mt-1">{tip}</p>
      </div>
    </div>
  </motion.div>
);

const NFTMintingModal = ({ isOpen, stage, locationName }: { isOpen: boolean; stage: string; locationName: string }) => {
  const stages = [
    {
      id: 'preparing',
      title: 'NFT画像の生成',
      description: `${locationName}でのクイズクリアを記念したNFT画像を生成しています`,
      icon: ImageIcon,
      educationalTip: 'NFTは「Non-Fungible Token（非代替性トークン）」の略で、デジタルデータの唯一性を証明する技術です。あなたの観光記念は、この技術によって唯一無二の記録として残ります。'
    },
    {
      id: 'metadata',
      title: 'NFTデータの作成',
      description: 'あなたの観光体験をNFTのメタデータとして保存しています',
      icon: Database,
      educationalTip: 'データには、あなたのウォレットアドレス、観光地の情報、訪問日時など、あなたの観光体験に関する重要な情報が含まれています。これらは改ざんができない形で永続的に保存されます。'
    },
    {
      id: 'minting',
      title: 'ブロックチェーンへの記録',
      description: 'あなたの観光体験をブロックチェーン上に永続的に記録しています',
      icon: Share2,
      educationalTip: 'ブロックチェーンは、データを分散して保存する技術です。一度記録された情報は改ざんが困難で、あなたの観光記念は永続的に証明可能な形で残ります。'
    }
  ];

  const currentStageIndex = stages.findIndex(s => s.id === stage);
  const currentStage = stages.find(s => s.id === stage);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-center font-bold">
            デジタル観光記念証の作成
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {stage === 'complete' 
              ? '🎉 観光記念NFTの作成が完了しました！' 
              : 'あなたの観光体験をNFTとして記録しています'}
          </AlertDialogDescription>
        </AlertDialogHeader>


        <div className="space-y-6">
          {stages.map((s, index) => {
            const isComplete = currentStageIndex > index;
            const isCurrent = currentStageIndex === index;
            
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-green-100' : 
                      isCurrent ? 'bg-blue-100' : 
                      'bg-gray-100'
                    }`}>
                      {isComplete ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      ) : (
                        <s.icon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    {index < stages.length - 1 && (
                      <div className={`absolute left-5 top-10 w-0.5 h-8 ${
                        isComplete ? 'bg-green-200' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      isComplete ? 'text-green-600' :
                      isCurrent ? 'text-blue-600' :
                      'text-gray-400'
                    }`}>
                      {s.title}
                    </h3>
                    <p className={`text-sm ${
                      isCurrent ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {s.description}
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {isCurrent && (
                    <EducationalTip tip={s.educationalTip} />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {stage === 'complete' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 text-center"
            >
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-green-600">発行完了！</h3>
              <p className="text-sm text-gray-600 mt-2">
                プロフィールページから新しいNFTを確認できます
              </p>
              <EducationalTip tip="作成されたNFTは、あなたのデジタルウォレットに保存され、いつでも確認できます。これはあなたの観光体験の証明として、永続的に残ります。" />
            </motion.div>
          )}

          {stage === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 text-center p-4 bg-red-50 rounded-lg"
            >
              <h3 className="text-lg font-medium text-red-600">エラーが発生しました</h3>
              <p className="text-sm text-red-500 mt-2">
                NFTの発行に失敗しました。もう一度お試しください。
              </p>
            </motion.div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NFTMintingModal;