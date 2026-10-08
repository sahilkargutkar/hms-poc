'use client';

import React, { useState, useCallback } from 'react';
import { ClinicWebsite } from '@/components/clinic/ClinicWebsite';
import { FloatingChatWidget, WidgetState } from '@/components/chat/FloatingChatWidget';
import { useChat } from '@/hooks/useChat';
import { Doctor, MedicalService } from '@/types/api';

export default function Home() {
  const [widgetState, setWidgetState] = useState<WidgetState>('closed');
  const chatHook = useChat();

  const handleOpenBot = useCallback(
    (prompt?: string, actionDoctor?: Doctor, actionService?: MedicalService) => {
      // Open the bot widget in standard view if closed or minimized
      setWidgetState('normal');

      // If a specific prompt is requested
      if (prompt) {
        setTimeout(() => {
          chatHook.sendMessage(prompt);
        }, 150);
      } else if (actionDoctor) {
        setTimeout(() => {
          chatHook.selectDoctor(actionDoctor);
        }, 150);
      } else if (actionService) {
        setTimeout(() => {
          chatHook.selectService(actionService);
        }, 150);
      }
    },
    [chatHook]
  );

  return (
    <main className="relative min-h-screen">
      {/* Clinic Website Content */}
      <ClinicWebsite
        onOpenBot={handleOpenBot}
        widgetState={widgetState}
      />

      {/* Floating Minimizable & Maximizable AI Receptionist Bot */}
      <FloatingChatWidget
        chatHook={chatHook}
        widgetState={widgetState}
        setWidgetState={setWidgetState}
      />
    </main>
  );
}
