# FROST - Folder Structure

Version: 1.0

---

# Purpose

This document defines the purpose of every folder in the FROST project.

Following this structure keeps the project clean, scalable and easy to navigate.

---

# Project Structure

```
FROST/

docs/

frontend/

backend/

README.md
```

---

# docs/

Contains all project documentation.

This folder is considered the project's knowledge base.

Contents

00_AI_CONTEXT.md

01_PROJECT_OVERVIEW.md

02_ARCHITECTURE.md

03_FOLDER_STRUCTURE.md

04_UI_GUIDELINES.md

05_BACKEND_API.md

06_DATABASE.md

07_ROADMAP.md

08_DECISIONS.md

09_CODING_STANDARDS.md

CHANGELOG.md

---

# frontend/

Contains the complete React application.

```
frontend/src/
```

contains all application source code.

---

# frontend/src/components/

Contains reusable UI components.

A component belongs here only if it can be reused by multiple features.

Examples

AppShell

Sidebar

Topbar

Content

Button

Modal

Loader

ReportGrid

SectionCard

EmptyState

LoadingScanner

IntelligencePageLayout

Rule

Shared components must never contain feature-specific business logic.

---

# frontend/src/features/

Contains independent application modules.

Each module owns its own code.

Example

features/

malware/

phone/

media/

analytics/

settings/

deepfake/

Each feature should remain as independent as possible.

---

# Feature Folder Structure

Every feature should follow this structure whenever practical.

```
feature/

api/

components/

hooks/

pages/

utils/

styles/
```

---

## api/

Purpose

Communication with backend services.

Contains

Fetch functions

Axios services

API wrappers

Never place UI code here.

---

## components/

Purpose

Feature-specific UI.

Examples

MalwareForm

ThreatCard

SummaryCard

DeepfakeUploader

ProfileEditor

If another feature needs the component,

move it to

components/

---

## hooks/

Purpose

Feature-specific React hooks.

Examples

useMalwareAnalysis()

useAnalytics()

useProfile()

Business logic should live here whenever possible.

---

## pages/

Purpose

Page entry points.

Usually these are mapped directly to routes.

Examples

MalwareIntelligencePage.jsx

AnalyticsPage.jsx

SettingsPage.jsx

---

## utils/

Purpose

Utility functions used only inside the feature.

Examples

Formatters

Validators

Transformers

Parsers

---

## styles/

Optional.

Contains feature-specific CSS if needed.

Prefer colocated CSS Modules when practical.

---

# frontend/src/services/

Contains application-wide services.

Examples

Authentication

Analytics

Notifications

Theme

User Session

Unlike feature APIs,

services are shared across the application.

---

# frontend/src/assets/

Contains static assets.

Examples

Images

Icons

Logos

Fonts

Illustrations

Never store application logic here.

---

# frontend/src/routes/

Contains route definitions.

Responsible only for routing.

Should not contain business logic.

---

# frontend/src/context/

Contains React Context providers.

Examples

ThemeContext

AuthContext

NotificationContext

Use only when state must be shared globally.

---

# backend/

Contains the Express server.

Recommended structure

backend/

controllers/

routes/

services/

middlewares/

models/

utils/

config/

---

## controllers/

Receive requests.

Validate input.

Call services.

Return responses.

Controllers should remain thin.

---

## routes/

Defines API endpoints.

Example

/api/malware

/api/analytics

/api/settings

Should only map URLs to controllers.

---

## services/

Contains business logic.

Examples

VirusTotal

WHOIS

AI Analysis

Threat Scoring

Analytics

Notification Engine

Controllers should never implement business logic directly.

---

## models/

MongoDB schemas.

One model per collection.

Examples

User

Analytics

Settings

Reports

---

## middlewares/

Reusable Express middleware.

Examples

Authentication

Rate Limiting

Validation

Logging

---

## config/

Application configuration.

Examples

Environment Variables

MongoDB Connection

JWT

API Keys

---

## utils/

Shared backend helper functions.

Examples

Validators

Formatters

Date Utilities

Hash Utilities

---

# Naming Convention

Folders

lowercase

Examples

features

components

services

Files

PascalCase

Example

MalwareForm.jsx

SettingsPage.jsx

Hooks

camelCase

Example

useMalwareAnalysis.js

useProfile.js

Styles

ComponentName.module.css

or

ComponentName.css

---

# Folder Rules

Always

✔ Keep modules independent.

✔ Share reusable components.

✔ Keep business logic outside UI.

✔ Keep routing separate.

✔ Separate backend layers.

Never

✘ Put backend logic inside React.

✘ Duplicate shared components.

✘ Mix multiple features into one folder.

✘ Store unrelated files together.

---

# Final Principle

A developer unfamiliar with FROST should be able to locate any file within a few minutes simply by following this folder structure.
