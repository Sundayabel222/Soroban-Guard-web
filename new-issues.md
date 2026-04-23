# Soroban Guard Web — New GitHub Issues

> 10 new issues not covered by the existing issues.md

---

## Issue 21

**Title:** Add a scan history page at `/history`

**Labels:** enhancement, complexity:medium

**Body:**
## Description
`lib/history.ts` stores `ContractScanRecord[]` in `localStorage` but there is no dedicated page to browse it. A `/history` route would let users review all past scans, filter by network, and re-run any previous scan.

## What to implement
- File: `app/history/page.tsx` (new) — list all records from `lib/history.ts`, sorted newest first
- Each row: truncated contract/source, network badge, date, High/Medium/Low counts, "Re-scan" button
- Add a "Clear history" button with a confirmation prompt
- Add a link to `/history` in the landing page header nav

## Acceptance criteria
- Page renders all stored records
- "Re-scan" navigates to `/` with the source pre-filled
- "Clear history" removes all records and shows an empty state
- Empty state shown when no history exists

---

## Issue 22

**Title:** Add rate-limit error handling with retry countdown

**Labels:** enhancement, complexity:low

**Body:**
## Description
The core API may return `429 Too Many Requests`. Currently this surfaces as a generic error message. Users should see a clear "Rate limited — retry in Xs" countdown instead.

## What to implement
- File: `lib/api.ts` — detect `429` status and parse the `Retry-After` header (seconds)
- File: `app/page.tsx` — when `ApiError.status === 429`, show a countdown timer that auto-retries when it reaches zero
- File: `components/ScanInput.tsx` — disable the scan button during the countdown

## Acceptance criteria
- `429` response shows "Rate limited — retry in Xs" with a live countdown
- Button re-enables and auto-submits when countdown reaches zero
- Other error codes still show the generic error message

---

## Issue 23

**Title:** Add a `WalletContext` provider to share wallet state across pages

**Labels:** enhancement, complexity:medium

**Body:**
## Description
Wallet state (`publicKey`, `network`) is currently local to `app/page.tsx`. As more pages need wallet context (history, results), it should be lifted into a React context provider.

## What to implement
- File: `lib/WalletContext.tsx` (new) — `WalletProvider` wrapping `app/layout.tsx`, exposing `{ publicKey, network, connect, disconnect }`
- File: `app/layout.tsx` — wrap children with `<WalletProvider>`
- File: `app/page.tsx` — replace local wallet state with `useWallet()` hook
- File: `components/WalletConnect.tsx` — consume `useWallet()` instead of accepting props

## Acceptance criteria
- `useWallet()` returns consistent state on both `/` and `/results`
- Connecting on one page persists to all pages without re-connecting
- Context resets on disconnect

---

## Issue 24

**Title:** Add a `ContractIdBadge` component for truncated C-address display

**Labels:** enhancement, complexity:low

**Body:**
## Description
Contract IDs (C-addresses, 56 chars) appear in multiple places — scan history, results header, wallet panel. A reusable `ContractIdBadge` component with copy-on-click and truncation would reduce duplication.

## What to implement
- File: `components/ContractIdBadge.tsx` (new) — displays `CABC…XYZ` (first 6 + last 4), copies full ID on click, shows "Copied!" flash
- Use it in: `app/history/page.tsx`, `app/results/page.tsx` (when source is a contract ID), `components/WalletConnect.tsx`

## Acceptance criteria
- Truncated address shown by default
- Clicking copies the full C-address to clipboard
- "Copied!" flash disappears after 1.5 seconds
- Full address shown in `title` attribute for hover

---

## Issue 25

**Title:** Add a `ScanDuration` timer to show how long the scan took

**Labels:** enhancement, complexity:low

**Body:**
## Description
Users have no feedback on scan performance. Showing "Scanned in 1.2s" on the results page gives useful context and builds trust.

## What to implement
- File: `app/page.tsx` — record `Date.now()` before calling `scanContract` and after; store duration in `sessionStorage` alongside findings
- File: `app/results/page.tsx` — read duration and display "Scanned in X.Xs" in the results header next to the finding count

## Acceptance criteria
- Duration shown to one decimal place (e.g. "1.2s")
- Duration not shown if not available (e.g. navigated directly to `/results`)
- Duration resets on each new scan

---

## Issue 26

**Title:** Add a `robots.txt` and `sitemap.xml` for SEO

**Labels:** chore, complexity:low

**Body:**
## Description
The app has no `robots.txt` or `sitemap.xml`. Adding them improves discoverability and prevents search engines from indexing the `/results` page (which contains ephemeral data).

## What to implement
- File: `app/robots.txt/route.ts` (new) — Next.js route handler returning a `robots.txt` that disallows `/results`
- File: `app/sitemap.ts` (new) — Next.js sitemap returning `[{ url: '/', changeFrequency: 'weekly', priority: 1 }]`

## Acceptance criteria
- `GET /robots.txt` returns valid robots.txt with `Disallow: /results`
- `GET /sitemap.xml` returns valid XML with the landing page URL
- Both work in production build (`npm run build`)

---

## Issue 27

**Title:** Add a `SECURITY.md` with responsible disclosure policy

**Labels:** documentation, complexity:low

**Body:**
## Description
The repo has no security policy. GitHub shows a "Report a vulnerability" prompt but there is no `SECURITY.md` to guide reporters.

## What to implement
- File: `SECURITY.md` (new) — responsible disclosure policy covering:
  - Supported versions
  - How to report a vulnerability (email or GitHub private advisory)
  - Response timeline (acknowledge within 48h, patch within 14 days)
  - Out-of-scope items (third-party dependencies, Stellar network itself)

## Acceptance criteria
- `SECURITY.md` exists at repo root
- Contains a clear contact method for reporting
- Follows the [GitHub recommended format](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository)

---

## Issue 28

**Title:** Add `OpenGraph` and `Twitter` card meta tags to the results page

**Labels:** enhancement, complexity:low

**Body:**
## Description
The root `layout.tsx` has basic OpenGraph metadata but the `/results` page has none. When a shared results URL is pasted into Slack or Twitter, it should show a meaningful preview.

## What to implement
- File: `app/results/page.tsx` — add dynamic `generateMetadata` export that sets:
  - `og:title`: "Soroban Guard — X findings detected"
  - `og:description`: breakdown of High/Medium/Low counts
  - `twitter:card`: "summary"
- Only set dynamic metadata when findings are decoded from the `?r=` query param (Issue 18)

## Acceptance criteria
- Shared `/results?r=...` URL shows finding count in link preview
- Falls back to generic metadata when no `?r=` param is present
- No hydration errors

---

## Issue 29

**Title:** Add a `ContractIdInput` auto-formatter that strips whitespace and normalizes case

**Labels:** enhancement, complexity:low

**Body:**
## Description
Users sometimes paste contract IDs with leading/trailing whitespace or in lowercase. The Contract ID tab should silently normalize input so validation doesn't fail on trivial formatting issues.

## What to implement
- File: `components/ScanInput.tsx` — in the `contractId` `onChange` handler, apply `.trim().toUpperCase()` before setting state
- Show a subtle "Normalized" indicator for 1 second when the input was changed by normalization

## Acceptance criteria
- Pasting `  cabc...xyz  ` normalizes to `CABC...XYZ`
- Normalization indicator appears briefly then fades
- Normalized value is what gets submitted to the API

---

## Issue 30

**Title:** Add a `ConfirmClearHistory` modal component

**Labels:** enhancement, complexity:low

**Body:**
## Description
The "Clear history" button on `/history` (Issue 21) should require confirmation before deleting all records. A reusable modal component would also serve future destructive actions.

## What to implement
- File: `components/ConfirmModal.tsx` (new) — accessible modal with `title`, `description`, `confirmLabel`, `onConfirm`, `onCancel` props
  - Traps focus inside the modal
  - Closes on `Escape` key
  - Backdrop click cancels
- File: `app/history/page.tsx` — use `<ConfirmModal>` for the clear history action

## Acceptance criteria
- Modal is keyboard accessible (focus trap, Escape to close)
- Confirm button triggers the action; Cancel/backdrop dismisses without action
- Modal renders in a portal (`document.body`) to avoid z-index issues
- ARIA: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the title
