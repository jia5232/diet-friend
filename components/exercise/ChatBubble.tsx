'use client';

import { ChatMessage } from '@/types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  // KST 기준 시간 표시
  const formatTimeKST = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul',
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      {!isUser && <span className="text-2xl mr-2">🐰</span>}
      <div
        className={`max-w-[80%] px-4 py-3 ${
          isUser
            ? 'bg-pink-500 text-white rounded-2xl rounded-br-sm'
            : 'bg-white text-gray-700 rounded-2xl rounded-bl-sm shadow-sm'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isUser ? 'text-pink-200' : 'text-gray-400'
          }`}
        >
          {formatTimeKST(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
