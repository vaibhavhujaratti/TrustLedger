# WIREFRAMES.md — Planning & UI Wireframe Specifications

> **Purpose:** Textual wireframe specifications and layout blueprints for every screen in the Trust-Bound prototype. These serve as the contract between design and development — if a screen is not described here, it does not exist in the prototype scope.

---

## 1. Design System Overview

Trust-Bound's visual identity is built on a metaphor of **vault-like security meets human warmth.** The UI is not cold and corporate — it's a tool built by and for young people who want to feel protected, not intimidated.

Color tokens used throughout all screens:

```css
:root {
  --color-trust-green: #10B981;     /* Escrow locked, milestone approved */
  --color-trust-amber: #F59E0B;     /* Under review, pending action */
  --color-trust-red: #EF4444;       /* Dispute, warning, rejection */
  --color-trust-blue: #3B82F6;      /* Primary actions, links */
  --color-surface: #F9FAFB;         /* Page backgrounds */
  --color-card: #FFFFFF;            /* Card backgrounds */
  --color-border: #E5E7EB;          /* Dividers */
  --color-text-primary: #111827;    /* Headlines */
  --color-text-secondary: #6B7280;  /* Labels, captions */
}
```

The font pairing is **Space Grotesk** (headings) for a modern, slightly geometric feel that communicates precision, and **Inter** (body) for maximum readability at small sizes. Every interactive element has a visible focus ring for accessibility.

---

## 2. Screen Inventory

The prototype contains exactly 11 screens:

1. Landing / Marketing Page
2. Sign Up
3. Log In
4. Client Dashboard
5. Freelancer Dashboard
6. Create Project (multi-step wizard)
7. Project Detail View
8. Milestone Review (client view)
9. Milestone Submit (freelancer view)
10. Dispute Chat
11. Invoice Preview

---

## 3. Screen-by-Screen Wireframes

### 3.1 Landing Page

The landing page has a fixed top navigation bar with the Trust-Bound logo on the left and "Log In" / "Get Started" buttons on the right. The hero section occupies the full viewport height with a centered headline ("Get Paid. Every Time."), a one-line subheading, and a single primary CTA button. Below the fold, three feature cards explain the core value props using icons: Escrow Lock, Milestone Contracts, and Dispute Resolution. The page ends with a two-column section showing a before/after comparison: "How freelancers get paid today" vs "How Trust-Bound does it." No footer needed for the prototype.

```
┌─────────────────────────────────────────────────────┐
│  🔒 Trust-Bound          [Log In]  [Get Started →]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│           Get Paid. Every Time.                     │
│    Smart escrow for student freelancers.            │
│                                                     │
│              [ Start Free Now ]                     │
│                                                     │
├────────────┬────────────────┬───────────────────────┤
│ 🔐 Escrow  │ 📋 Milestones  │ ⚖️ Fair Disputes      │
│  Locked    │  Clear Scope   │  No More Ghosting     │
└────────────┴────────────────┴───────────────────────┘
```

### 3.2 Sign Up

A centered card (max-width 440px) on a light surface background. The card contains a radio toggle at the top ("I am a Freelancer / I am a Client") that is visually prominent because selecting the wrong role is a common onboarding mistake to prevent. Fields: Display Name, Email, Password (with strength indicator), UPI Handle (optional, labeled "For simulated payouts"). A single "Create Account" button at the bottom. A link below to Log In for existing users.

### 3.3 Log In

Simpler than Sign Up. Email + Password fields, a "Remember me" checkbox, a "Forgot password?" link (non-functional in prototype — label it "Coming soon"), and the "Log In" button. Below the card, a "Don't have an account? Sign up" link.

### 3.4 Client Dashboard

The dashboard uses a fixed left sidebar (240px wide) with navigation items: Overview, My Projects, Wallet, and Notifications. The main content area has a top header bar showing the user's name, avatar, and a notification bell with unread count.

The Overview page shows four stat cards in a 2x2 grid: Total Locked in Escrow (large number in trust-green), Active Projects, Funds Released This Month, and Projects Completed. Below the stat cards, a "Recent Activity" feed shows the last 5 ledger events with timestamps and descriptions. A "Create New Project" floating action button sits in the bottom-right corner.

```
┌──────────┬────────────────────────────────────────────┐
│          │  Hi, Arjun             🔔 3  [Avatar]      │
│ Overview │                                            │
│ Projects │  ┌──────────┐  ┌──────────┐               │
│ Wallet   │  │ ₹45,000  │  │ 3 Active │               │
│ Notifs   │  │ In Escrow│  │ Projects │               │
│          │  └──────────┘  └──────────┘               │
│          │  ┌──────────┐  ┌──────────┐               │
│          │  │ ₹12,000  │  │ 2 Done   │               │
│          │  │ Released │  │ Projects │               │
│          │  └──────────┘  └──────────┘               │
│          │                                            │
│          │  Recent Activity                           │
│          │  ─────────────────────────────────────    │
│          │  ✅ Milestone 2 approved · 2h ago          │
│          │  💰 Funds released ₹6,000 · 2h ago        │
└──────────┴────────────────────────────────────────────┘
```

### 3.5 Freelancer Dashboard

Same structural layout as the client dashboard. The stat cards show: Wallet Balance (funds received), Active Projects, Pending Milestones (action required), and Total Earned (all time). The activity feed highlights "Milestone approval received" and "Payment received" events. An "Earnings Chart" (simple bar chart by month) appears below the stats.

### 3.6 Create Project Wizard (4 Steps)

This is the most complex screen. A horizontal stepper at the top shows progress through four steps: Describe Project → AI Generates Milestones → Review Contract → Deposit Escrow.

**Step 1 — Describe Project:** Input fields for Project Title, Detailed Description (textarea with a 500 character minimum prompt), Total Budget (number input with INR label), and Project Deadline (date picker). A "Continue →" button at the bottom.

**Step 2 — AI Milestone Generator:** The screen shows a "Generating your milestone plan..." loading state with a subtle animation for 2–3 seconds while the Gemini API is called. Then it displays 3–5 milestone cards, each showing the title, description, percentage, and estimated days. Each card is editable inline — clients can adjust the title, description, and budget percentage (with live validation that the total still equals 100%). An "+ Add Milestone" button allows adding a custom one. A "← Back" and "This Looks Good →" button pair at the bottom.

**Step 3 — Review Contract:** Displays the AI-generated contract clauses in a scrollable container styled like a formal document (slight off-white background, serif-ish font, subtle shadow). A "Key Terms" summary sidebar shows bullet points of the most important clauses. At the bottom, two "Sign Contract" buttons (one for client, showing "You sign first"), with a note that the freelancer will sign after reviewing. A checkbox "I have read and agree to these terms" must be checked before signing.

**Step 4 — Deposit Escrow:** A clear summary showing the project title, total budget, and a large "Deposit ₹[amount] into Escrow" button. A visual explanation of what "escrow" means (expandable "How does this work?" accordion). After clicking deposit, a success animation plays showing funds moving into a vault icon, and the user is redirected to the project detail page.

### 3.7 Project Detail View

A two-column layout. The left column (60%) shows the project header (title, status badge, deadline, both parties' names), followed by the milestone timeline — a vertical list where each milestone is a card showing status, title, amount, and the appropriate action button for the current user's role. The right column (40%) shows the Escrow Wallet panel (total deposited, total released, current balance as a progress bar) and the Contract Summary card with a "View Full Contract" link.

The milestone status badges are color-coded: gray (PENDING), amber (SUBMITTED/UNDER_REVIEW), green (APPROVED/FUNDS_RELEASED), red (DISPUTED).

### 3.8 Milestone Review (Client View)

Triggered when the client clicks "Review Submission" on a SUBMITTED milestone. A modal or full-page view shows the milestone title and description, the freelancer's submitted deliverable link (displayed as a preview or clickable URL), the verification criteria that was agreed upon at project creation, and a large "Approve & Release ₹[amount]" green button and a smaller "Raise Dispute" red outlined button. A confirmation dialog appears before approval ("Are you sure? ₹[amount] will be immediately released to [Freelancer Name].").

### 3.9 Milestone Submit (Freelancer View)

Similar modal triggered when the freelancer clicks "Submit Milestone." It shows the milestone description and verification criteria as a reminder. A URL input for the deliverable link, a notes textarea for additional context, and a "Submit for Review" button. A subtle warning banner reminds the freelancer: "Once submitted, your client will be notified and can approve or dispute this milestone."

### 3.10 Dispute Chat

The dispute chat is a full-page two-pane layout. The left pane shows the dispute context: the milestone that was disputed, the reason entered by the disputing party, the AI-generated neutral summary (in a colored callout box), and the AI's proposed resolution (split percentages). The right pane is the real-time chat interface — a scrollable message list and a text input at the bottom. Messages are distinguished by alignment (left = other party, right = you) and color (client = blue tint, freelancer = green tint). A "Accept Proposed Resolution" button sits at the top of the chat pane, which is enabled only after both parties have sent at least one message. Clicking it shows the resolution terms and requires confirmation from both parties.

### 3.11 Invoice Preview

A full-page preview styled to look like a professional A4 invoice. The invoice header shows the Trust-Bound logo and "Invoice" heading side by side. Below: invoice number (TB-2026-0042), issue date, due date (same as issue date, since payment was already in escrow). Billed To (client name and email) and Billed By (freelancer name and UPI handle) in a two-column row. Then a table with four columns: Milestone, Description, Approved Date, Amount. The table footer shows subtotal, platform fee (₹0 in prototype — label it "Free during beta"), and total. A "Download PDF" and "Send by Email" button appear below the preview.

---

## 4. Responsive Behavior

All screens must work on mobile (375px width) and tablet (768px) in addition to desktop. The sidebar collapses to a bottom navigation bar on mobile. Cards stack vertically. The milestone wizard becomes full-screen on mobile with a sticky bottom button bar.

---

## 5. Interaction Design Notes

Micro-animations should be used sparingly and purposefully: the escrow balance counter animating to its new value (400ms ease-out) when funds are released, a confetti burst when a project reaches COMPLETED status, and a subtle pulse on the notification bell when a new notification arrives. These animations reinforce the emotional payoff of the platform's core value — getting paid.

---

*These wireframes represent the minimum fidelity needed to ship. The goal is function over polish in the prototype phase. Judges will respond to working flows over beautiful statics.*