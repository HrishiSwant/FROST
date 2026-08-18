# FROST - UI Guidelines

Version: 1.0

---

# 1. Purpose

This document defines the visual design language used throughout FROST.

Its purpose is to ensure every screen looks like it belongs to the same application while allowing selected modules to keep their own identity.

Consistency is preferred over redesign.

---

# 2. Design Philosophy

FROST follows these UI principles:

• Professional

• Modern

• Clean

• Cyber Security Inspired

• Minimal

• Dark Theme First

• Responsive

The interface should feel like an enterprise security platform rather than a consumer application.

---

# 3. Theme

Primary Theme

Dark

Background colors should use dark navy and slate tones.

Example palette

Primary Background

#020617

Secondary Background

#08111F

Card Background

#0F172A

Border

rgba(255,255,255,0.08)

Primary Accent

#22D3EE

Primary Action

#2563EB

Success

#10B981

Warning

#F59E0B

Danger

#EF4444

Text Primary

#FFFFFF

Text Secondary

#94A3B8

---

# 4. Typography

Main Font

System font stack or selected project font.

Heading

32–42px

Weight

700

Section Title

20–24px

Weight

600

Card Title

18px

Weight

600

Body Text

15–16px

Weight

400

Small Labels

13–14px

Weight

500

Avoid using more than three font sizes within the same card.

---

# 5. Layout Structure

Every new module should follow this hierarchy.

AppShell

↓

Content

↓

IntelligencePageLayout

↓

Feature Components

↓

Shared Cards

This keeps navigation and spacing consistent.

---

# 6. Original Modules

The following modules intentionally retain their own layouts.

• Media Intelligence

• Phone Intelligence

• News Intelligence

Reason

These were the original modules that established the FROST interface.

Their appearance should only change if a complete redesign is approved.

---

# 7. New Modules

Every newly developed intelligence module should use

IntelligencePageLayout

unless another shared layout is officially introduced.

Examples

✔ Malware Intelligence

✔ Email Intelligence

✔ Domain Intelligence

✔ Threat Intelligence

✔ APK Intelligence

---

# 8. Shared Components

Use shared UI components whenever possible.

Examples

AppShell

Sidebar

Topbar

Content

IntelligencePageLayout

SectionCard

ReportGrid

LoadingScanner

EmptyState

Avoid creating duplicate versions.

---

# 9. Cards

Cards are the primary content container.

Rules

Rounded Corners

12–18px

Padding

20–30px

Background

Dark Surface

Border

Subtle

Shadow

Soft only

Cards should never touch each other directly.

Maintain consistent spacing.

---

# 10. Buttons

Primary Button

Used for main actions.

Example

Analyze

Save

Generate

Secondary Button

Used for navigation.

Example

Back to Dashboard

Cancel

Icon Button

Used inside Topbar.

Examples

Theme

Notifications

Profile

Buttons should always include hover and disabled states.

---

# 11. Icons

Use

Lucide React

throughout the application.

Rules

Keep icon size consistent.

Navigation

20–24px

Cards

24–32px

Hero Icons

36–48px

Do not mix icon libraries.

---

# 12. Forms

Inputs should use

Rounded corners

Dark background

Visible focus state

Readable placeholder text

Buttons should be aligned consistently.

Validation messages should appear below the relevant input.

---

# 13. Reports

Report pages should be built using

ReportGrid

↓

SectionCard

↓

Feature-specific content

Avoid manually positioning cards unless necessary.

---

# 14. Empty States

Every module should provide an EmptyState.

Example

Ready to Analyze

No Reports

No Data

No Activity

Every empty state should guide the user toward the next action.

---

# 15. Loading States

Every API request should have a loading indicator.

Preferred

LoadingScanner

or another shared loading component.

Never leave the user without feedback during long operations.

---

# 16. Error States

Errors should be

Readable

Specific

Actionable

Example

✔ Invalid URL

✔ Server unavailable

✔ Analysis failed

Avoid technical error messages when possible.

---

# 17. Navigation

Sidebar

Primary application navigation.

Topbar

Quick actions.

Back Button

Every intelligence module should include

Back to Dashboard

unless there is a stronger navigation flow.

---

# 18. Responsive Design

Desktop First

Tablet

Mobile

Rules

Cards stack vertically.

Sidebars collapse.

Buttons remain accessible.

No horizontal scrolling.

All pages should remain usable on mobile devices.

---

# 19. Animations

Animations should be subtle.

Examples

Hover

Fade

Slide

Scale

Avoid distracting animations.

Performance is more important than visual effects.

---

# 20. Accessibility

Maintain sufficient color contrast.

Clickable areas should be large enough.

Icons should include labels where appropriate.

Forms should support keyboard navigation.

---

# 21. Future UI Direction

As new modules are added, they should strengthen the overall consistency of FROST rather than introduce unrelated design patterns.

Shared components should evolve instead of being replaced.

---

# 22. UI Principles

Always

✔ Keep interfaces clean.

✔ Reuse shared layouts.

✔ Maintain spacing consistency.

✔ Support responsive layouts.

✔ Keep colors consistent.

Avoid

✘ Inconsistent spacing.

✘ Duplicate card styles.

✘ Multiple button designs.

✘ Mixing icon libraries.

✘ Different layouts for similar modules without a valid reason.

---

# Final Principle

Every screen in FROST should immediately feel like part of the same platform while still allowing original flagship modules to retain their unique identity.
