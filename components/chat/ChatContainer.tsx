'use client';

import React from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { StateInspector } from './StateInspector';

interface ChatContainerProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isMaximized?: boolean;
  isWidget?: boolean;
  chatHook?: ReturnType<typeof useChat>;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  onMinimize,
  onMaximize,
  onClose,
  isMaximized = false,
  isWidget = false,
  chatHook
}) => {
  // Use passed chat hook or instantiate one locally
  const internalHook = useChat();
  const chat = chatHook || internalHook;

  const {
    messages,
    conversationState,
    isLoading,
    sendMessage,
    selectDoctor,
    selectService,
    selectSlot,
    confirmBooking,
    requestCancel,
    confirmCancel,
    handleQuickReply,
    resetChat
  } = chat;

  return (
    <div className={`flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-teal-100 selection:text-teal-900 ${
      isWidget ? 'h-full w-full' : 'h-screen w-full'
    }`}>
      {/* Header */}
      <ChatHeader
        onReset={resetChat}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
        isMaximized={isMaximized}
        isWidget={isWidget}
      />

      {/* Main Message Flow */}
      <main className="flex flex-1 flex-col overflow-hidden relative">
        <MessageList
          messages={messages}
          conversationState={conversationState}
          isLoading={isLoading}
          onSelectDoctor={selectDoctor}
          onSelectService={selectService}
          onSelectSlot={selectSlot}
          onConfirmBooking={confirmBooking}
          onRequestCancel={requestCancel}
          onConfirmCancel={confirmCancel}
          onQuickReply={handleQuickReply}
        />
      </main>

      {/* State Inspector / Debug Pill for POC Transparency */}
      <StateInspector state={conversationState} />

      {/* Input */}
      <ChatInput
        onSendMessage={(text) => sendMessage(text)}
        isLoading={isLoading}
      />
    </div>
  );
};
