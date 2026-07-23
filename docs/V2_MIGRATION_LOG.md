echo # AI Signal Radar V2 Migration Log > docs\\V2_MIGRATION_LOG.md
echo. >> docs\\V2_MIGRATION_LOG.md
echo This branch migrates AI Signal Radar from scheduled GDELT processing to instant webhook-driven Tavily search. >> docs\\V2_MIGRATION_LOG.md
echo. >> docs\\V2_MIGRATION_LOG.md
echo ## Phase 0 - V1 Protection and V2 Initialization >> docs\\V2_MIGRATION_LOG.md
echo - Stable V1 tagged as v1.0-gdelt-polling. >> docs\\V2_MIGRATION_LOG.md
echo - V2 development branch created as v2-instant-tavily. >> docs\\V2_MIGRATION_LOG.md
echo - Production remains on the main branch. >> docs\\V2_MIGRATION_LOG.md

\## Phase 1 - V2 Data Model

- Added Topic_Requests_V2 without modifying the V1 request worksheet.
- Added AI_Signals_V2 for direct, multi-source practical answers.
- Added Public_Request_Status_V2 for asynchronous browser status checks.
- Added Public_Signals_V2 for the V2 dashboard data feed.
- Preserved all V1 tabs and production data.
- Published only the two formula-derived V2 worksheets as CSV feeds.
- No Make, Zapier, or Production Vercel behavior was changed during this phase.

\## Phase 2 - Instant Webhook Intake

\- Rebuilt the duplicated V2 Make scenario on a clean canvas.

\- Replaced scheduled Google Sheets polling with a Make Custom Webhook.

\- Detected and mapped request_id, submitted_at, topic, request_type, and business_question from a live sample payload.

\- Added each incoming request to Topic_Requests_V2 with a controlled queued status.

\- Added a custom JSON Webhook Response using HTTP status 202.

\- Disabled Process data in order because Make does not support Webhook Response while sequential processing is enabled.

\- Kept Store incomplete executions enabled for troubleshooting.

\- Verified the webhook through curl and received the correct JSON acknowledgement.

\- Verified the queued request in Topic_Requests_V2 and Public_Request_Status_V2.

\- Confirmed that no scheduled polling or manual Make execution will be required for V2 intake.

\- Deleted the temporary test row after validation.

\- Kept the V2 scenario inactive pending search and answer enrichment.

\## Phases 3 and 4 - Tavily Search and Grounded Answer Processing

\- Replaced GDELT with Tavily Advanced Search using the visitor's actual question.

\- Configured five ranked general-search results without raw-content retrieval.

\- Verified that Tavily returned sources meaningfully related to the webcomic promotion and membership question.

\- Added searching and generating lifecycle updates to Topic_Requests_V2.

\- Added a grounded Make AI Toolkit prompt with semantic relevance, source-quality, confidence, and insufficient-source rules.

\- Separated the practical answer from optional ways AI could assist.

\- Added structured fields for ordered actions, a quick win, monetization guidance, cautions, and supporting sources.

\- Parsed the AI output through the AI Signal Radar V2 Answer JSON structure.

\- Added completed answer records to AI_Signals_V2.

\- Standardized V2 Google Sheets modules to use column headers as stable column IDs.

\- Initially tested Router branches for final status handling, but observed competing final updates despite correctly configured filters.

\- Replaced the Router with a deterministic linear final-status design.

\- Learned that inline switch text is not evaluated when manually typed into an ordinary mapping field.

\- Added two native Make Functions General Functions modules using the visual Switch operation.

\- Make Functions module 31 determines status.

\- Make Functions module 32 determines status_message.

\- Mapped 31.Result and 32.Result into the final Google Sheets Update a Row module.

\- Verified that strong_match produced status completed and the message Your practical answer is ready.

\- Preserved workflow match_status separately from request-processing status.

\- Kept V1 production unchanged while V2 remained inactive during controlled testing.

## Public branding transition — AI Evidence Radar

**Date:** July 23, 2026  
**Status:** Verified branding patch prepared

The public-facing project name changed from **AI Signal Radar** to **AI Evidence Radar** to create a more distinctive portfolio identity while retaining the radar concept.

### Updated public-facing elements

- Browser-page title: `AI Evidence Radar | Source-Evaluated AI Guidance`
- Main heading: `AI Evidence Radar turns real-world questions into approachable action plans.`
- Header/logo wording: `AI Evidence Radar`
- Social-sharing title: `AI Evidence Radar — Practical, Source-Evaluated AI Guidance`
- README.md and README.txt branding and V2 architecture documentation
- GitHub repository-description copy
- Footer branding

### Intentionally unchanged technical identifiers

The following historical identifiers remain unchanged to avoid breaking integrations:

- GitHub repository slug: `ai-signal-radar`
- Vercel hostname: `ai-signal-radar-demo.vercel.app`
- Existing Make scenario name
- Existing Google Sheets spreadsheet and worksheet names
- Existing API routes and environment-variable names

### Preserved working fixes

- The 380-character Tavily search-query substring remains unchanged.
- The complete visitor question remains available as `business_question`.
- Recommended-step text cleanup remains in `SignalCard.jsx`, preventing doubled numbering such as `1. 1)`.
- Pagination, collapsed/expanded cards, direct answer links, and individual print behavior remain unchanged.
- No Make, Tavily, Google Sheets, webhook, or Vercel API logic was changed by this branding patch.
