# Prodily Frontend — Complete Engineering Handover

> **Purpose:** This document provides a comprehensive, page-by-page and feature-by-feature blueprint for implementing the complete UI/UX of the Prodily frontend. Any engineer working from this document should be able to implement the entire frontend without needing to reverse-engineer the backend.

---

## Table of Contents

1. [Tech Stack & Project Setup](#1-tech-stack--project-setup)
2. [Backend Base URL & Auth](#2-backend-base-url--auth)
3. [Current Frontend Page Structure](#3-current-frontend-page-structure)
4. [Design System & Tokens](#4-design-system--tokens)
5. [Authentication & Session Management](#5-authentication--session-management)
6. [Admin Dashboard — /admin](#6-admin-dashboard--admin)
7. [Employee Dashboard — /employee](#7-employee-dashboard--employee)
8. [Team Lead Dashboard — /team-lead](#8-team-lead-dashboard--team-lead)
9. [Tasks Module](#9-tasks-module)
10. [Wallet & Finance Module](#10-wallet--finance-module)
11. [Challenges & Rewards Module](#11-challenges--rewards-module)
12. [Time Tracking Module](#12-time-tracking-module)
13. [Transactions Module](#13-transactions-module)
14. [Leaderboard Module](#14-leaderboard-module)
15. [Onboarding & Auth Pages](#15-onboarding--auth-pages)
16. [Shared Components](#16-shared-components)
17. [Server Actions Reference](#17-server-actions-reference)
18. [Navigation & Routing Structure](#18-navigation--routing-structure)
19. [API Endpoint Quick Reference](#19-api-endpoint-quick-reference)

---

## 1. Tech Stack & Project Setup

| Concern | Choice |
| :--- | :--- |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS (no Tailwind, CSS vars for tokens) |
| Component library | None — hand-built with Lucide React for icons |
| State | React useState / useEffect / startTransition |
| Data fetching | Next.js Server Actions ("use server") |
| Auth storage | cookies() — session_token key |
| Toasts | Custom useToast hook in @/components/Toast |

**Run Dev Server:**
```bash
cd prodily-fe
pnpm run dev   # runs on http://localhost:3000
```

**Backend URL:** The backend runs on `http://127.0.0.1:3001/api/v1` (configured via `NEXT_PUBLIC_BACKEND_URL` in `.env.local`).

---

## 2. Backend Base URL & Auth

All API calls require a Bearer token passed in the Authorization header.

```
Authorization: Bearer <session_token>
```

The `session_token` is a JWT obtained after signing in or after verifying the OTP during registration. It is stored as a cookie named `session_token`.

**Token payload contains:**
- `id` — User UUID
- `email`
- `role` — `ADMIN | TEAM_LEAD | TEAM_MEMBER`
- `organizationId`
- `teamId` (may be null for ADMINs)

---

## 3. Current Frontend Page Structure

```
src/app/
├── page.tsx                  # Root redirect (-> /signin)
├── layout.tsx                # Root layout with Toast provider
├── globals.css               # CSS variables / design tokens
├── signin/page.tsx           # Sign-in page (DONE)
├── signup/page.tsx           # Org registration + OTP verification (DONE)
├── register/page.tsx         # Employee invite registration (DONE)
├── admin/page.tsx            # Admin dashboard (PARTIAL)
├── employee/page.tsx         # Employee dashboard (PARTIAL)
└── actions/
    ├── auth.ts               # Auth server actions (DONE)
    ├── onboarding.ts         # Team CRUD + invite actions (DONE)
    ├── tasks.ts              # Task actions (PARTIAL)
    └── wallet.ts             # Wallet actions (PARTIAL)
```

**Pages that need to be created:**
- `/team-lead` — Team Lead dashboard
- `/admin/transactions` — Admin transaction ledger
- `/admin/fraud-alerts` — Fraud alert management
- `/admin/budget` — Budget utilization report
- `/admin/approval-workflows` — Workflow rules configuration
- `/employee/tasks` — My tasks list
- `/employee/time-tracking` — Clock in/out and time log
- `/employee/challenges` — Active challenges
- `/employee/leaderboard` — Weekly leaderboard
- `/employee/wallet` — My wallet and redemption
- `/employee/transactions` — My transaction history

---

## 4. Design System & Tokens

All tokens are defined as CSS variables in `globals.css`. Use them across the entire app.

```css
/* Core colors */
--indigo:        #4F46E5
--indigo-600:    #4338CA
--indigo-tint:   #EEF2FF
--indigo-700:    #3730A3
--violet:        #7C3AED
--violet-tint:   #F5F3FF
--mint:          #10B981
--mint-tint:     #ECFDF5
--rose:          #EF4444
--rose-tint:     #FEF2F2

/* Neutral surface */
--ink:           #111827   /* primary text */
--muted:         #6B7280   /* secondary text */
--faint:         #9CA3AF   /* placeholder */
--text:          #374151
--surface-2:     #F9FAFB
--line:          #E5E7EB   /* borders */

/* Shadows */
--sh:            0 20px 60px rgba(0,0,0,0.08)
--sh-sm:         0 4px 16px rgba(0,0,0,0.05)
--sh-indigo:     0 8px 24px rgba(79,70,229,0.20)

/* Typography */
font-display: "DM Sans"   (extrabold headings)
font-body: "Inter"        (body / UI text)
```

**Icon Library:** `lucide-react`

**Utility classes in globals.css:**
- `animate-fade-in` — opacity 0 to 1 on mount
- `animate-spin` — 360deg continuous rotation (loaders)

---

## 5. Authentication & Session Management

### Session Flow
1. User signs in → `POST /onboarding/signin` → receives `token` in response.
2. Token is stored as a cookie `session_token`.
3. Subsequent server actions read the token from cookies via `cookies().get("session_token")`.
4. On sign-out, the cookie is cleared.

### Role-Based Routing
After sign-in, redirect user based on `role`:
- `ADMIN` → `/admin`
- `TEAM_LEAD` → `/team-lead`
- `TEAM_MEMBER` → `/employee`

### Existing Server Actions (src/app/actions/auth.ts)

| Action | Endpoint | Description |
| :--- | :--- | :--- |
| `signUpAction` | POST /onboarding/organization/signup | Registers new org. Returns `{ status: "pending_otp" }` |
| `verifyOtpAction` | POST /onboarding/organization/verify-otp | Verifies OTP, returns JWT, stores cookie |
| `signInAction` | POST /onboarding/signin | Signs in existing user, stores JWT cookie |
| `signOutAction` | — | Clears session_token cookie |
| `getMeAction` | GET /onboarding/me | Returns user profile |
| `getOrgWalletAction(orgId)` | GET /wallet/org/:orgId | Org wallet balance |
| `registerAction` | POST /onboarding/register | Completes registration via invitation token |

---

## 6. Admin Dashboard — /admin

**Status:** Partially implemented. Major sections still needed.

### 6.1 Currently Implemented
- Org Wallet balance KPI card
- Teams count KPI card
- Invitations Issued KPI card
- Create Team form (POST /onboarding/team)
- Teams list with View Members modal, Edit modal, Delete action
- Invite Employee form (POST /onboarding/invite)
- Generated invite links table

### 6.2 Needs Implementation: Wallet Management Panel

**Fund Team Wallet** — Transfer budget from org wallet to a team sub-wallet.

```
Endpoint: POST /wallet/team/fund
Body: { teamId: string, amount: number }
Permission: ADMIN only
```

UI: A form with team selector dropdown, amount input (NGN), submit button "Fund Team Wallet". On success, refresh org wallet balance and team wallet balance.

**List Team Wallets** — Show all team wallets with balances.

```
Endpoint: GET /wallet/teams
Permission: ADMIN only
```

UI: Table/card list showing team name, balance (NGN), and "Fund" quick-action button per row.

**Fund Org Wallet (simulation)**

```
Endpoint: POST /wallet/fund
Body: { organizationId: string, amount: number }
```

**Budget Utilization Report** — Full hierarchical breakdown.

```
Endpoint: GET /wallet/budget-utilization
Permission: ADMIN only
```

UI Page `/admin/budget`:
- Org wallet total vs. spent/held
- Per-team breakdown progress bars showing allocated vs. used
- KPI metrics: % utilization, NGN spent this month

### 6.3 Needs Implementation: Fraud Alerts Panel

Page: `/admin/fraud-alerts`

```
Endpoint: GET /wallet/fraud-alerts       (list all)
Endpoint: POST /wallet/fraud-alerts/:id/resolve   (resolve one)
  Body: { status: "RESOLVED" | "DISMISSED" }
Permission: ADMIN only
```

UI:
- Table columns: Triggered At, User, Alert Type, Amount, Description, Status, Actions
- Pending alerts: "Resolve" button (green) and "Dismiss" button (grey)
- Resolved/Dismissed: status badge only (no actions)
- Filter bar: status dropdown (All / Pending / Resolved / Dismissed)

### 6.4 Needs Implementation: Approval Workflow Rules

Page: `/admin/approval-workflows`

The approval workflow determines what sign-off chain is required before a reward or support disbursement is approved, based on category and amount range.

**Default Workflow (hardcoded fallback in backend service):**

| Amount | Required Approvals |
| :--- | :--- |
| <= ₦5,000 | Auto-approved (no action needed) |
| ₦5,001 – ₦20,000 | Team Lead must approve |
| > ₦20,000 | Team Lead then Admin |

**Custom Rule fields:**
```
category: RewardCategory
  (EMERGENCY_SUPPORT | PERFORMANCE | ATTENDANCE | ALL | INNOVATION | SPRINT_COMPLETION)
minAmount: number
maxAmount: number
stages: string[]   (e.g. ["TEAM_LEAD", "ADMIN"])
isActive: boolean
```

Note: A backend GET endpoint for listing custom rules does not currently exist. Either add `GET /workflow-rules` on the backend or hardcode the defaults display and allow creation only.

UI:
- Show the default workflow thresholds as read-only info cards
- List custom rules in a table (create a GET endpoint if needed)
- "Create Rule" button opens a modal with the fields above
- Toggle rule active/inactive

### 6.5 Needs Implementation: Emergency Support Disbursement

```
Endpoint: POST /wallet/emergency-support
Body: { recipientId: string, category: string }
Permission: ADMIN or TEAM_LEAD
```

UI — "Emergency Support" panel in Admin/Team Lead dashboards:
- Search for an employee by email
- Category dropdown (EMERGENCY_SUPPORT, PERFORMANCE, etc.)
- Submit button "Disburse Support"
- Note: This flows through the approval workflow — may not disburse immediately

### 6.6 Needs Implementation: Pending Requests (Approve/Reject)

Reward requests created by the approval workflow appear in a queue for the current approver stage.

```
Endpoint: POST /wallet/approve-request/:requestId
Endpoint: POST /wallet/reject-request/:requestId
  Body: { reason: string }
Permission: ADMIN or TEAM_LEAD (depends on the workflow stage)
```

UI — "Pending Approvals" section:
- Card or table listing pending requests
- Each row: Requester, Amount, Category, Reason, Created At, Actions
- "Approve" button (green) / "Reject" button (red — opens reason textarea modal)
- Show approval chain stages with current stage highlighted

### 6.7 Needs Implementation: Transactions Ledger

Page: `/admin/transactions`

```
Endpoint: GET /transactions/admin/all
Query params: status, userId, page, limit
Permission: ADMIN only
```

UI:
- Paginated table of all transactions
- Columns: Date, User, Type, Amount, Status, Description
- Filter: status dropdown, user search input
- Click row opens Transaction Detail modal via GET /transactions/admin/:id

---

## 7. Employee Dashboard — /employee

**Status:** Exists but needs significant expansion.

### 7.1 Wallet Widget

```
Endpoint: GET /wallet/user
```

UI card showing:
- Bonus Points balance (medal icon)
- NGN Cash balance
- "Redeem Points" button
- "Request Withdrawal" button

### 7.2 My Tasks Summary

```
Endpoint: GET /tasks/my-tasks
Query: status, page, limit
```

UI:
- Count cards: Pending / In Progress / Completed / Approved
- "View All Tasks" link → /employee/tasks

### 7.3 Active Challenges Banner

```
Endpoint: GET /challenges/active
```

UI:
- Horizontal scroll carousel of challenge cards
- Each card: name, category badge, deadline countdown, reward points, progress bar
- "Claim" button for attendance challenges (when hours threshold met)

### 7.4 Time Tracker Widget

Quick clock-in/out button (details in Section 12)

---

## 8. Team Lead Dashboard — /team-lead

**Status:** Page does not exist. Must be created from scratch.

Layout: Similar to admin but scoped to the team lead's team only.

### Sections to implement:

**My Team's Wallet**
```
Endpoint: GET /wallet/team/:teamId
Permission: TEAM_LEAD
```

**Fund Team Wallet (External — simulates receiving external money)**
```
Endpoint: POST /wallet/team/:teamId/fund-external
Body: { amount: number }
Permission: TEAM_LEAD
```

**My Team's Members**
```
Endpoint: GET /teams/:id   (returns team with users array)
```

**Team Tasks for Review**
```
Endpoint: GET /tasks/review
Query: status (default "COMPLETED"), page, limit
Permission: TEAM_LEAD
```

**Team Time Entries**
```
Endpoint: GET /time-tracking/team-entries
Permission: TEAM_LEAD
```

**Emergency Support Disbursement**
```
Endpoint: POST /wallet/emergency-support
Body: { recipientId, category }
```

**Pending Approval Queue**
```
Endpoint: POST /wallet/approve-request/:id
Endpoint: POST /wallet/reject-request/:id
```

---

## 9. Tasks Module

### 9.1 Employee — My Tasks (/employee/tasks)

**List tasks:**
```
Endpoint: GET /tasks/my-tasks
Query: status (PENDING|IN_PROGRESS|COMPLETED|APPROVED|REJECTED), page, limit
```

**Create task:**
```
Endpoint: POST /tasks
Body: {
  title: string,
  description?: string,
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  dueDate?: string (ISO),
  challengeId?: string (link task to active challenge for automatic reward)
}
```

**Complete task:**
```
Endpoint: POST /tasks/:id/complete
```

**Update task:**
```
Endpoint: PATCH /tasks/:id
Body: (same as create, all fields optional)
```

**Delete task:**
```
Endpoint: DELETE /tasks/:id
```

**View single task:**
```
Endpoint: GET /tasks/:id
```

UI for /employee/tasks:
- Kanban board OR tabbed list (Pending / Completed / Approved)
- Task card: title, priority badge, due date, status badge, "Mark Complete" CTA
- "New Task" button opens a modal with create form
- Challenge selector dropdown in create form (fetch from GET /challenges/active)

### 9.2 Admin/Team Lead — Task Review Queue

```
Endpoint: GET /tasks/review
Query: status (default "COMPLETED"), page, limit
Permission: ADMIN | TEAM_LEAD
```

UI (within Admin or Team Lead dashboard):
- List of completed tasks pending approval
- Row: Employee name, task title, completion date, linked challenge badge
- "Approve" (green) / "Reject" (red with reason input) action buttons
- Approving a task linked to a challenge automatically disburses challenge reward points to the employee

**Approve endpoint:**
```
POST /tasks/:id/approve
```

**Reject endpoint:**
```
POST /tasks/:id/reject
Body: { reason: string }
```

### 9.3 Admin — All Tasks View

```
Endpoint: GET /tasks
Permission: ADMIN only
Query: status, startDate, endDate, page, limit
```

UI at /admin/tasks:
- Full table with all tasks across all teams
- Filter bar: status dropdown, date range picker, search
- Click row opens Task Detail side panel
- "View by Team" button → GET /tasks/team/:teamId

---

## 10. Wallet & Finance Module

### 10.1 Employee Wallet Page (/employee/wallet)

**Fetch wallet:**
```
Endpoint: GET /wallet/user
Response shape: {
  id, balance, bonusPoints, currency,
  bankCode?, accountNumber?, bankName?
}
```

UI sections:
- Balance card (NGN cash + bonus points)
- Bank Profile Setup form (shown if bankCode/accountNumber missing)
- Redeem Points form
- Withdrawal request form
- Transaction history widget (see Section 13)

**Update bank profile:**
```
Endpoint: POST /wallet/bank-profile
Body: { bankCode: string, accountNumber: string }
```

**List supported banks (for bank selector dropdown):**
```
Endpoint: GET /wallet/banks
Response: [{ code: string, name: string }]
```

**Request withdrawal:**
```
Endpoint: POST /wallet/withdraw
Body: { amount: number }
Note: User must have bank profile set up first.
```

**Redeem bonus points:**
```
Endpoint: POST /wallet/redeem-points
Body: {
  amount: number,
  type: "CASH" | "AIRTIME" | "DATA",
  phoneNumber?: string,   (for AIRTIME / DATA)
  provider?: string,      (MTN, Airtel, Glo, 9mobile)
  dataCode?: string       (specific data bundle code)
}
```

Redemption UI flow:
1. "Redeem Points" button opens modal
2. Amount input, Type selector (Cash / Airtime / Data)
3. If Airtime/Data: phone number and provider fields appear
4. Submit → show success / "pending approval" message

### 10.2 Admin Budget Utilization (/admin/budget)

```
Endpoint: GET /wallet/budget-utilization
Permission: ADMIN only
Response shape: {
  organization: { totalBudget, spentBudget, heldBudget, availableBalance },
  teams: [{ teamId, teamName, budget, spent, held, available }]
}
```

UI:
- Top KPI bar: Total / Spent / Held / Available
- Per-team horizontal progress bars
- Color coding: green (healthy), amber (>60% used), red (>85% used)
- "Fund Team" quick-action button on each team row

---

## 11. Challenges & Rewards Module

### 11.1 Active Challenges (/employee/challenges)

```
Endpoint: GET /challenges/active
Response shape: [{
  id, name, category, description,
  startDate, endDate, rewardPoints,
  totalBudget, remainingBudget,
  metadata: { targetHours?, maxWinners? }
}]
```

**Challenge category display names:**

| Enum Value | Display Name |
| :--- | :--- |
| ATTENDANCE | Monthly Attendance |
| SPRINT_COMPLETION | Sprint Completion |
| INNOVATION | Innovation Challenge |
| LAUNCH | Launch Challenge |

UI:
- Grid of challenge cards
- Card: name, category badge (color-coded), countdown timer, reward points, progress bar
- "Claim Reward" button on ATTENDANCE challenges when eligible:
  ```
  Endpoint: POST /challenges/:id/claim-attendance
  ```
- Claimed challenges show a success state

### 11.2 Create Challenge (Admin/Team Lead)

From Admin/Team Lead dashboard panel:

```
Endpoint: POST /challenges
Permission: ADMIN | TEAM_LEAD
Body: {
  name: string,
  category: "ATTENDANCE" | "SPRINT_COMPLETION" | "INNOVATION" | "LAUNCH",
  teamIds: string[],          (which teams this applies to)
  startDate: string (ISO),
  endDate: string (ISO),
  rewardPoints: number,
  totalBudget: number,        (NGN budget held on creation)
  metadata?: {
    targetHours?: number,     (for ATTENDANCE challenges, default is 40h)
    maxWinners?: number
  }
}
```

UI — "Create Challenge" modal:
- Challenge name input
- Category dropdown
- Team multi-select (fetch from GET /teams)
- Date range picker (start + end)
- Reward Points input
- NGN Budget input (budget is held from org/team wallet on creation)
- Target Hours input (shows when category = ATTENDANCE)
- Max Winners input (optional)

### 11.3 Dashboard Analytics

```
Endpoint: GET /challenges/dashboard-analytics
Response shape: {
  kpis: { engagementScore, rewardsCount, ngnSpent, retentionRate },
  departmentPerformance: [{ teamName, spent }],
  rewardDistribution: { performance: %, wellness: %, innovation: % },
  topPerformers: [{ userId, firstName, lastName, points, rank }]
}
```

UI — Dashboard Analytics section:
- KPI strip (4 cards)
- Department performance horizontal bar chart
- Reward distribution donut chart (conic-gradient CSS)
- Top Performers leaderboard table

---

## 12. Time Tracking Module

### 12.1 Clock Widget (/employee/time-tracking)

**Clock actions:**
```
Endpoint: POST /time-tracking/clock
Body: { action: "CLOCK_IN" | "PAUSE" | "RESUME" | "CLOCK_OUT" }
```

**State machine:**
- CLOCK_IN → starts new session
- PAUSE → pauses active session timer
- RESUME → resumes paused session
- CLOCK_OUT → closes session, automatically creates a TimeEntry record

UI — Live Timer widget:
- Large digital clock showing elapsed time (HH:MM:SS)
- Status badge: CLOCKED IN / PAUSED / CLOCKED OUT
- Contextual action buttons:
  - No session: "Clock In" (green)
  - Clocked in: "Pause" (amber) + "Clock Out" (red)
  - Paused: "Resume" (green) + "Clock Out" (red)
- On clock out: show session summary card (duration, date)

### 12.2 Manual Time Log

```
Endpoint: POST /time-tracking/log-manual
Body: {
  taskId?: string,
  date: string (ISO date),
  durationHours: number,
  description?: string,
  startTime?: string (HH:MM),
  endTime?: string (HH:MM)
}
```

UI — "Log Hours" form:
- Date picker
- Duration input (hours, e.g. 2.5)
- Optional task selector dropdown (from my-tasks)
- Description textarea
- Optional start/end time pickers
- Submit → success toast

### 12.3 My Time Entries

```
Endpoint: GET /time-tracking/my-entries
Response: [{
  id, date, durationHours, description,
  startTime?, endTime?,
  task?: { id, title }
}]
```

UI — Time entries table:
- Columns: Date, Task, Duration, Description, Source (CLOCK / MANUAL)
- Summary row: total hours logged this week and this month
- Optional export button

### 12.4 Team Entries (Team Lead/Admin)

```
Endpoint: GET /time-tracking/team-entries
Permission: TEAM_LEAD | ADMIN
```

UI:
- Grouped by employee
- Each employee row shows total hours for the period
- Expandable to show individual daily entries

---

## 13. Transactions Module

### 13.1 My Transactions (/employee/transactions)

```
Endpoint: GET /transactions
Query: status (PENDING|COMPLETED|FAILED), page, limit
```

UI:
- Paginated timeline list
- Each entry: icon (type-based), description, amount, date, status badge
- Filter tabs: All / Pending / Completed / Failed
- Click item → Transaction Detail modal via GET /transactions/:id

### 13.2 Admin — All Transactions (/admin/transactions)

```
Endpoint: GET /transactions/admin/all
Query: status, userId, page, limit
Permission: ADMIN only
```

UI:
- Full table with all system-wide transactions
- Columns: Date, User, Type, Amount (NGN/Points), Status, Transaction ID
- Filter bar: status dropdown, user email search
- Click row → Detail drawer via GET /transactions/admin/:id

---

## 14. Leaderboard Module

### 14.1 Weekly Leaderboard (/employee/leaderboard)

```
Endpoint: GET /challenges/weekly-leaderboard
Response: [{
  rank: number,
  userId: string,
  firstName: string,
  lastName: string,
  points: number,
  teamName?: string
}]
```

UI:
- Podium for top 3 (visually prominent with initials avatars)
- Full ranked list for positions 4 to N
- Current user's position highlighted
- Points as formatted number (e.g. "12,500 pts")
- Auto-refresh every 60 seconds or manual refresh button

---

## 15. Onboarding & Auth Pages

### 15.1 Org Registration (/signup) — DONE

Multi-step flow:
1. Step 1: Registration form (org name, firstName, lastName, email, password)
2. Step 2: OTP entry (6-digit code sent to email)

After OTP verification → auto-sign-in → redirect to /admin.

### 15.2 Employee Registration (/register) — DONE

Accessed via invitation link: `/register?token=<invite_token>`

Token is decoded client-side. It is a 2-part HMAC-SHA256 format: `base64payload.signature`. Decode by splitting on `.` and base64-decoding `parts[0]`. The payload contains `email`, `role`, and `expiresAt`.

After successful registration → redirect to /signin.

### 15.3 Sign In (/signin) — DONE

```
Endpoint: POST /onboarding/signin
Body: { email: string, password: string }
Response: { user: { id, role, ... }, token: string }
```

After login → cookie set → redirect based on role.

### 15.4 Sign Out

Clear session_token cookie and redirect to /signin. Implement a sign-out button in the persistent sidebar/navbar.

---

## 16. Shared Components

### 16.1 AppShell / Persistent Layout

The root layout currently only wraps the Toast provider. Extend it to include:

- **Sidebar** (for authenticated pages): Logo, navigation links, user profile, sign-out button
- **Top bar**: Page title, user avatar dropdown
- **Role-based navigation items:**

| Role | Navigation Items |
| :--- | :--- |
| ADMIN | Dashboard, Teams, Tasks, Challenges, Transactions, Budget, Fraud Alerts, Workflow Rules |
| TEAM_LEAD | Dashboard, My Team, Tasks Review, Time Entries, Challenges, Wallet |
| TEAM_MEMBER | Dashboard, My Tasks, Challenges, Leaderboard, Time Tracker, Wallet, Transactions |

The current pages do NOT have a persistent sidebar. This is the most critical shared component to build first.

### 16.2 Toast — EXISTS at @/components/Toast

```tsx
const { celebrate, toast } = useToast();
celebrate("Success message!")   // green celebration toast
toast("Error message")          // neutral/error toast
```

### 16.3 Modal Component (reusable)

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}
```

Use `fixed inset-0` backdrop with `backdrop-blur-sm`, z-50, centered card with `rounded-[32px]`.

### 16.4 Status Badge Component

```tsx
interface BadgeProps {
  status: "PENDING" | "COMPLETED" | "APPROVED" | "REJECTED" | "FAILED" | "ACTIVE";
}
```

Color mappings:
- PENDING → amber
- COMPLETED → indigo
- APPROVED → mint/green
- REJECTED / FAILED → rose/red
- ACTIVE → violet

### 16.5 Pagination Component

Accepts `page`, `total`, `limit` props. Use `?page=N` query parameters.

### 16.6 Loading Spinner

```tsx
<span className="w-6 h-6 border-2 border-[var(--indigo)]/30 border-t-[var(--indigo)] rounded-full animate-spin" />
```

---

## 17. Server Actions Reference

All server actions live in `src/app/actions/`. They are "use server" files wrapping fetch calls with the session token from cookies.

### auth.ts (EXISTS)

| Function | Endpoint |
| :--- | :--- |
| signUpAction | POST /onboarding/organization/signup |
| verifyOtpAction | POST /onboarding/organization/verify-otp |
| signInAction | POST /onboarding/signin |
| signOutAction | (clears cookie) |
| getMeAction | GET /onboarding/me |
| getOrgWalletAction(orgId) | GET /wallet/org/:orgId |
| registerAction | POST /onboarding/register |

### onboarding.ts (EXISTS)

| Function | Endpoint |
| :--- | :--- |
| createTeamAction | POST /onboarding/team |
| inviteUserAction | POST /onboarding/invite |
| getTeamsAction | GET /teams |
| getTeamDetailsAction | GET /teams/:teamId |
| updateTeamAction | PATCH /teams/:teamId |
| deleteTeamAction | DELETE /teams/:teamId |
| addTeamMemberAction | POST /teams/:teamId/members |

### tasks.ts (PARTIAL)

| Function | Endpoint | Status |
| :--- | :--- | :--- |
| createTaskAction | POST /tasks | DONE |
| getMyTasksAction | GET /tasks/my-tasks | DONE |
| completeTaskAction | POST /tasks/:id/complete | DONE |
| updateTaskAction | PATCH /tasks/:id | TODO |
| deleteTaskAction | DELETE /tasks/:id | TODO |
| getTasksForReviewAction | GET /tasks/review | TODO |
| approveTaskAction | POST /tasks/:id/approve | TODO |
| rejectTaskAction | POST /tasks/:id/reject | TODO |
| getTeamTasksAction | GET /tasks/team/:teamId | TODO |
| getAllTasksAction | GET /tasks | TODO |

### wallet.ts (PARTIAL)

| Function | Endpoint | Status |
| :--- | :--- | :--- |
| getUserWalletAction | GET /wallet/user | DONE |
| getOrgWalletAction | GET /wallet/org/:orgId | DONE |
| listTeamWalletsAction | GET /wallet/teams | DONE |
| getTeamWalletAction | GET /wallet/team/:teamId | DONE |
| fundTeamWalletAction | POST /wallet/team/fund | TODO |
| fundTeamWalletExternalAction | POST /wallet/team/:teamId/fund-external | TODO |
| withdrawAction | POST /wallet/withdraw | TODO |
| updateBankProfileAction | POST /wallet/bank-profile | TODO |
| listBanksAction | GET /wallet/banks | TODO |
| redeemPointsAction | POST /wallet/redeem-points | TODO |
| disburseEmergencySupportAction | POST /wallet/emergency-support | TODO |
| approveRewardRequestAction | POST /wallet/approve-request/:id | TODO |
| rejectRewardRequestAction | POST /wallet/reject-request/:id | TODO |
| getBudgetUtilizationAction | GET /wallet/budget-utilization | TODO |
| getFraudAlertsAction | GET /wallet/fraud-alerts | TODO |
| resolveFraudAlertAction | POST /wallet/fraud-alerts/:id/resolve | TODO |

### challenges.ts — MUST CREATE

| Function | Endpoint |
| :--- | :--- |
| getActiveChallengesAction | GET /challenges/active |
| createChallengeAction | POST /challenges |
| claimAttendanceRewardAction(id) | POST /challenges/:id/claim-attendance |
| getDashboardAnalyticsAction | GET /challenges/dashboard-analytics |
| getWeeklyLeaderboardAction | GET /challenges/weekly-leaderboard |
| clockAction(action) | POST /time-tracking/clock |
| logManualTimeAction | POST /time-tracking/log-manual |
| getMyTimeEntriesAction | GET /time-tracking/my-entries |
| getTeamTimeEntriesAction | GET /time-tracking/team-entries |

### transactions.ts — MUST CREATE

| Function | Endpoint |
| :--- | :--- |
| getMyTransactionsAction | GET /transactions |
| getMyTransactionAction(id) | GET /transactions/:id |
| getAllTransactionsAdminAction | GET /transactions/admin/all |
| getTransactionAdminAction(id) | GET /transactions/admin/:id |

---

## 18. Navigation & Routing Structure

```
/                           -> redirect based on auth cookie
├── /signin                 -> public
├── /signup                 -> public
├── /register               -> public (requires ?token query param)
│
├── /admin                  -> ADMIN only
│   ├── /admin/budget       -> Budget utilization report
│   ├── /admin/transactions -> All transactions ledger
│   ├── /admin/fraud-alerts -> Fraud alert management
│   └── /admin/approval-workflows -> Workflow rule configuration
│
├── /team-lead              -> TEAM_LEAD only
│   ├── /team-lead/tasks-review  -> Task approval queue
│   └── /team-lead/time-entries  -> Team time log overview
│
└── /employee               -> TEAM_MEMBER only
    ├── /employee/tasks         -> My tasks
    ├── /employee/challenges    -> Active challenges
    ├── /employee/leaderboard   -> Weekly leaderboard
    ├── /employee/time-tracking -> Clock in/out + manual log
    ├── /employee/wallet        -> Wallet, redemption, withdrawal
    └── /employee/transactions  -> Transaction history
```

**Route protection via middleware.ts (create at project root):**

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/signin", "/signup", "/register"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session_token")?.value;
  const { pathname } = req.nextUrl;

  if (!token && !publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
```

---

## 19. API Endpoint Quick Reference

All endpoints are prefixed with `http://127.0.0.1:3001/api/v1`.

### Auth / Onboarding

| Method | Route | Requires Auth | Description |
| :--- | :--- | :--- | :--- |
| POST | /onboarding/organization/signup | No | Register new org + admin |
| POST | /onboarding/organization/verify-otp | No | Verify admin OTP |
| POST | /onboarding/signin | No | Sign in |
| POST | /onboarding/register | No | Accept employee invite |
| GET | /onboarding/me | Yes | Get current user profile |
| POST | /onboarding/team | Yes (ADMIN) | Create team + wallet |
| POST | /onboarding/invite | Yes (ADMIN/TL) | Generate invite link |

### Teams

| Method | Route | Requires Auth | Description |
| :--- | :--- | :--- | :--- |
| GET | /teams | Yes | List all org teams |
| GET | /teams/:id | Yes | Get team details and members |
| PATCH | /teams/:id | Yes | Update team name/description/size |
| DELETE | /teams/:id | Yes | Delete team (only if 0 members) |
| POST | /teams/:id/members | Yes | Add existing user to team by email |

### Wallet

| Method | Route | Requires Auth | Description |
| :--- | :--- | :--- | :--- |
| GET | /wallet/user | Yes | My wallet (balance + bonusPoints) |
| GET | /wallet/org/:orgId | Yes | Org wallet balance |
| GET | /wallet/teams | Yes (ADMIN) | All team wallets |
| GET | /wallet/team/:teamId | Yes (ADMIN/TL) | Single team wallet |
| POST | /wallet/fund | Yes | Fund org wallet |
| POST | /wallet/team/fund | Yes (ADMIN) | Fund team from org wallet |
| POST | /wallet/team/:teamId/fund-external | Yes (TL) | External fund into team wallet |
| POST | /wallet/withdraw | Yes | Request cash withdrawal |
| POST | /wallet/bank-profile | Yes | Set bank account details |
| GET | /wallet/banks | Yes | List supported banks |
| POST | /wallet/redeem-points | Yes | Redeem bonus points |
| POST | /wallet/emergency-support | Yes (ADMIN/TL) | Disburse emergency support |
| POST | /wallet/approve-request/:id | Yes (ADMIN/TL) | Approve a pending request |
| POST | /wallet/reject-request/:id | Yes (ADMIN/TL) | Reject a pending request |
| GET | /wallet/budget-utilization | Yes (ADMIN) | Full budget utilization report |
| GET | /wallet/fraud-alerts | Yes (ADMIN) | List all fraud alerts |
| POST | /wallet/fraud-alerts/:id/resolve | Yes (ADMIN) | Resolve a fraud alert |

### Tasks

| Method | Route | Requires Auth | Description |
| :--- | :--- | :--- | :--- |
| POST | /tasks | Yes | Create task (assigned to self) |
| GET | /tasks/my-tasks | Yes | My tasks (filterable by status) |
| GET | /tasks/review | Yes (ADMIN/TL) | Tasks awaiting review |
| GET | /tasks | Yes (ADMIN) | All tasks system-wide |
| GET | /tasks/team/:teamId | Yes (ADMIN/TL) | Tasks by team |
| GET | /tasks/user/:userId | Yes (ADMIN/TL) | Tasks by user |
| GET | /tasks/:id | Yes | Single task (ownership checked) |
| PATCH | /tasks/:id | Yes | Update task fields |
| DELETE | /tasks/:id | Yes | Delete task |
| POST | /tasks/:id/complete | Yes | Mark task as COMPLETED |
| POST | /tasks/:id/approve | Yes (ADMIN/TL) | Approve a completed task |
| POST | /tasks/:id/reject | Yes (ADMIN/TL) | Reject a task with reason |

### Challenges & Time Tracking

| Method | Route | Requires Auth | Description |
| :--- | :--- | :--- | :--- |
| POST | /challenges | Yes (ADMIN/TL) | Create a new challenge |
| GET | /challenges/active | Yes | My eligible active challenges |
| GET | /challenges/dashboard-analytics | Yes | Analytics KPIs and charts |
| GET | /challenges/weekly-leaderboard | Yes | Weekly points leaderboard |
| POST | /challenges/:id/claim-attendance | Yes | Claim attendance challenge reward |
| POST | /time-tracking/clock | Yes | Clock in / pause / resume / out |
| POST | /time-tracking/log-manual | Yes | Log manual time entry |
| GET | /time-tracking/my-entries | Yes | My time log entries |
| GET | /time-tracking/team-entries | Yes (ADMIN/TL) | Team-wide time log entries |

### Transactions

| Method | Route | Requires Auth | Description |
| :--- | :--- | :--- | :--- |
| GET | /transactions | Yes | My transactions (paginated) |
| GET | /transactions/:id | Yes | Single transaction |
| GET | /transactions/admin/all | Yes (ADMIN) | All transactions system-wide |
| GET | /transactions/admin/:id | Yes (ADMIN) | Any transaction by ID |
| POST | /transactions/redeem | Yes | Redeem bonus points |

---

## Engineer Notes

1. **Role enforcement:** Backend enforces roles on every endpoint. Frontend should also conditionally hide UI elements based on the user's role from getMeAction().

2. **Approval workflow UX:** Many financial operations (emergency support, large reward disbursements) do NOT immediately complete — they create a RewardRequest in a multi-stage queue. Always handle both immediate success and "pending approval" states in the UI.

3. **Dual currency:** The system has two currencies — bonus points (earned via tasks/challenges) and NGN cash (wallet balance). Points can be redeemed for cash or utilities via the redemption flow.

4. **Wallet vs Transactions:** Use GET /wallet/user for current balances. Use GET /transactions for the history of movements. They are separate concerns.

5. **Monnify:** Bank payouts are processed via Monnify on the backend via webhooks. The frontend does NOT integrate with Monnify directly.

6. **Invitation token format:** The invite token is NOT a JWT. It is a 2-part HMAC-SHA256 token: `base64(payload).hmac_signature`. Decode by splitting on "." and base64-decoding parts[0]. The payload contains email, role, teamId, organizationId, and expiresAt (milliseconds timestamp).

7. **OTP expiry:** OTPs expire server-side. Consider adding a countdown timer and resend button on the OTP screen.

8. **Empty states:** Every list, table, and data section must have a friendly empty state with an illustration or icon and a CTA. Never show blank white boxes.

9. **Error handling:** All server actions return { success: boolean, error?: string }. Always surface the error message to the user via the Toast system.

10. **Pagination:** Default to page=1, limit=10. Build a reusable Pagination component. All list endpoints accept page and limit query params.

11. **No sidebar yet:** The current codebase has no persistent sidebar or navigation shell. This is the most critical infrastructure component to build before implementing individual pages.

12. **Attendance challenge threshold:** The default target for attendance challenges is 40 hours within the challenge date range. The metadata.targetHours field can override this.
