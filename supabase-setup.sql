-- Run this in your Supabase SQL editor

create table thoughts (
  id uuid default gen_random_uuid() primary key,
  content text not null check (char_length(content) between 1 and 500),
  loves integer default 0 not null,
  created_at timestamptz default now() not null
);

-- Allow anyone to read and insert (anonymous platform)
alter table thoughts enable row level security;

create policy "Anyone can read thoughts" on thoughts for select using (true);
create policy "Anyone can insert thoughts" on thoughts for insert with check (true);
create policy "Anyone can update loves" on thoughts for update using (true) with check (true);
