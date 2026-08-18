# FROST - System Architecture

Version: 1.0

---

# 1. Architecture Overview

FROST follows a Feature-Based Architecture combined with Shared Components.

The objective is to keep every intelligence module independent while allowing the application to reuse common layouts, UI components and utilities.

The architecture emphasizes:

- Scalability
- Maintainability
- Separation of Concerns
- Code Reusability
- Production Readiness

---

# 2. High Level Architecture

                    User
                      │
                      ▼
             React Application
                      │
                      ▼
                React Router
                      │
                      ▼
                  Feature Pages
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
 Shared Components          Feature Components
          │                       │
          └───────────┬───────────┘
                      ▼
                API Layer
                      │
                      ▼
              Express Backend
                      │
                      ▼
                 MongoDB Database

---

# 3. Frontend Architecture

Frontend is divided into two major areas.

components/

Contains reusable UI.

Examples

- AppShell
- Sidebar
- Topbar
- Cards
- Buttons
- Layouts
- Shared States

These components must not contain feature-specific business logic.

---

features/

Contains application features.

Example

features/

    malware/

    media/

    phone/

    analytics/

    settings/

Every feature is independent.

Each feature owns:

- UI
- API calls
- Hooks
- Utilities
- Pages
- Components

---

# 4. Feature Structure

Every feature should follow this structure.

feature/

    api/

    components/

    hooks/

    pages/

    utils/

Example

malware/

    api/

        malwareApi.js

    hooks/

        useMalwareAnalysis.js

    components/

        MalwareForm.jsx

        MalwareReport.jsx

        cards/

    pages/

        MalwareIntelligencePage.jsx

---

# 5. Shared Components

Anything reused by two or more modules should become a shared component.

Examples

Shared Layouts

- IntelligencePageLayout

Shared Cards

- SectionCard

Shared States

- EmptyState

- LoadingScanner

Shared Layout Helpers

- ReportGrid

Future reusable components should be placed here before creating duplicate code.

---

# 6. Page Flow

Every new intelligence module follows the same flow.

User

↓

Dashboard

↓

Module Page

↓

Input Form

↓

Backend Request

↓

API Response

↓

Shared Report Components

↓

Finished Report

---

# 7. Backend Architecture

Backend follows layered architecture.

Routes

↓

Controllers

↓

Services

↓

External APIs

↓

Database

Routes only receive requests.

Controllers validate requests.

Services perform business logic.

Database stores persistent information.

---

# 8. Database Layer

MongoDB stores:

Users

Analytics

Settings

Reports

Saved Investigations

Future collections will follow the same pattern.
