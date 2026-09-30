create table if not exists public.photos_of_week (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  week_date timestamptz not null,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.photos_of_week enable row level security;

create policy "Anyone can view published photos"
on public.photos_of_week for select
using (published = true);

create policy "Council can manage photos"
on public.photos_of_week for all
to authenticated
using (
  exists (
    select 1
    from public.department_members m
    where m.user_id = auth.uid() and m.department_slug = 'council'
  )
)
with check (
  exists (
    select 1
    from public.department_members m
    where m.user_id = auth.uid() and m.department_slug = 'council'
  )
);
