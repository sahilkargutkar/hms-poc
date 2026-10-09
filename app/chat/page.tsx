import { Metadata } from 'next';
import { ChatContainer } from '@/components/chat/ChatContainer';

export const metadata: Metadata = {
  title: 'CarePoint Front Desk | Medical Clinic Appointment Scheduling',
  description: 'Book, manage, and reschedule medical appointments with CarePoint Clinic Reception Desk.'
};

export default function ChatPage() {
  return <ChatContainer />;
}
