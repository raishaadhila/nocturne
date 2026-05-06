# Nocturne — Whispers of the Night

An anonymous space to release your thoughts into the void. No accounts, no names — just raw feelings drifting into the night.

## Features

- **Anonymous** — no sign-up, no identity
- **Release** — write a thought and send it into the void
- **Love** — resonate with a thought that hits close to home
- **Real-time** — new thoughts appear instantly on the discover page

## Stack

- Plain HTML + Tailwind CSS (CDN)
- Vanilla JavaScript
- [Supabase](https://supabase.com) — Postgres database + real-time subscriptions

## Setup

1. Create a project on [Supabase](https://supabase.com)

2. Run the schema in the Supabase SQL Editor:
   ```sql
   create table thoughts (
     id uuid default gen_random_uuid() primary key,
     content text not null check (char_length(content) between 1 and 500),
     loves integer default 0 not null,
     created_at timestamptz default now() not null
   );

   alter table thoughts enable row level security;

   create policy "Anyone can read thoughts" on thoughts for select using (true);
   create policy "Anyone can insert thoughts" on thoughts for insert with check (true);
   create policy "Anyone can update loves" on thoughts for update using (true) with check (true);
   ```

3. Add your credentials to `app.js`:
   ```js
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

4. Serve locally:
   ```bash
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000`.

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Home — share a feeling, see recent echoes |
| `discover.html` | All thoughts, live-updating |
