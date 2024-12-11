import { useState } from 'react';
import { PencilIcon, XIcon } from 'lucide-react';

import { Task } from '../types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DottedSeparator } from '@/components/dotted-separator';

import { useUpdateTask } from '../api/use-update-task';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
const MODEL_NAME = 'gemini-exp-1114';

interface TaskDescriptionProps {
  task: Task;
}

export const TaskDescription = ({ task }: TaskDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(task.description);
  const [aiQuestion, setAiQuestion] = useState<string>(''); // Câu hỏi gửi đến Gemini
  const [aiResponse, setAiResponse] = useState<string | null>(null); // Kết quả từ Gemini
  const [isChatting, setIsChatting] = useState(false);
  const [isAsking, setIsAsking] = useState(false); // Trạng thái hiển thị Textarea hỏi Gemini

  const { mutate, isPending } = useUpdateTask();

  const handleSave = () => {
    mutate(
      {
        json: { description: value },
        param: { taskId: task.$id },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleSubmitToGemini = async () => {
    setIsChatting(true);
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = await genAI.getGenerativeModel({ model: MODEL_NAME });

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
            parts: [{ text: aiQuestion }],
          },
        ],
      });

      const result = await chat.sendMessage(aiQuestion);
      const response = result.response.text();

      setAiResponse(response);
    } catch (error) {
      console.error('Error while chatting with Gemini AI:', error);
      setAiResponse('Failed to generate a response from Gemini AI.');
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">Overview</p>
        <Button
          onClick={() => setIsEditing(prev => !prev)}
          size={'sm'}
          variant={'secondary'}>
          {isEditing ? (
            <XIcon className="size-4 mr-2" />
          ) : (
            <PencilIcon className="size-4 mr-2" />
          )}
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>
      <DottedSeparator classname="my-4" />
      {isEditing ? (
        <div className="flex flex-col gap-y-4">
          <Textarea
            placeholder="Add a description..."
            value={value}
            rows={4}
            onChange={e => setValue(e.target.value)}
            disabled={isPending}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="w-fit ml-auto"
              onClick={handleSave}
              disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsAsking(prev => !prev)} // Hiển thị Textarea để hỏi Gemini
              disabled={isChatting || isPending}>
              {isAsking ? 'Cancel' : 'Ask Gemini AI'}
            </Button>
          </div>
          {isAsking && (
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
            </div>
          )}
          {aiResponse && (
            <div className="mt-4 p-2 bg-gray-100 rounded">
              <p className="font-semibold">Gemini AI Response:</p>
              <p>{aiResponse}</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {task.description || (
            <span className="text-muted-foreground">No description set</span>
          )}
        </div>
      )}
    </div>
  );
};
