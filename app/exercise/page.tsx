'use client';

import { useState, useRef, useEffect } from 'react';
import { useDiet } from '@/contexts/DietContext';
import ChatBubble from '@/components/exercise/ChatBubble';
import QuickButtons from '@/components/exercise/QuickButtons';
import ExerciseInput from '@/components/exercise/ExerciseInput';

export default function ExercisePage() {
  const { chatMessages, addChatMessage, clearChatMessages, isLoaded } = useDiet();
  const [isLoading, setIsLoading] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, choices]);

  const handleSendMessage = async (text: string) => {
    if (isLoading) return;

    setChoices([]);
    addChatMessage('user', text);
    setIsLoading(true);

    try {
      const recentMessages = chatMessages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...recentMessages, { role: 'user', content: text }],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        addChatMessage('assistant', data.message);
        if (data.choices && data.choices.length > 0) {
          setChoices(data.choices);
        }
      } else {
        addChatMessage('assistant', data.error || '지금은 대화가 어려워요');
        if (data.choices) {
          setChoices(data.choices);
        }
      }
    } catch {
      addChatMessage('assistant', '네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요!');
      setChoices(['다시 시도', '나중에 할게']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('대화 기록을 모두 지울까요?')) {
      clearChatMessages();
      setChoices([]);
    }
  };

  const showQuickButtons = chatMessages.length === 0;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="text-5xl">💪</span>
          <p className="text-pink-500 mt-4 font-medium">로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* 헤더 */}
      <div className="flex-shrink-0 p-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">운동 친구</h1>
            <p className="text-gray-400 text-xs">토끼 코치와 함께 운동해요</p>
          </div>
          <button
            onClick={handleClearChat}
            className="px-3 py-1.5 text-xs text-gray-400 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
          >
            대화 초기화
          </button>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-52 bg-gray-50">
        {chatMessages.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-6xl">🐰</span>
            <p className="text-gray-700 font-bold text-lg mt-4">안녕! 오늘 무슨 운동 할거야?</p>
            <p className="text-gray-400 text-sm mt-2">
              운동을 선택하면 끝까지 함께 응원해줄게!
            </p>
          </div>
        ) : (
          <>
            {chatMessages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐰</span>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 하단 입력 영역 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-md mx-auto space-y-3">
          {showQuickButtons && <QuickButtons onSelect={handleSendMessage} />}

          {!showQuickButtons && choices.length > 0 && !isLoading && (
            <div className="flex flex-wrap gap-2">
              {choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(choice)}
                  className="choice-btn px-4 py-2 rounded-full text-sm font-medium"
                >
                  {choice}
                </button>
              ))}
            </div>
          )}

          <ExerciseInput onSubmit={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
