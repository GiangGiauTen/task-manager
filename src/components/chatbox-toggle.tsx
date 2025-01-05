import React, { useState } from 'react';
import Chatbox from './chatbox';
import { FiMessageSquare, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
const ChatboxToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { role: 'user' | 'ai'; text: string }[]
  >([]);
  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };
  const updateChatHistory = (newMessage: {
    role: 'user' | 'ai';
    text: string;
  }) => {
    setChatHistory(prev => [...prev, newMessage]);
  };
  return (
    <div>
      <Button
        onClick={toggleChatbox}
        className={`fixed bottom-5 right-5 z-50 w-16 h-16 p-0 rounded-full shadow-md transition-all ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}>
        {isOpen ? (
          <FiX size={28} className="text-white" /> // Icon đóng
        ) : (
          <FiMessageSquare size={28} className="text-white" /> // Icon mở
        )}
      </Button>

      {isOpen && (
        <div className="fixed bottom-24 right-5 w-80 h-96 bg-white shadow-lg rounded-xl z-50 overflow-hidden animate-slide-up">
          <Chatbox
            chatHistory={chatHistory}
            updateChatHistory={updateChatHistory}
          />
        </div>
      )}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatboxToggle;
