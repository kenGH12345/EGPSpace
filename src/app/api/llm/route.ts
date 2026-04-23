import { NextRequest, NextResponse } from 'next/server';
import { LLMClient } from 'coze-coding-dev-sdk';

const client = new LLMClient();

export async function POST(request: NextRequest) {
  try {
    const { messages, stream = false } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'messages 字段是必需的，且必须是数组' },
        { status: 400 }
      );
    }

    if (stream) {
      // 流式响应
      const encoder = new TextEncoder();
      const responseStream = new ReadableStream({
        async start(controller) {
          try {
            const response = await client.invoke(messages);
            
            if (Symbol.asyncIterator in Object(response)) {
              for await (const chunk of response as unknown as AsyncIterable<unknown>) {
                const content = (chunk as { content?: string })?.content;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              }
            } else {
              const content = (response as { content?: string })?.content;
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            }
          } catch (error) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(responseStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // 非流式响应
      const response = await client.invoke(messages);
      return NextResponse.json({ content: response.content });
    }
  } catch (error) {
    console.error('LLM API Error:', error);
    return NextResponse.json(
      { error: '生成失败，请重试' },
      { status: 500 }
    );
  }
}
