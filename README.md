# nextjs-realtime-polls

Create polls and watch results update in real time. Built on Next.js 15 with the App Router, React Server Components, Server Actions and Server-Sent Events.

## Stack

- Next.js 15, React 19, TypeScript
- SQLite via `better-sqlite3`
- Server Actions for mutations, SSE for live updates
- Vitest for unit tests

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000, create a poll, open the poll page in two tabs and vote. The other tab updates without a refresh.

## How it works

- `src/lib/db.ts`: SQLite schema and small helper functions, wrapped in a transaction for poll creation. WAL mode and `foreign_keys = ON`.
- `src/app/actions.ts`: Server Actions for `createPoll` and `vote`. After a vote the page is revalidated and an event is published on an in-process pub/sub topic for the poll.
- `src/app/api/polls/[id]/stream/route.ts`: SSE endpoint that subscribes to the poll's topic and streams events to the client, with a 15s keepalive.
- `src/app/polls/[id]/live.tsx`: tiny client component that opens an EventSource and calls `router.refresh()` whenever an event arrives, so the server component re-renders with the new counts.

For multi-replica deployments the in-process pub/sub would be swapped for Redis, keeping the shape of the code the same.

## Tests

```bash
npm test
```

Covers the database helpers end to end with a temporary SQLite file.
