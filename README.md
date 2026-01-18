# ReachInbox Email Scheduler

Full-stack assignment implementation with an Express + BullMQ scheduler backend and a Next.js + Tailwind dashboard frontend.

## Stack
- Backend: TypeScript, Express, BullMQ, Redis, PostgreSQL (Prisma), Nodemailer (Ethereal)
- Frontend: Next.js 14 (App Router), NextAuth (Google OAuth), Tailwind CSS, Axios
- Infra: Docker Compose for Redis + Postgres

## Quickstart
1. Copy env templates:
	- `cp backend/.env.example backend/.env`
	- `cp frontend/.env.example frontend/.env`
	Fill DB/Redis URLs, Google OAuth creds, and optional Ethereal creds.
2. Start infra: `docker-compose up -d`
3. Backend setup:
	```bash
	cd backend
	npm install
	npx prisma migrate dev --name init
	npm run dev        # API server on :4000
	npm run worker     # job worker
	```
4. Frontend setup:
	```bash
	cd frontend
	npm install
	npm run dev        # Next.js on :3000
	```

## Backend API
- `POST /api/schedule` — payload `{ from, subject, body, recipients[], startTime, delayBetweenSeconds, hourlyLimit }`. Creates DB records and BullMQ delayed jobs.
- `GET /api/scheduled` — list scheduled emails.
- `GET /api/sent` — list sent/failed emails.

## Scheduling & Reliability
- **Persistence:** Emails are stored in Postgres; jobs are enqueued in BullMQ (Redis). On restart, BullMQ retains delayed jobs; worker re-processes pending items. Each worker checks DB status before sending to avoid duplicates.
- **Concurrency:** Worker concurrency is configurable via `QUEUE_CONCURRENCY`.
- **Inter-email Delay:** BullMQ limiter enforces at least `MIN_DELAY_BETWEEN_MS` between sends globally for the queue.
- **Hourly Rate Limit:** Redis per-sender counters keyed by hour. `MAX_EMAILS_PER_HOUR` is configurable. When limit is hit, the worker re-enqueues the job into the next hour window (adds `ttl + minDelay`). DB status stays `scheduled` until a successful send.
- **Idempotency:** Before sending, the worker verifies the email status is still `scheduled`. After send, status becomes `sent`; retries of the same email ID become no-ops.
- **Ethereal SMTP:** Uses provided Ethereal creds; falls back to `createTestAccount()` for ad-hoc testing.

## Frontend
- Google OAuth via NextAuth. After login, user info (name/email/avatar) appears in the header with a logout action.
- Dashboard tabs for **Scheduled** and **Sent** emails, matching the provided Figma layout cues.
- **Compose modal** supports subject/body, CSV/text upload for leads (parsed client-side), start time, delay between emails, and hourly limit. Submits to backend schedule API.
- Includes loading and empty states for tables.

## Running the flow
1. Login with Google on `http://localhost:3000`.
2. Click **Compose**, add recipients (or upload CSV), subject/body, start time, delay/hourly limits, then **Schedule**.
3. Watch **Scheduled** tab; once worker fires, entries move to **Sent**.
4. To test restart resilience: stop backend/worker, start them again — pending BullMQ jobs will still execute and update DB status.

## Notes & Trade-offs
- Rate-limit rescheduling creates a new BullMQ job ID per defer; only the first successful send flips DB status.
- Limiter is global to the queue; for fine-grained per-sender delay, split queues per sender in future work.
- Demo video + submission form links should be captured after running locally.