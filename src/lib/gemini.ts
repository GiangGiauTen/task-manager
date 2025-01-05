// lib/gemini.ts
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import DOMPurify from 'dompurify';
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
const MODEL_NAME = 'gemini-2.0-flash-exp';

export interface GeminiResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export const useGeminiAI = () => {
  const initializeChat = async () => {
    const genAI = new GoogleGenerativeAI(API_KEY);
    return await genAI.getGenerativeModel({ model: MODEL_NAME });
  };

  const sendMessageToGemini = async (
    question: string,
    context?: string,
  ): Promise<GeminiResponse> => {
    try {
      const model = await initializeChat();

      const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
          {
            role: 'user',
            parts: [
              {
                text: context
                  ? `${context} Please answer the following question: ${question}`
                  : question,
              },
            ],
          },
        ],
      });

      const result = await chat.sendMessage(question);
      const responseText = result.response.text();

      const formattedResponse = formatGeminiResponse(responseText);
      const cleanResponse = DOMPurify.sanitize(formattedResponse);
      return {
        success: true,
        data: cleanResponse,
      };
    } catch (error) {
      console.error('Error while chatting with Gemini AI:', error);
      return {
        success: false,
        error: 'Failed to communicate with Gemini AI.',
      };
    }
  };
  const formatGeminiResponse = (responseText: string): string => {
    let formattedText = responseText.replace(/\**/g, '');
    
    formattedText = formattedText.replace(/([.!?])\s+(?=[A-Z])/g, '$1<br><br>');
    
    const keywords = ['Mục tiêu:', 'Tóm lại:', 'Gợi ý:', 'Ví dụ:', 'Lưu ý:', 'Kết luận:'];
    keywords.forEach(keyword => {
      formattedText = formattedText.replace(
        new RegExp(`(${keyword})`, 'g'),
        '<br><br><strong>$1</strong>'
      );
    });
    
    return formattedText;
  };
  return { sendMessageToGemini };
};
