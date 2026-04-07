import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient, EXERCISE_COACH_SYSTEM_PROMPT } from '@/lib/openai';

// 응답에서 선택지 파싱 (더 유연한 패턴)
function parseResponse(content: string): { message: string; choices: string[] } {
  // 패턴 1: [CHOICES]...[/CHOICES]
  let choicesMatch = content.match(/\[CHOICES\]([\s\S]*?)\[\/CHOICES\]/);

  // 패턴 2: [CHOICES] 이후 끝까지 (닫는 태그 없는 경우)
  if (!choicesMatch) {
    choicesMatch = content.match(/\[CHOICES\]\s*([\s\S]+?)$/);
  }

  if (choicesMatch) {
    const choicesText = choicesMatch[1].trim();
    // | 또는 줄바꿈으로 구분
    const choices = choicesText
      .split(/[|\n]/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0 && c.length < 50); // 빈 문자열과 너무 긴 것 제외

    const message = content
      .replace(/\[CHOICES\][\s\S]*?(\[\/CHOICES\])?$/, '')
      .trim();

    if (choices.length > 0) {
      return { message, choices: choices.slice(0, 4) }; // 최대 4개
    }
  }

  // 선택지가 없는 경우 기본 선택지 제공
  return {
    message: content,
    choices: ['계속할게!', '잠깐 쉴게', '다 했어!', '힘들어...'],
  };
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: '메시지가 필요합니다.', choices: [] },
        { status: 400 }
      );
    }

    const openai = createOpenAIClient();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXERCISE_COACH_SYSTEM_PROMPT },
        ...messages.map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const aiContent = response.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';
    const { message, choices } = parseResponse(aiContent);

    return NextResponse.json({ message, choices });
  } catch (error) {
    console.error('Chat API Error:', error);

    if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
      return NextResponse.json(
        {
          error: 'API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.',
          choices: [],
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: '지금은 대화가 어려워요. 잠시 후 다시 시도해주세요!',
        choices: ['다시 시도', '나중에 할게'],
      },
      { status: 500 }
    );
  }
}
