import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useGeminiAI } from '@/lib/gemini';
import { useUpdateTask } from '../api/use-update-task';
import { Task, TaskStatus } from '../types';
import { toast } from 'sonner';

interface TaskAIEditorProps {
  task: Task;
}

// Định nghĩa kiểu cho updates để phù hợp với API
interface TaskUpdate {
  name?: string;
  status?: TaskStatus;
  workspaceId?: string;
  assigneeId?: string;
  projectId?: string;
  dueDate?: Date;
  description?: string;
}

export const TaskAIEditor: React.FC<TaskAIEditorProps> = ({ task }) => {
  const [request, setRequest] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const { sendMessageToGemini } = useGeminiAI();
  const { mutate: updateTask } = useUpdateTask();

  const handleAIRequest = async () => {
    if (!request.trim()) return;
    
    setIsProcessing(true);
    setAiResponse(null);
    
    const context = `
      Task hiện tại:
      - ID: ${task.$id}
      - Tên: ${task.name}
      - Trạng thái: ${task.status}
      - Mô tả: ${task.description || 'Không có mô tả'}
      
      Các trạng thái có thể: ${Object.values(TaskStatus).join(', ')}
      
      Yêu cầu: ${request}
      
      Vui lòng trả về phản hồi theo định dạng sau:
      STATUS: [trạng thái mới nếu cần thay đổi]
      DESCRIPTION: [mô tả mới nếu cần thay đổi]
    `;

    try {
      const result = await sendMessageToGemini(request, context);

      if (result.success && result.data) {
        const aiResponse = result.data;
        setAiResponse(aiResponse);
        
        // Phân tích phản hồi từ AI
        // Sử dụng g flag thay vì s flag cho ES2018 trở xuống
        const statusMatch = aiResponse.match(/STATUS:?\s*(BACKLOG|TODO|IN_PROGRESS|IN_REVIEW|DONE)/i);
        const descriptionMatch = aiResponse.match(/DESCRIPTION:?\s*(.+?)(?=STATUS:|$)/i);

        const updates: TaskUpdate = {};

        if (statusMatch) {
          updates.status = statusMatch[1].toUpperCase() as TaskStatus;
        }

        if (descriptionMatch) {
          updates.description = descriptionMatch[1].trim();
        }

        // Cập nhật task nếu có thay đổi
        if (Object.keys(updates).length > 0) {
          updateTask(
            {
              json: updates,
              param: { taskId: task.$id }
            },
            {
              onSuccess: () => {
                toast.success('Task đã được cập nhật thành công!');
                setRequest('');
              },
              onError: () => {
                toast.error('Không thể cập nhật task!');
              }
            }
          );
        } else {
          toast.info('Không có thay đổi nào được đề xuất.');
        }
      } else {
        toast.error('Không nhận được phản hồi hợp lệ từ AI.');
      }
    } catch (error) {
      console.error('Lỗi khi xử lý yêu cầu AI:', error);
      toast.error('Đã xảy ra lỗi khi xử lý yêu cầu.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">AI Task Assistant</h3>
      <Textarea
        placeholder="Nhập yêu cầu của bạn (ví dụ: 'Cập nhật trạng thái task này thành Done và thêm mô tả về việc hoàn thành')"
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        rows={4}
        className="w-full"
        disabled={isProcessing}
      />
      
      <Button 
        onClick={handleAIRequest}
        disabled={isProcessing || !request.trim()}
        className="w-full"
      >
        {isProcessing ? 'Đang xử lý...' : 'Gửi yêu cầu tới AI'}
      </Button>

      {aiResponse && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium mb-2">Phản hồi từ AI:</p>
          <p className="whitespace-pre-wrap">{aiResponse}</p>
        </div>
      )}
    </div>
  );
};