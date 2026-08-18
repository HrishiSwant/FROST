# FROST AI Context

This file provides the minimum context required for an AI assistant to work on the FROST project.

## Project

FROST is an AI-powered Cyber Intelligence Platform.

Its goal is to provide multiple intelligence modules inside a single dashboard.

The project is intended to be scalable, modular and production-ready.

---

## Tech Stack

Frontend
- React
- Vite
- React Router

Backend
- Node.js
- Express

Database
- MongoDB

Deployment
- GitHub
- Vercel

---

## Architecture

Feature-based architecture.

Every feature lives inside:

features/
    feature-name/
        api/
        components/
        hooks/
        pages/
        utils/

Shared components are placed inside:

components/

---

## Important Rules

Never rewrite working modules without permission.

Original modules:
- Media Intelligence
- Phone Intelligence
- News Intelligence

keep their original UI.

Every new module uses

AppShell
↓

IntelligencePageLayout

↓

Shared Components

---

## Coding Rules

Prefer reusable components.

Avoid files larger than 200 lines whenever practical.

If modifying a file, always return the complete updated file.

Never duplicate logic if a shared component already exists.

---

## Current Development

Completed
- Malware Intelligence
- Shared Intelligence Layout
- Shared Report Components

In Progress
- Analytics
- Settings
- Theme
- Profile

Paused
- Notification logic
