# FROST - Component Library

Version: 1.0

Last Updated: YYYY-MM-DD

---

# Purpose

This document catalogs every reusable component used throughout FROST.

Its goals are to:

- Prevent duplicate components
- Encourage reusability
- Standardize UI
- Simplify development
- Document component usage

Before creating a new shared component, check this document first.

---

# Component Categories

## Layout Components

Application structure.

## Navigation Components

Application navigation.

## Shared UI Components

Reusable interface elements.

## Intelligence Components

Shared intelligence module components.

## State Components

Loading, empty, and error states.

## Feature Components

Feature-specific components that are not intended for reuse.

---

# Layout Components

---

## AppShell

Location

```
src/components/layouts/AppShell/
```

Purpose

Provides the main application shell.

Responsibilities

- Sidebar layout
- Topbar layout
- Main content container
- Mobile sidebar handling

Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | ReactNode | Yes | Page content |

Used By

- Dashboard
- Intelligence Pages
- Future modules

---

## Content

Location

```
src/components/layouts/Content/
```

Purpose

Provides the main scrollable content area.

Responsibilities

- Responsive spacing
- Scroll management
- Width handling

Props

| Prop | Type | Required |
|------|------|----------|
| children | ReactNode | Yes |

---

# Navigation Components

---

## Sidebar

Location

```
src/components/layouts/Sidebar/
```

Purpose

Primary application navigation.

Responsibilities

- Module navigation
- Logout
- Mobile sidebar
- Future navigation items

Future

- Active menu state
- Analytics
- Settings
- Dynamic navigation

---

## Topbar

Location

```
src/components/layouts/Topbar/
```

Purpose

Quick access actions.

Responsibilities

- Menu button
- Theme toggle
- Notifications
- Profile menu

Future

- Search
- Global shortcuts
- Breadcrumbs

---

# Intelligence Layout

---

## IntelligencePageLayout

Location

```
src/components/intelligence/layout/
```

Purpose

Standard page layout for intelligence modules.

Responsibilities

- Page title
- Subtitle
- Back button
- Shared spacing

Props

| Prop | Type |
|------|------|
| title | string |
| subtitle | string |
| children | ReactNode |

Used By

- Malware Intelligence
- Future intelligence modules

---

## ReportGrid

Location

```
src/components/intelligence/layout/
```

Purpose

Responsive grid for report cards.

Responsibilities

- Card alignment
- Responsive layout
- Consistent spacing

---

# Shared Card Components

---

## SectionCard

Location

```
src/components/intelligence/cards/
```

Purpose

Reusable report container.

Responsibilities

- Shared styling
- Card spacing
- Header layout

Props

| Prop | Description |
|------|-------------|
| title | Card title |
| icon | Optional icon |
| children | Card content |

Used By

All intelligence report cards.

---

# State Components

---

## LoadingScanner

Location

```
src/components/intelligence/states/
```

Purpose

Displays loading animation while analysis is running.

Used By

- Malware
- Future modules

---

## EmptyState

Location

```
src/components/intelligence/states/
```

Purpose

Shown when no investigation has been performed.

Props

| Prop | Description |
|------|-------------|
| title | Empty state heading |
| description | Supporting text |

---

# Malware Components

Location

```
src/features/malware/components/
```

Purpose

Feature-specific components.

Components

- MalwareForm
- MalwareReport

Report Cards

- SummaryCard
- ThreatProfileCard
- WhoisCard
- IOCCard
- AIExplanationCard
- RecommendationsCard
- IntelligenceCard

These components are intended only for Malware Intelligence.

---

# Deepfake Components

Current

Deepfake detection currently contains feature-specific UI.

Future

Extract reusable upload components if additional image-analysis modules are introduced.

Possible shared components

- UploadArea
- ImagePreview
- ConfidenceMeter
- VerdictCard

Status

Planned

---

# Dashboard Components

Purpose

Dashboard-specific UI.

Examples

- Hero Banner
- Module Cards
- Quick Actions
- Statistics Cards

These should remain dashboard-specific unless reused elsewhere.

---

# Shared Component Rules

Create a shared component when:

- Used in two or more features
- Represents common UI
- Simplifies maintenance

Keep feature-specific components inside their feature folders.

---

# Naming Convention

Components

```
PascalCase.jsx
```

Examples

```
Sidebar.jsx

SectionCard.jsx

LoadingScanner.jsx
```

Hooks

```
useHookName.js
```

Utilities

```
camelCase.js
```

Styles

```
ComponentName.module.css

ComponentName.css
```

---

# Component Checklist

Before adding a new component

✔ Can an existing component be reused?

✔ Does it belong in a feature folder?

✔ Does it belong in shared components?

✔ Is it documented here?

✔ Does it follow UI Guidelines?

---

# Future Shared Components

Planned

- SearchBar
- DataTable
- Pagination
- FilterPanel
- Modal
- ConfirmDialog
- Toast
- Badge
- ProgressBar
- Timeline
- ChartCard
- UserAvatar
- NotificationDropdown
- ProfileMenu

---

# Deprecation Policy

If a shared component is replaced

- Mark it as deprecated
- Document the replacement
- Remove only after all usages are migrated

Avoid breaking existing modules.

---

# Component Evolution

Prefer extending existing components instead of creating similar ones.

Example

Good

```
SectionCard

↓

SectionCard variant="warning"
```

Avoid

```
WarningCard

AlertCard

DangerCard

InfoCard
```

when a single configurable component is sufficient.

---

# Documentation Rule

Whenever a new shared component is created

1. Add it to this document.
2. Describe its purpose.
3. Document its props.
4. List where it is used.
5. Mark future improvements if applicable.

---

# Final Principle

Every shared component should solve a common problem once and be reused many times.

Consistency and reuse are preferred over duplication.
