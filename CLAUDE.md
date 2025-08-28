# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev        # Start development server (default port 3000)
npm run build      # Create production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Testing & Deployment
```bash
# Build and test locally before deployment
npm run build && npm run start

# Deploy to Vercel (after git push)
vercel --prod
```

## Architecture Overview

This is a simple chatbot application built with Next.js 15 App Router that integrates with Claude API. The architecture has been deliberately simplified from a complex wrapper to a focused chatbot interface.

### Core Components

**API Integration (`app/api/chat/route.ts`)**
- Direct integration with Anthropic's Claude API
- Uses `claude-3-5-sonnet-20241022` model
- Handles message context passing for conversation continuity
- Returns streaming responses from Claude

**Chat Interface (`components/chat/chat-interface.tsx`)**
- Self-contained React component managing entire chat UI
- Implements context memory system keeping last 10 messages
- Uses `sessionStorage` for temporary conversation persistence (cleared on browser close)
- Auto-scrolling messages and auto-resizing textarea
- No authentication required - direct access to chat

### Message Context System
The application maintains conversation context by:
1. Storing all messages in component state
2. Persisting to sessionStorage for page refreshes
3. Sending last 10 messages (5 conversation pairs) with each API request
4. This allows Claude to maintain conversation continuity without server-side storage

### Environment Variables
Required in `.env.local`:
- `CLAUDE_API_KEY`: Anthropic API key for Claude access
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL (legacy, not currently used)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase key (legacy, not currently used)

### Vercel Configuration
The `vercel.json` configures:
- Region: `icn1` (Seoul) for Korean users
- Function duration: 30 seconds for chat API route
- Next.js framework detection

### Key Design Decisions
1. **No Authentication**: Removed to simplify access per user requirement
2. **Client-Side Storage**: Uses sessionStorage instead of database
3. **Minimal UI**: Clean, simple design focusing on functionality
4. **Context Window**: Limited to 10 messages to balance memory and API costs

## Important Notes

- The README.md references authentication and Supabase features that have been removed - the actual implementation is simpler
- Chat history is temporary and cleared when browser is closed
- No user accounts or persistent conversation storage
- All styling uses Tailwind CSS with shadcn/ui components