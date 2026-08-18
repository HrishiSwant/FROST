# FROST - Contributing Guide

Version: 1.0

Last Updated:  2026-08-18

---

# Purpose

This document defines the development standards for FROST.

Every contributor should follow these guidelines to keep the project consistent, maintainable, and scalable.

---

# Core Principles

Every contribution should aim to improve one or more of the following:

- Maintainability
- Security
- Performance
- User Experience
- Scalability
- Code Quality

Avoid unnecessary complexity.

---

# Before Contributing

Before writing code:

1. Read the project documentation.
2. Understand the existing architecture.
3. Check the roadmap.
4. Verify that no similar feature already exists.
5. Create or update documentation if introducing a new feature.

---

# Development Workflow

Recommended workflow

```
main
 │
 ├── feature/<feature-name>
 │
 ├── bugfix/<issue-name>
 │
 ├── docs/<document-name>
 │
 └── hotfix/<critical-fix>
```

Examples

```
feature/analytics-dashboard

feature/email-intelligence

bugfix/sidebar-mobile

docs/component-library

hotfix/login-error
```

Never develop large features directly on `main`.

---

# Git Commit Convention

Write clear commit messages.

Good

```
feat: add analytics dashboard

fix: resolve mobile sidebar issue

docs: update deployment guide

refactor: simplify malware report layout

style: improve card spacing

test: add API validation tests
```

Avoid

```
update

changes

fixed stuff

final

done
```

---

# Pull Requests

Every Pull Request should include

- Purpose
- Summary of changes
- Screenshots (if UI changes)
- Related issues
- Testing notes

Checklist

✔ Builds successfully

✔ No console errors

✔ Responsive

✔ Documentation updated

✔ Code reviewed

---

# Coding Standards

## JavaScript

Use

- ES Modules
- `const` by default
- `let` only when necessary
- Arrow functions where appropriate
- Descriptive variable names

Avoid

- Unused variables
- Deep nesting
- Duplicate logic
- Magic numbers

---

# React Guidelines

Prefer

- Functional Components
- Hooks
- Feature-based structure
- Shared components

Avoid

- Class components
- Repeated UI
- Large components (>300–400 lines where practical)

---

# File Naming

Components

```
MalwareReport.jsx

SummaryCard.jsx
```

Hooks

```
useMalwareAnalysis.js
```

Utilities

```
formatDate.js

validateUrl.js
```

Styles

```
MalwareForm.css

Dashboard.module.css
```

Use PascalCase for components and camelCase for utilities/hooks.

---

# Folder Rules

Feature-specific code stays inside its feature folder.

Example

```
features/

    malware/

    phone/

    media/

    news/
```

Shared code belongs inside shared component folders.

Never duplicate shared components.

---

# Documentation Rule

Every major feature should update documentation.

Examples

New API

→ Update `05_BACKEND_API.md`

New Database Collection

→ Update `06_DATABASE.md`

New Shared Component

→ Update `11_COMPONENT_LIBRARY.md`

Completed Feature

→ Update `07_ROADMAP.md`

Deployment Change

→ Update `09_DEPLOYMENT.md`

---

# UI Consistency

Follow `04_UI_GUIDELINES.md`.

Do not introduce

- New button styles
- New spacing systems
- Different typography
- Different icon libraries

Unless officially approved.

---

# Security

Follow `08_SECURITY.md`.

Never

- Commit secrets
- Disable authentication
- Skip validation
- Store sensitive information in code

---

# Dependencies

Before adding a dependency

Ask

1. Is it actively maintained?
2. Is it necessary?
3. Can existing code solve this?
4. Does it increase bundle size significantly?

Avoid dependency bloat.

---

# Error Handling

Every new feature should handle

- Loading
- Success
- Empty state
- Error state

Users should always understand what is happening.

---

# Testing Expectations

Before marking work complete

✔ Feature works

✔ Responsive layout verified

✔ API tested

✔ No console errors

✔ Documentation updated

✔ Existing functionality unaffected

---

# Code Review Checklist

Before merging

✔ Code follows project architecture

✔ Naming is consistent

✔ Components are reusable

✔ No duplicated logic

✔ Security reviewed

✔ Documentation updated

✔ Roadmap updated if applicable

---

# Version Control

Protected branch

```
main
```

Feature work should be merged only after testing.

---

# Future Contributors

Future contributors should

- Read documentation first
- Follow architecture
- Reuse shared components
- Keep commits small and focused
- Ask before introducing major architectural changes

---

# Project Philosophy

FROST values

✔ Consistency

✔ Simplicity

✔ Documentation

✔ Security

✔ Scalability

✔ Maintainability

Over

✘ Quick fixes

✘ Duplicate code

✘ Unplanned architecture changes

✘ Unnecessary dependencies

---

# Definition of a Good Contribution

A good contribution

- Solves a real problem
- Improves the codebase
- Follows project standards
- Includes documentation updates
- Does not introduce unnecessary complexity

---

# Final Principle

Every contribution should leave FROST in a better state than it was before.

When in doubt, prioritize clarity, consistency, and maintainability over clever solutions.
