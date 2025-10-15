OkecBot-Inspired Web Automation Starter (Ethical & Compliant)

Overview

This repository is a production-quality, full‑stack starter for a legitimate and ethical web‑automation platform. It provides:

- Fastify + TypeScript API with JWT auth, Prisma (Postgres), and BullMQ (Redis)
- Worker service using Playwright (Chromium) for running browser automation steps
- React + Vite + Tailwind dashboard for creating jobs and monitoring status
- Docker Compose for local development (Postgres, Redis, API, Worker, Web)
- Unit tests (Jest + Supertest) and a minimal Playwright test
- Clear legal/ethical guardrails and URL allowlist enforcement

Legal & Ethical Use Only

This project is intended solely for lawful automation of websites you own or have explicit permission to automate. You must comply with:

- Applicable laws (e.g., CFAA, anti‑fraud, privacy)
- Website Terms of Service and robots.txt guidance
- Responsible usage practices

Explicitly out of scope and forbidden:

- Evading bot detection or anti‑abuse systems
- Generating fake traffic or fraudulent interactions
- Credential stuffing, scraping gated content, bypassing paywalls, or any abuse

The code includes guardrails: an allowlist for URLs (default) and a documented `ALLOW_ANY_URL` override for explicit, acknowledged development only. You are solely responsible for how you use this software.

Architecture

- api: Fastify (Node 18+, TS), Prisma (Postgres), BullMQ; serves REST API and static artifacts (screenshots) under `/results`
- worker: Node (TS) + Playwright; consumes the BullMQ queue and executes steps
- web: Vite (React TS) + Tailwind; simple dashboard (login, jobs, details)
- postgres: Persistent storage for users, jobs, runs, and secrets (encrypted)
- redis: Queue broker for BullMQ

Data & Artifacts

- Screenshots are stored under `./data/results` and served by the API at `/results/<file>`
- Secrets are encrypted at rest using AES‑256‑GCM with a server‑side key

URL Allowlist

By default, the API rejects jobs whose `url` host is not included in an allowlist. Configure via env:

- `ALLOW_ANY_URL=false` (default). Set to `true` only for explicit development after reading legal warnings.
- `ALLOWED_HOSTS=localhost,127.0.0.1,api,web` (comma‑separated). The sample pages are served by the API under `/sample_pages/...` and allowed by default.

Running Locally (Docker Compose)

Prerequisites: Docker + Docker Compose

1) Copy env and set secrets

```bash
cp .env.example .env
```

Ensure `JWT_SECRET` and `ENCRYPTION_KEY` are set to strong values. The encryption key must be a 32‑byte base64‑encoded key.

2) Boot the stack

```bash
docker compose up --build
```

This starts: Postgres, Redis, API (http://localhost:4000), Worker, and Web (http://localhost:5173).

3) Seed a dev admin user

The API container runs `npm run seed` automatically if the database is empty. The seed prints the admin credentials in the API logs. You can also run:

```bash
docker compose exec api npm run seed
```

Sample Pages

The repository includes `sample_pages/contact.html`, served by the API at:

`http://localhost:4000/sample_pages/contact.html`

Creating a Job (curl)

1) Get a JWT token (replace with seed email/password from logs):

```bash
curl -s -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"admin"}'
```

2) Create and run a job:

```bash
TOKEN=... # set from login
curl -s -X POST http://localhost:4000/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"Contact form demo",
    "url":"http://localhost:4000/sample_pages/contact.html",
    "steps":[
      {"action":"fill","selector":"input[name=\"name\"]","value":"Alec"},
      {"action":"fill","selector":"input[name=\"email\"]","value":"alec@example.com"},
      {"action":"fill","selector":"textarea[name=\"message\"]","value":"Hello from bot!"},
      {"action":"click","selector":"button[type=\"submit\"]"},
      {"action":"wait","selector":"#success","timeout":5000},
      {"action":"screenshot","selector":"body"}
    ],
    "runImmediately":true
  }'
```

3) List jobs:

```bash
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/jobs | jq
```

4) Inspect job details:

```bash
JOB_ID=... # from list
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/jobs/$JOB_ID | jq
```

Tests

- Unit tests (API): Jest + Supertest
- E2E (sample Playwright test): opens the local sample page

Run tests locally:

```bash
# Start Postgres and Redis for tests if not using Docker Compose
docker compose up -d postgres redis

cd api
npm ci
npm test

cd ../worker
npm ci
npx playwright install --with-deps
npm test
```

Extending: Adding Step Types

Step execution lives in `worker/src/runner.ts`. Add a new case to the dispatcher, update the Zod schema in `api/src/routes/jobs.ts`, and document it in the README. Ensure you consider timeouts, error handling, and safety.

Security Notes

- JWT auth protects API endpoints
- Secrets are encrypted at rest (AES‑256‑GCM)
- URL allowlist enforcement by default; override requires explicit opt‑in and acceptance of legal risks
- No code in this repo is designed to evade detection or commit fraud

License

Provided as‑is, without warranty. Use responsibly.


