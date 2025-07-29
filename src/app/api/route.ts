// src/app/api/predict/route.ts
import { NextResponse } from 'next/server';

// POST 요청을 처리하는 핸들러
export async function POST(request: Request) {
  try {
    // 요청 본문 파싱 (실제 사용은 하지 않지만, 로그로 확인 가능)
    const body = await request.json();
    console.log("API /api/predict called with body:", body);

    // 임시 응답 데이터 (설계서 초안 STEP 2의 Response 예시)
    const mockResponse = {
      baseHz: 440, // 예시 값
      beatHz: 8,   // 예시 값
      bpm: 60,     // 예시 값 (계획서에 나와있는 BPM 범위 중 하나)
      rhythmKey: '4/4', // 예시 값 (계획서에 나와있는 리듬 패턴 중 하나)
      trackUrl: 'https://example.com/audio/placeholder_track.mp3', // 실제 음원 URL로 대체 필요
      ambienceUrls: body.ambience && body.ambience.length > 0 
        ? body.ambience.map((amb: string) => `https://example.com/ambience/placeholder_${amb.replace(/\s+/g, '_')}.mp3`) 
        : [] // 실제 배경음 URL로 대체 필요
    };

    // 200 OK 상태와 함께 JSON 응답 전송
    return NextResponse.json(mockResponse);

  } catch (error) {
    console.error('Error in /api/predict:', error);
    // 500 Internal Server Error 상태와 함께 오류 메시지 전송
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 다른 메소드 (GET, PUT 등) 요청이 오면 405 Method Not Allowed 반환
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed. Use POST.' }, { status: 405 });
}