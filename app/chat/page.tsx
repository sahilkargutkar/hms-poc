import { Metadata } from 'next';
import { ChatContainer } from '@/components/chat/ChatContainer';

export const metadata: Metadata = {
  title: 'CarePoint AI Receptionist | Medical Clinic Appointment System',
  description: 'Book, manage, and reschedule medical appointments with CarePoint Clinic AI Receptionist.'
};

export default function ChatPage() {
  return <ChatContainer />;
}
