'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useGeminiAI } from '@/lib/gemini';

interface GeminiAIInteractionProps {
  context?: string; // Context tùy chọn từ task hoặc các nguồn khác
}

export const GeminiAIInteraction: React.FC<GeminiAIInteractionProps> = ({
  context,
}) => {
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isChatting, setIsChatting] = useState(false);

  const { sendMessageToGemini } = useGeminiAI();

  const handleSubmitToGemini = async () => {
    setIsChatting(true);

    try {
      const result = await sendMessageToGemini(aiQuestion, context);

      if (result.success) {
        setAiResponse(result.data || 'No response received.');
      } else {
        setAiResponse(result.error || 'Error occurred.');
      }
    } catch (error) {
      console.error('Error communicating with Gemini AI:', error);
      setAiResponse('An unexpected error occurred.');
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <Textarea
        placeholder="Ask a question to Gemini..."
        value={aiQuestion}
        rows={4}
        onChange={e => setAiQuestion(e.target.value)}
        disabled={isChatting}
      />

      <Button
        size="sm"
        className="w-fit ml-auto"
        onClick={handleSubmitToGemini}
        disabled={isChatting || !aiQuestion}>
        {isChatting ? 'Chatting...' : 'Submit to Gemini'}
      </Button>

      {aiResponse && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p className="font-semibold">Phản hồi từ AI:</p>
          <div 
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: aiResponse }}
          />
        </div>
      )}
    </div>
  );
};
