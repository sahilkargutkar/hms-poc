'use client';

import React from 'react';
import { QuickReply } from '@/types/chat';
import { ArrowRight } from 'lucide-react';

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
  disabled?: boolean;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({ replies, onSelect, disabled = false }) => {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {replies.map((reply) => (
        <button
          key={reply.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(reply)}
          className="group inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/60 px-3.5 py-1.5 text-xs font-medium text-teal-800 shadow-2xs hover:border-teal-400 hover:bg-teal-100/70 hover:text-teal-950 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span>{reply.label}</span>
          <ArrowRight className="h-3 w-3 text-teal-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </button>
      ))}
    </div>
  );
};
