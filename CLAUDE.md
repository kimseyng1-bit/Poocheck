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
│   ├── history/page.tsx       # Analysis history timeline + 30-day summary
│   ├── profile/page.tsx       # Pet profile setup
│   ├── result/page.tsx        # Analysis result display
│   ├── layout.tsx             # Root layout (mobile viewport, fonts)
│   ├── page.tsx               # Home — photo upload
│   └── globals.css
├── components/
│   ├── UploadZone.tsx         # Camera/gallery picker + preview
│   ├── ResultCard.tsx         # Color-coded health result
│   ├── BristolScale.tsx       # 1–7 Bristol stool scale bar
│   ├── VetCard.tsx            # Vet guidance for yellow/red: map links + summary share
│   ├── ProfileForm.tsx        # Pet name/age/breed form
│   └── StatusBadge.tsx        # green/yellow/red badge
├── hooks/
│   └── useAnalysis.ts         # Client-side analysis state machine
├── lib/
│   ├── claude.ts              # Anthropic client + analysis prompt
│   ├── verdict.ts             # green/yellow/red rules (Bristol + findings → level)
│   ├── vet.ts                 # Kakao/Naver map search links + vet summary text
│   └── history.ts             # localStorage history store (max 60, thumbnails)
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
  "level": "green" | "yellow" | "red",   // computed in code, not by Claude
  "level_reasons": ["혈액", ...],         // what set the level; [] for green
  "bristol_score": 1-7,
  "confidence": "high" | "medium" | "low",
  "confidence_reason": "Why this confidence level",
  "summary": "Brief one-sentence verdict",
  "details": { "color": "...", "shape": "...", "foreign_objects": "..." },
  "advice": "What the owner should do next"
}

// 422 when the photo can't be analyzed (no result is returned or saved)
{ "error": "Retake message", "code": "not_stool" | "unclear" }
```

## Development Notes
- All pages are mobile-first (max-w-md centered)
- Image is converted to base64 before sending to Claude
- Pet profile is stored in `localStorage` (no backend DB)
- Vet finder uses map app search links only (no geolocation, no API key); the map app uses the viewer's own location
- Analysis history (result + small thumbnail) is stored in `localStorage` under `poocheck_history`
- The Claude prompt is in `src/lib/claude.ts` — tune it there
- Analysis uses structured outputs (JSON schema) + `temperature: 0`. Claude reports only the Bristol score and yes/no findings; the level is computed by `src/lib/verdict.ts` (change verdict rules there, not in the prompt)
