# AI Signal Radar

A public React dashboard for the AI Signal Radar automation workflow. It reads the sanitized `Public_Signals` worksheet through a Vercel Function, presents approachable AI examples, and explains the Zapier → Google Sheets → Make → GDELT → AI enrichment pipeline.

## Stack

- React 19 and Vite 8
- Vercel Function at `/api/signals`
- Published Google Sheets CSV feed
- Papa Parse for CSV conversion
- Plain responsive CSS with no UI framework

## Prerequisites

- Node.js 20.19+ or 22.12+
- A published CSV link for the `Public_Signals` worksheet
- Optional public URL for the Zapier research form

## Local setup

1. Copy the contents of this package into the root of your cloned repository.
2. Copy `.env.example` to `.env.local`.
3. Paste the Google Sheets CSV URL into `SHEET_CSV_URL`.
4. Add the public Zapier Form URL to `VITE_RESEARCH_FORM_URL`.
5. Run:

```bash
npm install
npm run dev
```

Open the local address shown by Vite, normally `http://localhost:5173`.

The Vite development server includes a small local `/api/signals` middleware so the usual `npm run dev` command tests both the dashboard and CSV conversion. If `SHEET_CSV_URL` is blank and `USE_SAMPLE_DATA=true`, the app displays bundled sample signals.

## Environment variables

| Variable | Scope | Purpose |
|---|---|---|
| `SHEET_CSV_URL` | Server | Published CSV URL for `Public_Signals` |
| `USE_SAMPLE_DATA` | Server | Allows bundled sample data when set to `true` |
| `VITE_RESEARCH_FORM_URL` | Browser | Public Zapier Form link |
| `VITE_GITHUB_URL` | Browser | Optional repository link |

Variables beginning with `VITE_` are embedded in browser code. Do not put secrets in them.

## Deploy to Vercel

1. Commit and push the project to GitHub.
2. Import the `ai-signal-radar` repository in Vercel.
3. Keep the detected framework as **Vite**.
4. Add these environment variables in Vercel Project Settings:
   - `SHEET_CSV_URL`
   - `USE_SAMPLE_DATA=false`
   - `VITE_RESEARCH_FORM_URL`
   - `VITE_GITHUB_URL` (optional)
5. Redeploy after adding or changing environment variables.

Vercel builds the React app and deploys `api/signals.js` as a server-side Function. The CSV URL is therefore not hard-coded in the repository.

## Expected public worksheet columns

```text
topic
business_question
title
source_url
published_at
category
relevance_score
summary
why_it_matters
prototype_idea
risk_note
created_at
```

The loader normalizes headings by converting spaces to underscores and ignores malformed rows without a title, source URL, or summary.

## Production checks

- `/api/signals` returns JSON with `signals` and `meta`.
- The dashboard displays live rows rather than the sample-data notice.
- The Zapier form button opens the correct public form.
- Source links open the original article in a new tab.
- The GitHub repository does not contain `.env.local`.

## Disclosure

This is an AI-assisted portfolio simulation conceived, directed, configured, tested, and deployed as a practical automation demonstration. External article results and generated explanations should be reviewed before being treated as authoritative guidance.
