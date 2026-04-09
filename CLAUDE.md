# PooCheck — Claude Code Guide

## Project Overview
PooCheck is a mobile-first web app that lets dog owners upload a photo of their pet's poop and receive an AI-powered health analysis via Claude Vision API.

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (mobile-first)
- **AI**: Anthropic Claude API (`claude-opus-4-5` vision model)
- **Runtime**: Node.js 18+

## Folder Structure
```
src/
├── app/
│   ├── api/analyze/route.ts   # POST /api/analyze — image → Claude Vision
│   ├── profile/page.tsx       # Pet profile setup
│   ├── result/page.tsx        # Analysis result display
│   ├── layout.tsx             # Root layout (mobile viewport, fonts)
│   ├── page.tsx               # Home — photo upload
│   └── globals.css
├── components/
│   ├── UploadZone.tsx         # Camera/gallery picker + preview
│   ├── ResultCard.tsx         # Color-coded health result
│   ├── ProfileForm.tsx        # Pet name/age/breed form
│   └── StatusBadge.tsx        # green/yellow/red badge
├── hooks/
│   └── useAnalysis.ts         # Client-side analysis state machine
├── lib/
│   └── claude.ts              # Anthropic client + analysis prompt
└── types/
    └── index.ts               # Shared TypeScript types
```

## Environment Variables
Copy `.env.example` to `.env.local` and fill in:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Key Commands
```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Analysis Result Levels
| Level  | Color  | Meaning                              |
|--------|--------|--------------------------------------|
| green  | 🟢     | Normal — no action needed            |
| yellow | 🟡     | Monitor — check again in a few days  |
| red    | 🔴     | Concern — consult a vet              |

## API Contract
**POST /api/analyze**
```json
// Request (multipart/form-data)
{ "image": File, "pet": { "name": "...", "age": 3, "breed": "..." } }

// Response
{
  "level": "green" | "yellow" | "red",
  "summary": "Brief one-sentence verdict",
  "details": { "color": "...", "shape": "...", "foreign_objects": "..." },
  "advice": "What the owner should do next"
}
```

## Development Notes
- All pages are mobile-first (max-w-md centered)
- Image is converted to base64 before sending to Claude
- Pet profile is stored in `localStorage` (no backend DB)
- The Claude prompt is in `src/lib/claude.ts` — tune it there
