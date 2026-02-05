# Bird Chat

Minimal chat UI built with Next.js (App Router), TypeScript, Tailwind CSS, and a local SQLite backend.

## Setup

```bash
npm install
```

## Initialize the database

```bash
npm run db:migrate
```

By default the app uses `DATABASE_URL="file:./data/app.db"`. You can override it in `.env.local`.

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Quick Test

1. Start a new chat by typing a message and optionally attaching an image.
2. Reload the page to confirm the landing state resets to “Let’s talk about birds!”.
3. Open the history drawer (top-left menu button) to see saved conversations.
4. Click a previous conversation to continue it.

If uploads fail, ensure the `uploads/` folder is writable and that images are under 5MB.
