# Claude Wrapper - Advanced AI Chat Interface

Next.js 15 + Claude API를 사용한 고급 AI 채팅 인터페이스

## ✨ 주요 기능

### 🗣️ 대화 관리
- **멀티 스레드 대화**: 여러 대화를 동시에 관리
- **대화 히스토리**: 자동 저장 및 복구 기능
- **컨텍스트 관리**: 스마트한 대화 맥락 유지
- **대화 내보내기/가져오기**: JSON 형태로 백업 및 복원

### 🎨 사용자 경험
- **실시간 타이핑 효과**: 자연스러운 응답 표시
- **고급 메시지 포매팅**: Markdown, 코드 하이라이팅 지원
- **파일 첨부 지원**: 이미지, 문서, 코드 파일 처리
- **드래그 앤 드롭**: 직관적인 파일 업로드
- **반응형 디자인**: 모든 디바이스에서 최적화

### 🔧 고급 기능
- **플러그인 시스템**: 확장 가능한 기능 추가
- **프롬프트 템플릿**: 미리 정의된 프롬프트 사용
- **자동 번역**: 다국어 지원 및 실시간 번역
- **메시지 스레딩**: 대화 분기 및 추적
- **스트리밍 응답**: 실시간 응답 스트리밍

### 🛠️ 개발자 도구
- **API 래퍼**: 강력한 Claude API 인터페이스
- **에러 핸들링**: 포괄적인 오류 관리
- **성능 최적화**: 지연 로딩 및 캐싱
- **타입 안전성**: 완전한 TypeScript 지원

## 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Claude API (필수)
CLAUDE_API_KEY=your_claude_api_key

# 선택적 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### 2. Claude API 키 발급

1. [Anthropic Console](https://console.anthropic.com) 접속
2. API Keys 섹션에서 새 API 키 생성
3. `.env.local` 파일에 API 키 추가

### 3. 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

## 🚀 사용법

### 기본 채팅
1. 애플리케이션 실행 후 채팅 페이지 접속
2. 메시지 입력창에 질문이나 요청 입력
3. Enter 키로 전송 (Shift+Enter로 줄바꿈)

### 고급 기능 사용
- **파일 첨부**: 클립 아이콘 클릭 또는 드래그 앤 드롭
- **프롬프트 템플릿**: 📄 아이콘 클릭하여 템플릿 선택
- **플러그인 관리**: 🧩 아이콘 클릭하여 플러그인 설정
- **대화 분기**: 스레드 뷰에서 특정 메시지에 답글
- **설정 변경**: ⚙️ 아이콘 클릭하여 AI 모델 및 UI 설정

### 키보드 단축키
- `Enter`: 메시지 전송
- `Shift + Enter`: 줄바꿈
- `F11`: 전체화면 토글
- `Escape`: 모달 닫기

## 🛠️ 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **AI**: Claude API (Anthropic)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Markdown**: React Markdown + Syntax Highlighting
- **State Management**: React Context + useReducer
- **Storage**: localStorage (클라이언트 사이드)

## 📁 프로젝트 구조

```
claude-wrapper/
├── app/
│   ├── api/
│   │   ├── chat/          # 채팅 API 엔드포인트
│   │   └── files/         # 파일 처리 API
│   ├── chat/              # 채팅 페이지
│   ├── globals.css        # 전역 스타일
│   └── layout.tsx         # 루트 레이아웃
├── components/
│   ├── chat/              # 채팅 관련 컴포넌트
│   │   ├── enhanced-chat-interface.tsx
│   │   ├── message-bubble.tsx
│   │   ├── chat-input.tsx
│   │   ├── sidebar.tsx
│   │   ├── settings-panel.tsx
│   │   ├── plugin-manager.tsx
│   │   ├── template-selector.tsx
│   │   └── thread-tree.tsx
│   └── ui/                # 공통 UI 컴포넌트
│       ├── typing-effect.tsx
│       ├── loading-spinner.tsx
│       ├── progress-bar.tsx
│       └── message-formatter.tsx
├── lib/
│   ├── hooks/             # React 훅
│   │   └── use-chat.tsx
│   ├── plugins/           # 플러그인 구현
│   │   ├── prompt-templates.ts
│   │   └── auto-translator.ts
│   ├── claude-api.ts      # Claude API 래퍼
│   ├── chat-storage.ts    # 로컬 저장소 관리
│   ├── file-processor.ts  # 파일 처리
│   ├── plugin-system.ts   # 플러그인 시스템
│   └── utils.ts           # 유틸리티 함수
├── types/
│   └── chat.ts            # 타입 정의
└── package.json
```

## Vercel 배포

1. GitHub에 리포지토리 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 Import
3. 환경 변수 설정
4. 배포

## 라이선스

MIT
