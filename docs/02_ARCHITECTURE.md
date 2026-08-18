# FROST - System Architecture

Version: 1.0

---

# 1. Purpose

This document defines the overall architecture of FROST.

Every future feature, module and backend service should follow the architecture described here.

The goal is to keep the project scalable, maintainable and easy to extend.

---

# 2. High-Level Architecture

```
                    User
                      │
                      ▼
            React Frontend (Vite)
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
 Shared Components          Feature Modules
         │                         │
         └────────────┬────────────┘
                      ▼
                 API Layer
                      │
                      ▼
              Express Backend
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
     External APIs            MongoDB
```

---

# 3. Frontend Architecture

The frontend follows a Feature-Based Architecture.

Each feature is isolated from every other feature.

Example:

frontend/

features/

malware/

phone/

media/

analytics/

settings/

Each feature owns its own:

- Pages
- Components
- Hooks
- API
- Utilities

---

# 4. Shared Components

Components used by multiple modules belong inside:

frontend/src/components/

Examples

- AppShell
- Sidebar
- Topbar
- IntelligencePageLayout
- ReportGrid
- SectionCard
- EmptyState
- LoadingScanner

Shared components must never contain feature-specific business logic.

---

# 5. Feature Structure

Every feature should follow the same folder structure whenever applicable.

Example

features/

feature-name/

api/

components/

hooks/

pages/

utils/

styles/

Benefits

- Easy navigation
- Independent modules
- Reusable logic
- Easier testing

---

# 6. Backend Architecture

The backend follows a layered architecture.

Client

↓

Routes

↓

Controllers

↓

Services

↓

Database / External APIs

Responsibilities

Routes
- Handle HTTP endpoints.

Controllers
- Validate requests.
- Return responses.

Services
- Business logic.
- AI integrations.
- Threat analysis.

Database
- Persistent storage.

---

# 7. Database Architecture

MongoDB is the primary database.

Collections should remain independent.

Example

users

analytics

settings

reports

notifications

Each collection should have a clearly defined responsibility.

Avoid storing unrelated data together.

---

# 8. API Layer

The frontend never communicates directly with external services.

Flow

Frontend

↓

Frontend API Layer

↓

Express Backend

↓

VirusTotal

WHOIS

AI Services

MongoDB

This keeps API keys secure.

---

# 9. State Management

Current

React Hooks

Component State

Future

If application complexity grows significantly,

consider introducing Context API or Zustand.

Do not introduce global state unless necessary.

---

# 10. UI Architecture

Every page follows

AppShell

↓

Content

↓

Page Layout

↓

Feature Components

Original modules may use their existing layouts.

New modules should use

IntelligencePageLayout

unless another shared layout is introduced.

---

# 11. Shared Component Philosophy

Before creating a new component, ask:

Can an existing shared component solve this?

If yes

Reuse it.

If no

Create a reusable shared component if it is expected to be used by multiple features.

Otherwise

Keep it inside the feature.

---

# 12. Error Handling

Frontend

Display meaningful error messages.

Backend

Return consistent JSON responses.

Example

{
  "success": false,
  "message": "Invalid URL"
}

Avoid exposing stack traces to users.

---

# 13. Scalability Principles

The architecture should allow:

Adding new intelligence modules.

Replacing AI providers.

Replacing databases.

Supporting enterprise authentication.

Supporting teams.

Supporting reports.

Supporting analytics.

Without major rewrites.

---

# 14. Future Expansion

Planned architectural additions

Authentication Service

Notification Service

Analytics Service

Reporting Engine

Role-Based Access Control

Audit Logs

API Gateway

Each should be implemented as an independent module.

---

# 15. Architecture Rules

Always prefer

✔ Modular design

✔ Reusable components

✔ Shared utilities

✔ Clear separation of concerns

Avoid

✘ Duplicate code

✘ Massive components

✘ Direct external API calls from the frontend

✘ Tight coupling between features

---

# 16. Final Principle

Every new feature added to FROST should improve the overall architecture rather than make it more complex.

Scalability and maintainability take priority over quick implementations.
