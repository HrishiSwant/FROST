# FROST - Deployment Guide

Version: 1.0

Last Updated:  2026-08-18

---

# Purpose

This document explains how to set up, run, and deploy FROST.

It covers

- Local development
- Backend deployment
- Frontend deployment
- Database setup
- Environment variables
- Production deployment
- Troubleshooting

This guide should be updated whenever the deployment process changes.

---

# System Requirements

Recommended

Node.js

v20 LTS or newer

npm

v10 or newer

Git

Latest version

MongoDB

Atlas or Local MongoDB

Modern Browser

Chrome

Edge

Firefox

---

# Project Structure

```
FROST/

├── frontend/

├── backend/

├── docs/

├── README.md
```

---

# Clone Repository

```
git clone https://github.com/<your-username>/FROST.git

cd FROST
```

---

# Install Dependencies

Frontend

```
cd frontend

npm install
```

Backend

```
cd backend

npm install
```

---

# Environment Variables

Frontend

Create

```
frontend/.env
```

Example

```
VITE_API_BASE_URL=http://localhost:5000
```

---

Backend

Create

```
backend/.env
```

Example

```
PORT=5000

MONGODB_URI=

JWT_SECRET=

OPENAI_API_KEY=

VIRUSTOTAL_API_KEY=

WHOIS_API_KEY=
```

Never commit `.env` files.

---

# Running Locally

Backend

```
cd backend

npm run dev
```

Expected

```
Server running on port 5000
```

---

Frontend

```
cd frontend

npm run dev
```

Expected

```
http://localhost:5173
```

---

# MongoDB Setup

Recommended

MongoDB Atlas

Steps

1.

Create a MongoDB Atlas cluster.

2.

Create a database

```
frost
```

3.

Create a database user.

4.

Whitelist IP addresses.

Development

```
0.0.0.0/0
```

Production

Restrict to trusted IPs.

5.

Copy the connection string into

```
MONGODB_URI
```

---

# Backend Deployment

Recommended Platforms

- Render
- Railway
- Fly.io
- DigitalOcean
- AWS

Deployment Steps

1.

Connect GitHub repository.

2.

Configure environment variables.

3.

Build application.

4.

Deploy.

Verify

```
/api/health
```

returns

```json
{
  "status":"OK"
}
```

---

# Frontend Deployment

Recommended Platforms

- Vercel
- Netlify

Deployment Steps

1.

Import GitHub repository.

2.

Set Root Directory

```
frontend
```

3.

Build Command

```
npm run build
```

4.

Output Directory

```
dist
```

5.

Set

```
VITE_API_BASE_URL
```

to the production backend URL.

Deploy.

---

# Production Environment Variables

Frontend

```
VITE_API_BASE_URL=https://api.example.com
```

Backend

```
NODE_ENV=production

PORT=5000

MONGODB_URI=

JWT_SECRET=

OPENAI_API_KEY=

VIRUSTOTAL_API_KEY=

WHOIS_API_KEY=
```

---

# Production Checklist

Before deployment

✔ Environment variables configured

✔ MongoDB connected

✔ API reachable

✔ Build successful

✔ Authentication tested

✔ Database indexes created

✔ HTTPS enabled

✔ Security headers enabled

✔ Rate limiting enabled

✔ Documentation updated

---

# Build Verification

Frontend

```
npm run build
```

Backend

```
npm run start
```

Both should complete without errors.

---

# Health Check

Backend

GET

```
/api/health
```

Should return

```json
{
    "status":"OK"
}
```

---

# Deployment Workflow

```
Developer

↓

Git Commit

↓

GitHub

↓

CI/CD

↓

Backend Deploy

↓

Frontend Deploy

↓

Health Check

↓

Production
```

---

# Updating Production

Recommended process

1.

Create feature branch.

2.

Implement feature.

3.

Test locally.

4.

Update documentation.

5.

Merge into main.

6.

Automatic deployment.

7.

Verify production.

---

# Rollback Strategy

If deployment fails

1.

Identify issue.

2.

Rollback to previous deployment.

3.

Investigate logs.

4.

Fix issue.

5.

Redeploy.

Never continue deploying if critical errors remain.

---

# Backup Strategy

Database

Daily automated backups.

Environment variables

Stored securely.

Reports

Future export support.

---

# Logging

Monitor

Backend logs

Frontend console errors

Database logs

Deployment logs

Authentication failures

API failures

---

# Common Problems

## Frontend cannot reach backend

Possible causes

- Incorrect API URL
- Backend offline
- CORS configuration
- HTTPS mismatch

---

## MongoDB connection failed

Check

- Connection string
- Database user
- Password
- Network access
- Atlas cluster status

---

## Vercel build failed

Check

- Build command
- Root directory
- Missing environment variables
- Missing dependencies
- Import errors

---

## Backend deployment failed

Check

- Environment variables
- Startup script
- Node version
- Port configuration
- Build logs

---

# Security During Deployment

Never

✘ Commit `.env`

✘ Expose API keys

✘ Hardcode secrets

✘ Disable authentication

Always

✔ Use HTTPS

✔ Verify environment variables

✔ Rotate secrets if compromised

✔ Restrict database access

---

# Monitoring

Future improvements

- Uptime monitoring
- Error tracking
- Performance monitoring
- Database monitoring
- API latency tracking
- Alerting

---

# Disaster Recovery

Maintain

- Source code in GitHub
- Database backups
- Deployment history
- Environment variable backups

Recovery goal

Restore service with minimal downtime.

---

# Deployment Principles

Always

✔ Test locally first

✔ Keep environments separate

✔ Automate deployments

✔ Verify production after release

✔ Keep documentation updated

Avoid

✘ Manual production edits

✘ Deploying untested code

✘ Storing secrets in Git

✘ Ignoring deployment warnings

---

# Final Principle

A deployment is successful only when the application is fully functional, secure, monitored, and reproducible.

Every deployment should be predictable, repeatable, and easy to recover from.
