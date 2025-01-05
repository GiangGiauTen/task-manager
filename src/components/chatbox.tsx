/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useGeminiAI } from '@/lib/gemini';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Textarea } from '../components/ui/textarea';

import { useGetTasks } from '@/features/tasks/api/use-get-tasks';
// import { DATABASE_ID, PROJECTS_ID, TASKS_ID, MEMBERS_ID } from '@/config';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useProjectId } from '@/features/projects/hooks/use-project-id';

interface ChatboxProps {
  chatHistory: { role: 'user' | 'ai'; text: string }[];
  updateChatHistory: (message: { role: 'user' | 'ai'; text: string }) => void;
}
const Chatbox: React.FC<ChatboxProps> = ({
  chatHistory,
  updateChatHistory,
}) => {
  const [question, setQuestion] = useState('');

  const [response, setResponse] = useState(''); // Phản hồi từ Gemini AI
  const [isSending, setIsSending] = useState(false);
  const projectId = useProjectId();
  const workspaceId = useWorkspaceId();
  const { sendMessageToGemini } = useGeminiAI();

  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
  });
  // Tạo context từ dữ liệu Appwrite
  const createTaskContext = (tasks: any[]) => {
    if (!tasks || tasks.length === 0) {
      return 'No tasks available.';
    }
    return tasks
      .map(
        task =>
          `Task: ${task.name}\nStatus: ${task.status}\nDue Date: ${
            task.dueDate || 'N/A'
          }\nAssignee: ${task.assignee?.name || 'Unassigned'}\n
          \nDecription: ${task.description || 'N/A'}\n`,
      )
      .join('\n');
  };

  // Gửi câu hỏi và nhận phản hồi
  const handleSend = async () => {
    if (question.trim() === '') return;

    const context = createTaskContext(tasks?.documents || []);

    updateChatHistory({ role: 'user', text: question });
    setIsSending(true);

    try {
      const result = await sendMessageToGemini(question, context);
      const aiResponse =
        result.success && result.data ? result.data : 'Failed to get response.';

      updateChatHistory({ role: 'ai', text: aiResponse });
      setResponse(aiResponse);
    } catch (error) {
      console.error('Error handling chat:', error);
      setResponse('An error occurred while processing your request.');
    } finally {
      setQuestion('');
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto p-4 border rounded-lg bg-white shadow-lg h-[90vh]">
      {/* Lịch sử chat */}
      <ScrollArea
        className="flex-grow p-4 border-b overflow-y-auto"
        style={{ maxHeight: '48%' }}>
        {chatHistory.length === 0 ? (
          <p className="text-gray-500 text-center">Start the conversation...</p>
        ) : (
          chatHistory.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}>
              <div
                className={`inline-block px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-black'
                }`}
                dangerouslySetInnerHTML={{ __html: message.text }}
              />
            </div>
          ))
        )}
      </ScrollArea>

      {/* Khu vực nhập liệu */}
      <div className="flex items-center gap-2 mt-2 h-[10%]">
        <Textarea
          placeholder="Type your question..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          rows={1}
          className="flex-1 resize-none"
          disabled={isSending || isLoadingTasks}
        />
        <Button
          onClick={handleSend}
          disabled={isSending || isLoadingTasks}
          className="px-4 py-2"
          variant={isSending ? 'secondary' : 'primary'}>
          {isSending ? 'Sending...' : isLoadingTasks ? 'Loading...' : 'Send'}
        </Button>
      </div>
    </div>
  );
};

export default Chatbox;
