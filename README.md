# VMC Operator HMI — Startup & Operation Workflow

A responsive full-stack HMI for a single VMC (vertical machining center) operator.
Guides the operator through: **Power On → Machine Checks → Tools → Workpiece → Ready → Running/Stopped**.

## Stack

- **Client:** React + Vite (plain CSS, no framework) — single-stage-at-a-time HMI screen
- **Server:** Node + Express — REST API and simple file-based persistence (`server/data/state.json`)
- **Persistence:** state is written to disk after every action, so a page refresh (or server restart) resumes exactly where the operator left off. `POST /api/reset` restores the seeded demo state.

## Assumed mock scenario (Section 1 of the brief)

| Field | Value |
|---|---|
| Operation | Bracket Machining — OP20 Face & Drill |
| Part number | BRK-1042 |
| Quantity | 25 pcs |
| Material | Aluminum 6061-T6 |
| Drawing revision | Rev C |
| CNC program | O1042 (Rev C) |
| Fixture | Vise Fixture VF-12 |
| Work offset | G54 |
| Required tools | T01 Face Mill Ø50mm · T02 Drill Ø8.5mm · T03 Tap M10×1.5 · T04 End Mill Ø12mm |

Order creation/acceptance is out of scope, as specified — these values are preloaded on the server.

## Demo login

The HMI opens on a Power On / operator login screen (single operator, per the brief).

```
Operator ID: OP-204
PIN:         4471
```

## Run locally

Requires Node.js 18+.

```bash
# 1. install
cd server && npm install && cd ../client && npm install && cd ..

# 2. dev mode (two terminals)
cd server && npm run dev      # API on http://localhost:4000
cd client && npm run dev      # UI on http://localhost:5173 (proxies /api to the server)

# 3. production build (single process serves both UI + API)
cd client && npm run build
cd ../server && npm start     # serves the built UI + API on http://localhost:4000
```

Open http://localhost:4000 (production) or http://localhost:5173 (dev).

## Deploying to a live URL

Easiest path — **Render.com** (free web service, single Node process, persistent disk not required for this demo since state resets are expected between review sessions):

1. Push this folder to a GitHub repo.
2. On Render: **New → Web Service** → connect the repo.
3. Build command: `cd client && npm install && npm run build && cd ../server && npm install`
4. Start command: `cd server && npm start`
5. Render assigns a live `https://your-app.onrender.com` URL — that's the link to send back.

(Railway, Fly.io, or a small VPS work the same way — anything that runs a persistent Node process. Vercel's serverless functions are a poorer fit here because the file-based persistence needs a writable, long-lived filesystem.)

## API

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/login` | Validate operator ID + PIN, power on the machine |
| GET | `/api/state` | Current session state (job data, stage, checklist status) |
| POST | `/api/confirm` | `{ group, id }` — confirm one machine/tool/workpiece item |
| POST | `/api/advance` | Move to the next stage (only allowed once the current stage is fully confirmed) |
| POST | `/api/start` | READY → RUNNING (only once every arrangement is complete) |
| POST | `/api/stop` | RUNNING → STOPPED (stage is preserved) |
| POST | `/api/reset` | Restore the seeded demo state |

## Notes on scope

Per the brief, only the active instruction, progress, status and the essential controls (Confirm / Next / Start / Stop) are shown — one stage at a time, no unrelated menus.
