AI EVIDENCE RADAR
=================

AI Evidence Radar is an AI-assisted React and Vercel portfolio application that turns a plain-language question into source-evaluated guidance, practical action steps, confidence context, and clearly stated limitations.

LIVE APPLICATION
----------------
https://ai-signal-radar-demo.vercel.app/

PUBLIC NAME AND TECHNICAL IDENTIFIERS
-------------------------------------
Public product name: AI Evidence Radar
GitHub repository slug: ai-signal-radar
Vercel hostname: ai-signal-radar-demo.vercel.app

The repository slug, Vercel hostname, existing Make scenario name, and existing Google Sheets names may retain the older AI Signal Radar wording so working integrations are not disrupted.

V2 WORKFLOW
-----------
1. A visitor submits the embedded React form.
2. The Vercel /api/submit Function forwards the request to a Make Custom Webhook.
3. Make creates the Topic_Requests_V2 row.
4. A Make Functions substring step creates a Tavily query capped at 380 characters.
5. Tavily retrieves relevant source material.
6. Make AI Toolkit evaluates the evidence and returns structured JSON.
7. Make writes the answer to AI_Signals_V2 and updates the final request status.
8. The Vercel API endpoints return status and completed answers to the React interface.

INTERFACE FEATURES
------------------
- Animated radar presentation
- Embedded form
- Paginated results
- Collapsed and expanded answer cards
- Direct links to individual answers
- Print-friendly individual submissions
- Recommended-step cleanup that prevents duplicated numbering such as 1. 1)

STATUS LIFECYCLE
----------------
queued -> searching -> generating -> completed

A request may finish as insufficient_sources when the evidence does not support a confident answer.

ENVIRONMENT VARIABLES
---------------------
MAKE_WEBHOOK_URL
PUBLIC_REQUEST_STATUS_V2_CSV_URL
PUBLIC_SIGNALS_V2_CSV_URL
USE_SAMPLE_DATA
VITE_GITHUB_URL

Never place webhook URLs, API keys, or other secrets in a VITE_ variable.

LOCAL COMMANDS
--------------
npm install
npm run dev
npm run build

GITHUB REPOSITORY DESCRIPTION
-----------------------------
React/Vercel portfolio app that turns plain-language questions into source-evaluated AI guidance using Make, Tavily, Google Sheets, and webhooks.

DISCLOSURE
----------
This is an AI-assisted portfolio demonstration conceived, directed, configured, tested, and deployed as a practical automation project. Search excerpts and generated guidance should be reviewed before being treated as authoritative professional advice.
