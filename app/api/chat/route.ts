import { NextRequest, NextResponse } from 'next/server';
import { runAiReceptionist } from '@/lib/ai/agent';
import { ChatRequestPayload } from '@/types/chat';

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestPayload = await req.json();

    if (!body || (!body.userPrompt && !body.action)) {
      return NextResponse.json(
        { error: 'Missing user message or action payload in request.' },
        { status: 400 }
      );
    }

    const response = await runAiReceptionist(body);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('API /api/chat error:', error);
    return NextResponse.json(
      {
        message: {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          type: 'error',
          timestamp: new Date().toISOString(),
          content: 'Sorry, I encountered an unexpected error while processing your request. Please try again.'
        },
        updatedState: {}
      },
      { status: 500 }
    );
  }
}
