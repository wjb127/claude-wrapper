# Claude Wrapper

Next.js 15 + Supabase + Vercel + Claude API를 사용한 Claude 웹 인터페이스 클론

## 기능

- 🔐 Supabase 인증
- 💬 Claude API를 통한 실시간 채팅
- 📝 대화 저장 및 관리
- 🎨 Claude 웹 인터페이스와 유사한 UI
- 📱 반응형 디자인

## 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Claude API
CLAUDE_API_KEY=your_claude_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com) 프로젝트 생성
2. `supabase/schema.sql` 파일의 SQL을 실행하여 데이터베이스 스키마 생성
3. Authentication 설정에서 Email/Password 인증 활성화

### 3. Claude API 키 발급

1. [Anthropic Console](https://console.anthropic.com) 접속
2. API Keys 섹션에서 새 API 키 생성
3. `.env.local` 파일에 API 키 추가

### 4. 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Claude API (Anthropic)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 프로젝트 구조

```
claude-wrapper/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   └── conversations/
│   ├── chat/
│   └── page.tsx
├── components/
│   ├── auth/
│   └── chat/
├── lib/
│   └── supabase/
├── types/
└── supabase/
    └── schema.sql
```

## Vercel 배포

1. GitHub에 리포지토리 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 Import
3. 환경 변수 설정
4. 배포

## 라이선스

MIT
