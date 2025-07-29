import { NextRequest, NextResponse } from 'next/server';
import { microTuning } from '@/lib/tuning/micro_tuning';
import { userFactor }  from '@/lib/tuning/user_factor';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received API request:', body); // 디버깅 로그 추가
    
    const { sub, gender, ageGroup, blood, space, device } = body;

    const safeCat = body.category.toLowerCase();
    const safeSub = sub.replace(/\s+/g, '_').toLowerCase();
    
    console.log('Processing:', { safeCat, safeSub }); // 디버깅 로그 추가
    
    const base = microTuning[safeCat]?.[safeSub];

    if (!base) {
      console.error('Category not found:', { safeCat, safeSub }); // 에러 로그 추가
      return NextResponse.json({ error: 'Invalid category or subcategory' }, { status: 400 });
    }

    // 2. 보정 계산
    const g  = userFactor.gender[gender]        ?? {};
    const a  = userFactor.ageGroup[ageGroup]    ?? {};
    const b  = userFactor.blood[blood]          ?? {};
    const s  = userFactor.space[space]          ?? {};
    const d  = userFactor.device[device]        ?? {};

    const hz    = base.hz   + (g.hz   ?? 0) + (a.hz   ?? 0) + (b.hz   ?? 0) + (s.hz   ?? 0) + (d.hz   ?? 0);
    const bpm   = base.bpm  + (g.bpm  ?? 0) + (a.bpm  ?? 0) + (b.bpm  ?? 0) + (s.bpm  ?? 0) + (d.bpm  ?? 0);
    const energy= base.energy+(g.energy??0)+(a.energy??0)+(b.energy??0)+(s.energy??0)+(d.energy??0);
    const rhythm= base.rhythm+(g.rhythm??0)+(a.rhythm??0)+(b.rhythm??0)+(s.rhythm??0)+(d.rhythm??0);

    // 3. music.json에서 가장 적합한 음악 선택
    try {
      const musicJsonPath = path.join(process.cwd(), 'public', 'meta', 'music.json');
      const musicData = JSON.parse(fs.readFileSync(musicJsonPath, 'utf8'));
      
      // 계산된 값과 가장 유사한 음악 찾기
      let bestMatch = musicData[0];
      let bestScore = Infinity;
      
      for (const track of musicData) {
        // 유클리드 거리 계산 (bpm, hz, energy 기준)
        const bpmDiff = Math.abs(track.bpm - bpm);
        const hzDiff = Math.abs(track.hz - hz);
        const energyDiff = Math.abs(track.energy - energy);
        
        const score = Math.sqrt(bpmDiff * bpmDiff + hzDiff * hzDiff + energyDiff * energyDiff);
        
        if (score < bestScore) {
          bestScore = score;
          bestMatch = track;
        }
      }
      
      // 4. 결과 반환 (public_id 포함)
      return NextResponse.json({ 
        hz, 
        bpm, 
        energy, 
        rhythm,
        public_id: bestMatch.public_id,
        matched_track: bestMatch
      });
    } catch (error) {
      console.error('Error reading music.json:', error);
      // 오류 발생 시 기본값 사용
      return NextResponse.json({ 
        hz, 
        bpm, 
        energy, 
        rhythm,
        public_id: "newagemusic001" // 기본 음악
      });
    }
  } catch (error) {
    console.error('API processing error:', error); // 에러 로그 추가
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}