create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.server_stats (
  guild_id text primary key,
  total_members integer not null default 0,
  online_members integer not null default 0,
  people_in_vc integer not null default 0,
  open_public_vcs integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.voice_channels (
  channel_id text primary key,
  guild_id text not null,
  name text not null,
  position integer not null default 0,
  parent_id text,
  user_limit integer,
  is_public boolean not null default true,
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.voice_members (
  guild_id text not null,
  user_id text not null,
  channel_id text not null references public.voice_channels(channel_id) on delete cascade,
  display_name text not null,
  avatar_url text,
  status text not null default 'unknown',
  self_mute boolean not null default false,
  self_deaf boolean not null default false,
  server_mute boolean not null default false,
  server_deaf boolean not null default false,
  streaming boolean not null default false,
  video boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (guild_id, user_id)
);

create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  discord_user_id text not null unique,
  display_name text not null,
  avatar_url text,
  rank text not null check (rank in ('Owner', 'Admin', 'Moderator', 'Trial Staff')),
  status text not null default 'unknown' check (status in ('online', 'idle', 'dnd', 'offline', 'unknown')),
  bio text not null default '',
  sort_order integer not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_applications (
  id uuid primary key default gen_random_uuid(),
  discord_username text not null,
  discord_user_id text not null,
  age integer not null,
  timezone text not null,
  activity_level text not null,
  why_staff text not null,
  vc_problem_response text not null,
  argument_response text not null,
  previous_experience text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('report', 'ban_appeal')),
  discord_username text not null,
  discord_user_id text not null,
  subject text not null,
  details text not null,
  evidence_url text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  starts_at timestamptz not null,
  host text,
  event_type text not null default 'Voice',
  is_active boolean not null default true,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists voice_members_channel_id_idx on public.voice_members(channel_id);
create index if not exists staff_members_rank_idx on public.staff_members(rank, sort_order);
create index if not exists staff_applications_status_idx on public.staff_applications(status, created_at desc);
create index if not exists reports_status_idx on public.reports(status, created_at desc);
create index if not exists events_starts_at_idx on public.events(starts_at);

drop trigger if exists set_voice_channels_updated_at on public.voice_channels;
create trigger set_voice_channels_updated_at
before update on public.voice_channels
for each row execute function public.set_updated_at();

drop trigger if exists set_staff_members_updated_at on public.staff_members;
create trigger set_staff_members_updated_at
before update on public.staff_members
for each row execute function public.set_updated_at();

drop trigger if exists set_staff_applications_updated_at on public.staff_applications;
create trigger set_staff_applications_updated_at
before update on public.staff_applications
for each row execute function public.set_updated_at();

drop trigger if exists set_reports_updated_at on public.reports;
create trigger set_reports_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

alter table public.server_stats enable row level security;
alter table public.voice_channels enable row level security;
alter table public.voice_members enable row level security;
alter table public.staff_members enable row level security;
alter table public.staff_applications enable row level security;
alter table public.reports enable row level security;
alter table public.events enable row level security;

drop policy if exists "Public can read stats" on public.server_stats;
create policy "Public can read stats"
on public.server_stats for select
using (true);

drop policy if exists "Public can read voice channels" on public.voice_channels;
create policy "Public can read voice channels"
on public.voice_channels for select
using (true);

drop policy if exists "Public can read voice members" on public.voice_members;
create policy "Public can read voice members"
on public.voice_members for select
using (true);

drop policy if exists "Public can read staff" on public.staff_members;
create policy "Public can read staff"
on public.staff_members for select
using (true);

drop policy if exists "Public can submit staff applications" on public.staff_applications;
create policy "Public can submit staff applications"
on public.staff_applications for insert
with check (true);

drop policy if exists "Public can submit reports" on public.reports;
create policy "Public can submit reports"
on public.reports for insert
with check (true);

drop policy if exists "Public can read active events" on public.events;
create policy "Public can read active events"
on public.events for select
using (is_active = true);
