

Beatamin MVP 개발 현황 및 다음 단계 전달 사항
1. 개요 (Overview)
이 문서는 Beatamin MVP 개발 프로젝트의 현재 진행 상황과 다음 단계로 넘어가기 위해 필요한 기술적 작업들을 정리한 것입니다. 목표는 제공해주신 설계서 초안 (STEP 1-7), 입력 프롬프트, Firebase 설정, 그리고 이전 대화 내용을 기반으로, 개발이 원활히 이어질 수 있도록 명확한 Task List를 제공하는 것입니다.

2. 현재 상태 (Current Status)
완료된 항목 (Completed Tasks)
Firebase 프로젝트 생성 및 설정
Firebase Console에서 프로젝트 생성 및 기본 설정 완료.
Firebase Console
Authentication, Firestore 활성화됨.
Firebase SDK 설치 및 초기화
firebase/app
,
firebase/auth
,
firebase/firestore
설치 및
src/lib/firebase.ts
에 초기화 코드 작성.
src/lib/firebase.ts
checkavac-d2e22
프로젝트 설정 사용.
Firebase Authentication 활성화
Google 로그인과 이메일/비밀번호 로그인 활성화.
Firebase Console
필수 라이브러리 설치
react-firebase-hooks
설치.
package.json
기본 레이아웃 (layout.tsx) 생성
헤더(홈/뒤로가기, 로고, 타이머, 언어선택, 햄버거, 프로필), 메인 콘텐츠, 광고 배너, 푸터 구조.
src/app/layout.tsx
타이머는 임시.
로그인 페이지 (/login) 구현
Google 로그인 및 이메일/비밀번호 로그인/회원가입 기능.
src/app/login/page.tsx
온보딩 페이지 (/onboarding) 구현
사용자 정보 입력 폼 (성별, 생년월일, 몸무게, 혈액형, 듣는 도구, MBTI, 공간).
src/app/onboarding/page.tsx
Firestore 저장 로직 포함.
기호 선택 페이지 (/categories) 구현
8개 대분류 카드 표시 및 클릭 시 세부 항목 페이지로 이동.
src/app/categories/page.tsx
이미지 표시 구조 포함.
세부 기호 선택 페이지 (/categories/[slug]) 구현
각 대분류의 8개 세부 항목 표시 및 선택.
src/app/categories/[slug]/page.tsx
이미지, 설명 표시.
params
오류 수정됨.
배경 소리 선택 페이지 (/ambience) 구현
16개 배경 소리 중 최대 2개 선택 가능.
src/app/ambience/page.tsx
선택한 값
localStorage
저장.
시간 선택 페이지 (/time) 구현
10분~12시간 옵션 제공. 유료/무료 사용자에 따라 선택 제한.
src/app/time/page.tsx
선택한 값
localStorage
저장.
재생 페이지 (/play) 구현 (기초)
/api/predict
호출, 더미 응답 처리, 기본 UI.
src/app/play/page.tsx
임시 API 경로 (/api/predict) 생성
POST 요청에 대해 더미 데이터 반환.
src/app/api/predict/route.ts
실제 백엔드 연결 전 임시 사용.

3. 다음 단계 작업 (Next Steps - Tasks)
A. 프론트엔드 개선 및 추가 (Frontend Enhancements & Additions)
FE-01
카테고리 데이터 완성
src/app/categories/[slug]/page.tsx
의
categoryDetails
객체에
study
,
emotion
,
exercise
,
work
,
love
,
spirituality
에 대한 세부 항목 데이터 추가.
높음
이미지 경로 및 설명도 함께 추가 필요.
FE-02
이미지 준비
public/images/categories/
폴더 구조에 따라 각 카테고리 및 세부 항목의 이미지 파일 준비 및 배치.
높음
FE-03
재생 페이지 UI/UX 개선
실제 오디오 재생, 볼륨 컨트롤, 타이머 연동, 광고 표시 로직 구현.
높음
FE-04
정보 섹션 페이지 개발
/info/blood
,
/info/zodiac
,
/info/mbti
페이지 개발.
중간
FE-05
헤더 타이머 기능 구현
헤더의 타이머가
/time
에서 선택한 시간을 반영하고,
/play
페이지에서 카운트다운되도록 로직 구현.
중간
FE-06
UI 텍스트 다국어 준비
설계서 STEP 4의 UI 텍스트를 기반으로 다국어 리소스 파일 구조 설계.
낮음
추후 구현.
FE-07
에러 메시지 개선
설계서 STEP 5의 에러 메시지를 코드에 반영.
중간
FE-08
스타일 가이드 적용
설계서 STEP 7의 스타일 가이드 (색상, 폰트, 그림자, 애니메이션)를 코드 전반에 적용.
중간
무지개 야광색 등 반영.

B. 백엔드 및 API 개발 (Backend & API Development)
BE-01
실제 /api/predict API 개발
Heroku에 Flask/FastAPI 앱 배포. Scikit-learn 모델 통합. 요청 파라미터에 따라 음원 및 파라미터 반환.
높음
입력 프롬프트의
Scikit-learn 역할
참조.
BE-02
API 문서화
/api/predict
엔드포인트의 입력/출력 명세를 명확히 문서화.
중간
설계서 STEP 2 참조.
BE-03
Fail-over 설정
Render.com에 백엔드 앱 배포 및 Cloudflare Worker를 통한 트래픽 분산/장애 조치 로직 구현.
중간
입력 프롬프트의
herokur 문제 발생을 대비해서
참조.
BE-04
음원/영상 저장소 연동
Cloudinary 계정 생성 및 음원/영상 업로드, URL 관리 로직 개발.
중간
입력 프롬프트의
저장소 -- 무료 클라우드 확보해야 한다.--Cloudinary ?
참조.

C. 데이터 및 콘텐츠 준비 (Data & Content Preparation)
DC-01
음원 메타데이터 준비
설계서 및 입력 프롬프트의 음원 분류(분위기, 기능, BPM, 리듬)에 따라 메타데이터(CSV 등) 생성.
높음
DC-02
음원 라이선스 확인
사용할 음원이 CC0 또는 자체 제작인지 확인하는 프로세스 정립.
높음
설계서 SECTION 0 참조.
DC-03
설명 콘텐츠 준비
혈액형, 별자리, MBTI, 뇌파에 대한 설명 텍스트 준비.
중간
설계서 SECTION 3, 입력 프롬프트 참조.

D. 인증 및 보안 (Authentication & Security)
AS-01
Firebase 보안 규칙 설정
Firestore 보안 규칙을 설계서 SECTION 8에 따라 설정 (UID 단위 접근 제한 등).
높음
AS-02
의료 표현 필터링 로직 개발
설계서 SECTION 8에 따라, 사용자 입력이나 콘텐츠에 의료 관련 표현이 포함되지 않도록 사전 필터링 로직 구현.
중간

E. 배포 및 모니터링 (Deployment & Monitoring)
DM-01
CI/CD 파이프라인 설정
GitHub Actions를 사용하여 코드 변경 시 자동으로 Heroku 및 Render에 배포되도록 설정.
중간
설계서 SECTION 7 참조.
DM-02
백업 스크립트 설정
Firestore 데이터를 Cloud Storage로 자동 백업하는 스크립트 개발 및 스케줄링.
낮음
설계서 SECTION 9 참조.
DM-03
모니터링 설정
UptimeRobot 등을 사용하여 앱의 가용성 모니터링 설정.
낮음
설계서 SECTION 9 참조.

4. 완료..점검필요
FE-01 & FE-02 (카테고리 데이터 및 이미지 준비): 이 작업이 완료되어야 나머지 흐름 (세부 선택 → API 호출)이 원활히 테스트됩니다.
BE-01 (실제 /api/predict API 개발): 프론트엔드와 백엔드가 연결되어야 MVP의 핵심 기능 테스트가 가능합니다.
FE-03 (재생 페이지 개선): API가 준비되면 바로 진행할 수 있습니다.
이 Task List를 기반으로, 다음 대화에서는 구체적인 항목 (예: FE-01)에 대해 코드나 구현 방식을 논의하면 됩니다. 이렇게 하면 프로젝트의 진행 상황을 명확히 파악하고, 효율적으로 작업을 분배 및 추적할 수 있습니다.




## 🎯 현재 우선순위 작업 (Current Priority Tasks)

### 즉시 해결 필요 (Immediate)
1. **BE-01**: 실제 `/api/predict` API 개발 및 배포
   - Heroku/Render에 Flask/FastAPI 백엔드 구축
   - Scikit-learn 모델 통합
   - Cloudinary 음원 URL 연동

2. **FE-03**: 오디오 재생 기능 완성
   - Web Audio API를 통한 바이노럴 비트 생성
   - 실제 음원 재생 및 믹싱
   - 볼륨 컨트롤 기능 구현

### 단기 목표 (Short-term)
3. **DC-01**: 음원 메타데이터 및 라이선스 정리
4. **FE-05**: 헤더 타이머 기능 구현
5. **AS-01**: Firebase 보안 규칙 설정

### 중기 목표 (Medium-term)
6. **BE-03**: Fail-over 시스템 구축
7. **FE-08**: 스타일 가이드 전면 적용
8. **DM-01**: CI/CD 파이프라인 설정

## ✅ 최근 완료된 작업 (Recently Completed)

### Play 페이지 개선 (2024년 1월)
- ✅ 파싱 오류 완전 해결
- ✅ 4개 정보 섹션 구현 (User Info, Selection, AI Generated, Player Status)
- ✅ 접이식 UI 인터페이스
- ✅ 테마별 색상 시스템 (보라/파랑/초록/주황)
- ✅ 생성된 정보 표시 기능
- ✅ 레이아웃 재구성 (플레이어 컨트롤 상단 이동)
- ✅ 글로우 효과 및 애니메이션 적용
- ✅ 반응형 디자인 개선

### 기술적 개선사항
- ✅ `expandedSections` 상태 관리 시스템
- ✅ `toggleSection` 함수 구현
- ✅ 동적 데이터 바인딩
- ✅ TypeScript 타입 안정성 개선
- ✅ 코드 구조 정리 및 중복 제거

## 🔄 다음 단계 계획 (Next Steps)

1. **백엔드 API 완성**: 실제 음원 생성 및 반환 로직
2. **오디오 엔진 구현**: Web Audio API 기반 바이노럴 비트 생성
3. **음원 저장소 연동**: Cloudinary 통합
4. **성능 최적화**: 로딩 시간 단축 및 메모리 사용량 최적화
5. **사용자 테스트**: MVP 기능 검증 및 피드백 수집

Cloudinary 곡 URL + Web-Audio 튜닝 연결만 남음



---

## 🔥 최신 작업 진행 상황 (Latest Work Progress)

### 2024년 1월 - 사용자 플랜 표시 및 UI 개선 작업

#### ✅ 완료된 작업 (Completed Tasks)

1. **사용자 플랜 표시 통일화**
   - **문제**: `Your plan: FREEA` 표시가 대분류 페이지에만 있고 다른 페이지에서 누락
   - **해결**: 모든 페이지에 일관된 사용자 플랜 표시 추가
   - **적용 페이지**:
     - ✅ `/categories/[slug]` (소분류 페이지)
     - ✅ `/ambience` (배경소리 선택 페이지)
     - ✅ `/time` (타이머 선택 페이지) 
     - ✅ `/play` (플레이 페이지)

2. **Ambience 페이지 UI 개선**
   - **버튼 레이아웃**: 한 줄에 3개씩 배치 (`grid-cols-3`)
   - **버튼 크기**: 폭 60%, 높이 2배로 조정
   - **텍스트 스타일**: 크기 2배, 하늘색 야광색 적용
   - **간격 조정**: `gap-2`로 적절한 간격 유지
   - **이미지 지원**: 향후 그림 파일 추가 가능한 구조

3. **홈페이지 리다이렉트 로직 구현**
   - **문제**: `http://localhost:3000/`에서 Next.js 기본 페이지 표시
   - **해결**: 로그인 상태에 따른 자동 리다이렉트
     - 로그인된 사용자 → `/categories` (대분류 페이지)
     - 미로그인 사용자 → `/login` (로그인 페이지)
   - **로딩 화면**: 스피너와 "Beatamin" 브랜딩 표시
   - **에러 처리**: 에러 발생 시 로그인 페이지로 이동 버튼 제공

4. **헤더 타이머 제거**
   - **문제**: 헤더 오른쪽의 불필요한 타이머 표시
   - **해결**: `layout.tsx`에서 타이머 관련 코드 완전 제거
     - `timeLeft` 상태 제거
     - `useEffect` 타이머 로직 제거
     - `formatTime` 함수 제거
     - 헤더 UI에서 타이머 디스플레이 제거

5. **파싱 오류 해결**
   - **문제**: `page.tsx`에서 'use client' 지시어 위치 오류 및 문자열 종료 문제
   - **해결**: 
     - 'use client' 지시어를 파일 최상단으로 이동
     - 중복된 함수 및 Next.js 기본 코드 제거
     - 불필요한 import 정리
     - 1556줄 → 57줄로 코드 간소화

#### 🎯 기술적 개선사항

- **코드 구조 정리**: 중복 코드 제거 및 파일 크기 대폭 감소
- **타입 안정성**: TypeScript 오류 해결
- **사용자 경험**: 일관된 플랜 표시로 사용자 혼란 방지
- **반응형 디자인**: 3열 그리드 레이아웃으로 모바일 친화적 UI
- **성능 최적화**: 불필요한 타이머 로직 제거로 성능 향상

#### 📋 다음 우선순위 작업

1. **이미지 파일 준비**: ambience 페이지용 배경 이미지
2. **카테고리 이미지 로딩 문제 해결**: categories 페이지 이미지 표시 개선
3. **API 연동 완성**: 실제 백엔드 API와 프론트엔드 연결
4. **오디오 재생 기능**: Web Audio API 기반 바이노럴 비트 생성
5. **사용자 테스트**: MVP 기능 검증

---