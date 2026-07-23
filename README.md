# AI Evidence Radar

**AI Evidence Radar** is an AI-assisted React and Vercel portfolio application that turns a plain-language question into source-evaluated guidance, practical action steps, confidence context, and clearly stated limitations.

The public product name is **AI Evidence Radar**. Historical infrastructure identifiers remain unchanged to avoid breaking working integrations:

- GitHub repository slug: `ai-signal-radar`
- Vercel project and hostname: `ai-signal-radar-demo.vercel.app`
- Existing Make scenario and Google Sheets names may still contain `AI Signal Radar`

## Live application

`https://ai-signal-radar-demo.vercel.app/`

## What the V2 workflow demonstrates

- Embedded React intake form
- Instant webhook submission through a Vercel Function
- Make orchestration triggered immediately when data arrives
- Tavily search using a controlled query of no more than 380 characters
- Make AI Toolkit grounding and structured JSON generation
- Google Sheets request, status, and result storage
- Vercel status polling for queued, searching, generating, and final states
- Paginated answer browsing for larger result collections
- Collapsed and expanded answer views
- Direct links to individual answers
- Print-friendly output for individual submissions
- Defensive cleanup that removes AI-generated numbering prefixes before the browser applies ordered-list numbering

## Current architecture

```text
Visitor submits the embedded form
        ↓
Vercel /api/submit
        ↓
Make Custom Webhook
        ↓
Topic_Requests_V2 row created
        ↓
380-character search-query function
        ↓
Tavily search
        ↓
Make AI Toolkit grounding prompt
        ↓
JSON Parse
        ↓
AI_Signals_V2 row created
        ↓
Topic_Requests_V2 final status updated
        ↓
Vercel /api/status and /api/signals
        ↓
React interface displays the result
```

## Technology stack

- React 19
- Vite 8
- Vercel static hosting and serverless Functions
- Make Custom Webhooks and scenario orchestration
- Make AI Toolkit
- Tavily Search
- Google Sheets
- Papa Parse
- Plain responsive CSS

## Important V2 behavior

### Search-query protection

The complete visitor question remains stored as `business_question`. A Make Functions substring module produces a separate search query capped at 380 characters for Tavily and the `search_query` audit column.

### Recommended-step numbering protection

The interface removes leading prefixes such as `1)`, `1.`, `Step 1:`, and similar labels from each generated action step before rendering it inside an HTML ordered list. This prevents duplicated numbering such as `1. 1)`.

### Status lifecycle

A normal request progresses through:

```text
queued → searching → generating → completed
```

A request may instead finish as `insufficient_sources` when the available evidence does not support a confident answer. Failed executions are recorded separately rather than being shown as completed.

## Environment variables

| Variable | Scope | Purpose |
|---|---|---|
| `MAKE_WEBHOOK_URL` | Server only | Private Make V2 webhook URL |
| `PUBLIC_REQUEST_STATUS_V2_CSV_URL` | Server only | Published CSV for request status polling |
| `PUBLIC_SIGNALS_V2_CSV_URL` | Server only | Published CSV for completed public answers |
| `USE_SAMPLE_DATA` | Server only | Enables bundled fallback data when set to `true` |
| `VITE_GITHUB_URL` | Browser | Optional public repository link |

Variables beginning with `VITE_` are browser-visible. Never store private webhook URLs, API keys, or other secrets in a `VITE_` variable.

## Local development

```bash
npm install
npm run dev
```

Open the local address printed by Vite, normally `http://localhost:5173`.

Run a production build before committing:

```bash
npm run build
```

## Vercel deployment checks

1. Confirm the build succeeds locally.
2. Keep private values in Vercel environment variables.
3. Verify `/api/signals` returns `signals` and `meta`.
4. Verify a real Preview submission reaches the Make webhook.
5. Confirm the full question is stored in `business_question`.
6. Confirm Tavily receives the shortened query.
7. Confirm the answer appears on the Preview site.
8. Confirm recommended steps are numbered only once.
9. Confirm `.env.local` is not tracked by Git.

## Repository description

Paste this into the GitHub repository **About** description field:

> React/Vercel portfolio app that turns plain-language questions into source-evaluated AI guidance using Make, Tavily, Google Sheets, and webhooks.

## Project disclosure

This is an AI-assisted portfolio demonstration conceived, directed, configured, tested, and deployed as a practical automation project. Search excerpts and generated guidance should be reviewed before being treated as authoritative professional advice.
