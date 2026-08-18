# FROST - Database Design

Version: 1.0

---

# Purpose

This document defines the MongoDB database architecture for FROST.

The database is designed to be:

• Scalable

• Modular

• Secure

• Easy to extend

Every feature should store data only inside its own collection whenever possible.

---

# Database

MongoDB

One database

```
frost
```

Collections

```
users

analytics

settings

reports

notifications

malware_scans

phone_scans

media_scans

news_scans

deepfake_scans

activity_logs

sessions
```

Future collections can be added without modifying existing ones.

---

# Collection Overview

| Collection | Purpose |
|------------|----------|
| users | User accounts |
| analytics | Module usage |
| settings | User preferences |
| reports | Saved reports |
| notifications | Notification center |
| activity_logs | User activity timeline |
| malware_scans | Malware scan history |
| phone_scans | Phone investigation history |
| media_scans | Media investigation history |
| news_scans | News investigation history |
| deepfake_scans | Deepfake analysis history |
| sessions | Login sessions |

---

# users

Purpose

Stores user information.

Fields

```json
{
  "_id":"",
  "name":"",
  "email":"",
  "password":"",
  "avatar":"",
  "role":"user",
  "createdAt":"",
  "updatedAt":""
}
```

Future

MFA

OAuth

RBAC

API Keys

---

# analytics

Purpose

Stores module usage statistics.

Example

```json
{
  "_id":"",
  "userId":"",
  "module":"Malware Intelligence",
  "openedAt":"2026-08-18T11:20:00Z"
}
```

Reason

Instead of keeping counters,

every module open becomes an event.

Benefits

Can calculate

Daily usage

Weekly usage

Monthly usage

Most used module

Heatmaps

User behavior

without changing the schema.

---

# settings

Purpose

Stores user preferences.

```json
{
    "_id":"",
    "userId":"",

    "appearance":{

        "theme":"dark",

        "accent":"cyan"

    },

    "notifications":{

        "enabled":true

    },

    "security":{

        "twoFactor":false

    },

    "updatedAt":""
}
```

Never store settings inside users.

---

# reports

Purpose

Stores saved intelligence reports.

```json
{
    "_id":"",

    "userId":"",

    "module":"Malware",

    "title":"",

    "summary":"",

    "reportData":{},

    "createdAt":""
}
```

Report data should remain flexible.

Avoid rigid schemas.

---

# notifications

Purpose

Stores user notifications.

```json
{
    "_id":"",

    "userId":"",

    "title":"",

    "message":"",

    "type":"info",

    "read":false,

    "createdAt":""
}
```

Types

info

warning

success

danger

---

# activity_logs

Purpose

Records user actions.

Example

```json
{
    "_id":"",

    "userId":"",

    "action":"Opened Malware Intelligence",

    "module":"Malware",

    "timestamp":""
}
```

Future

Export

Audit

Security logs

---

# malware_scans

Purpose

Stores malware investigation history.

```json
{
    "_id":"",

    "userId":"",

    "url":"",

    "result":{},

    "createdAt":""
}
```

Keep the result object flexible.

---

# phone_scans

Stores phone investigations.

```json
{
    "_id":"",

    "userId":"",

    "phone":"",

    "result":{},

    "createdAt":""
}
```

---

# media_scans

Stores media investigations.

```json
{
    "_id":"",

    "userId":"",

    "fileName":"",

    "result":{},

    "createdAt":""
}
```

---

# news_scans

Stores news investigations.

```json
{
    "_id":"",

    "userId":"",

    "url":"",

    "result":{},

    "createdAt":""
}
```

---

# deepfake_scans

Stores deepfake analysis.

```json
{
    "_id":"",

    "userId":"",

    "image":"",

    "result":{},

    "createdAt":""
}
```

---

# sessions

Purpose

Stores active user sessions.

```json
{
    "_id":"",

    "userId":"",

    "device":"",

    "browser":"",

    "ip":"",

    "createdAt":"",

    "expiresAt":""
}
```

Future

Multiple device login

Logout everywhere

Session management

---

# Relationships

```
Users
 │
 ├── Settings
 │
 ├── Analytics
 │
 ├── Activity Logs
 │
 ├── Reports
 │
 ├── Notifications
 │
 ├── Malware Scans
 │
 ├── Phone Scans
 │
 ├── Media Scans
 │
 ├── News Scans
 │
 └── Deepfake Scans
```

Every collection references

```
userId
```

Never duplicate user information.

---

# Index Strategy

Recommended indexes

Users

email

Analytics

userId

module

openedAt

Reports

userId

createdAt

Notifications

userId

read

Scans

userId

createdAt

Indexes should be added as collections grow.

---

# Data Retention

Analytics

Keep permanently.

Reports

Keep until deleted.

Notifications

Can be archived later.

Activity Logs

May be archived after one year.

Scans

Keep permanently unless user deletes them.

---

# Security

Never store

Plain text passwords

API Keys

Secrets

JWT Tokens

Sensitive information must be encrypted or hashed.

---

# Future Collections

Future versions may introduce

```
teams

organizations

permissions

roles

api_keys

audit_logs

billing

subscriptions

integrations
```

No redesign should be required to support these additions.

---

# Database Design Principles

Always

✔ Normalize user data.

✔ Keep collections independent.

✔ Use ObjectId references.

✔ Prefer event-based storage.

✔ Store timestamps.

✔ Keep schemas extensible.

Avoid

✘ Duplicate user data.

✘ Large nested documents.

✘ Mixing unrelated data.

✘ Hardcoding future limitations.

---

# Final Principle

The database should support years of future development without requiring fundamental structural changes.

Every new feature should integrate into the existing schema instead of forcing a redesign.
