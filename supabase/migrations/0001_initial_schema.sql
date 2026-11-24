-- MY DAY production schema + Row Level Security.
-- Run once in Supabase Dashboard -> SQL Editor (owner role). Additive only:
-- creates tables/policies, inserts NO demo data, drops nothing.
--
-- Model mirrors server/db.js collections so the durable Postgres adapter can
-- map 1:1. Identity lives in ONE table (public.profiles) keyed by auth.users;
-- customer and vendor detail live in separate profile tables; businesses and
-- wedding workspaces each have their own membership table.

-- ---------------------------------------------------------------------------
-- updated_at helper (no table references, safe to create first)
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Identity: one users/profiles table
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  email          text not null unique,
  full_name      text not null default '',
  phone          text not null default '',
  global_role    text not null default 'customer'
                 check (global_role in ('customer', 'vendor', 'admin')),
  email_verified boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.customer_profiles (
  user_id          uuid primary key references public.profiles (id) on delete cascade,
  default_location text not null default '',
  preferences      jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.vendor_profiles (
  user_id           uuid primary key references public.profiles (id) on delete cascade,
  business_name     text not null default '',
  category          text not null default '',
  location          text not null default '',
  contact           text not null default '',
  price_rate        bigint not null default 0,
  unavailable_dates text[] not null default '{}',
  verified          boolean not null default false,
  suspended         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Business / team membership
-- ---------------------------------------------------------------------------
create table if not exists public.businesses (
  id         text primary key,
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  name       text not null,
  category   text not null default '',
  location   text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_members (
  id          text primary key,
  business_id text not null references public.businesses (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  role        text not null default 'staff' check (role in ('owner', 'manager', 'staff')),
  joined_at   timestamptz not null default now(),
  invited_by  uuid references public.profiles (id) on delete set null,
  unique (business_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Wedding workspaces + membership + invitations
-- ---------------------------------------------------------------------------
create table if not exists public.workspaces (
  id         text primary key,
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  title      text not null default '',
  bride      text not null default '',
  groom      text not null default '',
  date       date,
  location   text not null default '',
  guests     integer not null default 100,
  budget     bigint not null default 10000000,
  currency   text not null default 'TZS',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id           text primary key,
  workspace_id text not null references public.workspaces (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  role         text not null default 'friend'
               check (role in ('owner', 'partner', 'planner', 'family', 'friend', 'vendor')),
  joined_at    timestamptz not null default now(),
  invited_by   uuid references public.profiles (id) on delete set null,
  unique (workspace_id, user_id)
);

create table if not exists public.invitations (
  id           text primary key,
  workspace_id text not null references public.workspaces (id) on delete cascade,
  token        text not null unique,
  email        text,
  role         text not null default 'friend',
  inviter_id   uuid references public.profiles (id) on delete set null,
  inviter_name text not null default '',
  status       text not null default 'pending',
  expires_at   timestamptz,
  accepted_by  uuid references public.profiles (id) on delete set null,
  accepted_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Commerce: vendors, bookings, payments
-- ---------------------------------------------------------------------------
create table if not exists public.vendors (
  id                text primary key,
  owner_id          uuid references public.profiles (id) on delete set null,
  name              text not null,
  category          text not null default '',
  location          text not null default '',
  price_rate        bigint not null default 0,
  contact           text not null default '',
  unavailable_dates text[] not null default '{}',
  verified          boolean not null default false,
  suspended         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.bookings (
  id          text primary key,
  customer_id uuid not null references public.profiles (id) on delete cascade,
  provider_id text not null references public.vendors (id) on delete restrict,
  category    text not null default '',
  package_id  text,
  wedding_id  text references public.workspaces (id) on delete set null,
  date        date not null,
  price       bigint not null,
  deposit     bigint not null,
  paid_amount bigint not null default 0,
  commission  bigint not null default 0,
  status      text not null default 'pending_deposit'
              check (status in ('pending_deposit', 'partial', 'confirmed', 'cancelled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.payments (
  id          text primary key,
  booking_id  text not null references public.bookings (id) on delete cascade,
  customer_id uuid not null references public.profiles (id) on delete cascade,
  amount      bigint not null,
  gateway     text not null default '',
  txn_ref     text not null default '',
  status      text not null default 'pending'
              check (status in ('pending', 'confirmed', 'failed', 'refunded')),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Planning collections (jsonb payload mirrors the JSON store records)
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id           text primary key,
  workspace_id text references public.workspaces (id) on delete cascade,
  user_id      uuid references public.profiles (id) on delete set null,
  data         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create table if not exists public.decisions (
  id           text primary key,
  workspace_id text references public.workspaces (id) on delete cascade,
  user_id      uuid references public.profiles (id) on delete set null,
  data         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create table if not exists public.notes (
  id           text primary key,
  workspace_id text references public.workspaces (id) on delete cascade,
  user_id      uuid references public.profiles (id) on delete set null,
  data         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create table if not exists public.budget_categories (
  id           text primary key,
  workspace_id text references public.workspaces (id) on delete cascade,
  user_id      uuid references public.profiles (id) on delete set null,
  data         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create table if not exists public.expenses (
  id           text primary key,
  workspace_id text references public.workspaces (id) on delete cascade,
  user_id      uuid references public.profiles (id) on delete set null,
  data         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create table if not exists public.notifications (
  id           text primary key,
  workspace_id text references public.workspaces (id) on delete cascade,
  user_id      uuid references public.profiles (id) on delete set null,
  data         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create table if not exists public.appointments (
  id           text primary key,
  workspace_id text references public.workspaces (id) on delete cascade,
  user_id      uuid references public.profiles (id) on delete set null,
  data         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create table if not exists public.vendor_schedules (
  id           text primary key,
  workspace_id text references public.workspaces (id) on delete cascade,
  user_id      uuid references public.profiles (id) on delete set null,
  data         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create table if not exists public.complaints (
  id           text primary key,
  workspace_id text references public.workspaces (id) on delete cascade,
  user_id      uuid references public.profiles (id) on delete set null,
  data         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Role helpers (created after profiles exists; SQL bodies are validated now)
-- ---------------------------------------------------------------------------
create or replace function public.current_global_role()
returns text language sql stable security definer set search_path = public as $$
  select global_role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_global_role() = 'admin', false);
$$;

-- Public sign-up always lands as 'customer'. Admin is bootstrapped server-side
-- (MYDAY_ADMIN_EMAILS) via the service role; vendor comes from business approval.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, global_role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_bookings_customer on public.bookings (customer_id);
create index if not exists idx_bookings_provider_date on public.bookings (provider_id, date);
create index if not exists idx_payments_booking on public.payments (booking_id);
create index if not exists idx_workspace_members_ws on public.workspace_members (workspace_id);
create index if not exists idx_workspace_members_user on public.workspace_members (user_id);
create index if not exists idx_business_members_biz on public.business_members (business_id);
create index if not exists idx_business_members_user on public.business_members (user_id);
create index if not exists idx_invitations_ws on public.invitations (workspace_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','customer_profiles','vendor_profiles','businesses','workspaces',
    'vendors','bookings','tasks','decisions','notes','budget_categories',
    'expenses','notifications','appointments','vendor_schedules','complaints'
  ] loop
    execute format('drop trigger if exists touch_%I on public.%I', t, t);
    execute format(
      'create trigger touch_%I before update on public.%I for each row execute function public.touch_updated_at()',
      t, t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security: enforce permissions in the database, not the UI.
-- The API uses the service role (bypasses RLS); browser clients get only the
-- policies below. Payments and booking status have NO client write policy, so
-- a frontend success can never mark a booking paid/confirmed.
-- ---------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.vendor_profiles   enable row level security;
alter table public.businesses        enable row level security;
alter table public.business_members  enable row level security;
alter table public.workspaces        enable row level security;
alter table public.workspace_members enable row level security;
alter table public.invitations       enable row level security;
alter table public.vendors           enable row level security;
alter table public.bookings          enable row level security;
alter table public.payments          enable row level security;
alter table public.tasks             enable row level security;
alter table public.decisions         enable row level security;
alter table public.notes             enable row level security;
alter table public.budget_categories enable row level security;
alter table public.expenses          enable row level security;
alter table public.notifications     enable row level security;
alter table public.appointments      enable row level security;
alter table public.vendor_schedules  enable row level security;
alter table public.complaints        enable row level security;

-- Make re-runs safe: drop any policies from a previous run before recreating.
do $$
declare r record;
begin
  for r in select tablename, policyname from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end;
$$;

-- profiles: read self/admin; clients may edit only name/phone (column grants
-- below). Role + verification are server-only.
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

create policy customer_profiles_all on public.customer_profiles for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy vendor_profiles_all on public.vendor_profiles for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- businesses: members read; owner manages.
create policy businesses_select on public.businesses for select
  using (
    owner_id = auth.uid() or public.is_admin()
    or exists (select 1 from public.business_members m
               where m.business_id = businesses.id and m.user_id = auth.uid())
  );
create policy businesses_insert on public.businesses for insert
  with check (owner_id = auth.uid());
create policy businesses_update on public.businesses for update
  using (owner_id = auth.uid() or public.is_admin());
create policy businesses_delete on public.businesses for delete
  using (owner_id = auth.uid() or public.is_admin());

create policy business_members_select on public.business_members for select
  using (
    public.is_admin()
    or exists (select 1 from public.business_members m
               where m.business_id = business_members.business_id and m.user_id = auth.uid())
  );
create policy business_members_write on public.business_members for all
  using (
    public.is_admin()
    or exists (select 1 from public.business_members m
               where m.business_id = business_members.business_id
                 and m.user_id = auth.uid() and m.role in ('owner', 'manager'))
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.business_members m
               where m.business_id = business_members.business_id
                 and m.user_id = auth.uid() and m.role in ('owner', 'manager'))
  );

-- workspaces: members read; owner manages.
create policy workspaces_select on public.workspaces for select
  using (
    owner_id = auth.uid() or public.is_admin()
    or exists (select 1 from public.workspace_members m
               where m.workspace_id = workspaces.id and m.user_id = auth.uid())
  );
create policy workspaces_insert on public.workspaces for insert
  with check (owner_id = auth.uid());
create policy workspaces_update on public.workspaces for update
  using (owner_id = auth.uid() or public.is_admin());
create policy workspaces_delete on public.workspaces for delete
  using (owner_id = auth.uid() or public.is_admin());

create policy workspace_members_select on public.workspace_members for select
  using (
    public.is_admin()
    or exists (select 1 from public.workspace_members m
               where m.workspace_id = workspace_members.workspace_id and m.user_id = auth.uid())
  );
create policy workspace_members_write on public.workspace_members for all
  using (
    public.is_admin()
    or exists (select 1 from public.workspaces w
               where w.id = workspace_members.workspace_id and w.owner_id = auth.uid())
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.workspaces w
               where w.id = workspace_members.workspace_id and w.owner_id = auth.uid())
  );

create policy invitations_select on public.invitations for select
  using (
    public.is_admin() or inviter_id = auth.uid()
    or email = (select email from public.profiles where id = auth.uid())
    or exists (select 1 from public.workspaces w
               where w.id = invitations.workspace_id and w.owner_id = auth.uid())
  );
create policy invitations_write on public.invitations for all
  using (
    public.is_admin()
    or exists (select 1 from public.workspaces w
               where w.id = invitations.workspace_id and w.owner_id = auth.uid())
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.workspaces w
               where w.id = invitations.workspace_id and w.owner_id = auth.uid())
  );

-- vendors: public catalog read; owner/admin manage.
create policy vendors_select on public.vendors for select using (true);
create policy vendors_insert on public.vendors for insert
  with check (owner_id = auth.uid() or public.is_admin());
create policy vendors_update on public.vendors for update
  using (owner_id = auth.uid() or public.is_admin());
create policy vendors_delete on public.vendors for delete
  using (public.is_admin());

-- bookings: customer/provider/admin read; customer creates. NO client update:
-- status + paid_amount change only via the service role (verified callback).
create policy bookings_select on public.bookings for select
  using (
    customer_id = auth.uid() or public.is_admin()
    or exists (select 1 from public.vendors v
               where v.id = bookings.provider_id and v.owner_id = auth.uid())
  );
create policy bookings_insert on public.bookings for insert
  with check (customer_id = auth.uid());

-- payments: read own/admin only. NO client insert/update/delete: a payment is
-- recorded solely by the server after a verified provider callback.
create policy payments_select on public.payments for select
  using (customer_id = auth.uid() or public.is_admin());

-- planning collections: workspace members or record owner or admin.
do $$
declare t text;
begin
  foreach t in array array[
    'tasks','decisions','notes','budget_categories','expenses',
    'notifications','appointments','vendor_schedules','complaints'
  ] loop
    execute format('create policy %I_select on public.%I for select using (
        public.is_admin() or user_id = auth.uid()
        or exists (select 1 from public.workspace_members m
                   where m.workspace_id = %I.workspace_id and m.user_id = auth.uid()))', t, t, t);
    execute format('create policy %I_write on public.%I for all using (
        public.is_admin() or user_id = auth.uid()
        or exists (select 1 from public.workspace_members m
                   where m.workspace_id = %I.workspace_id and m.user_id = auth.uid()))
      with check (
        public.is_admin() or user_id = auth.uid()
        or exists (select 1 from public.workspace_members m
                   where m.workspace_id = %I.workspace_id and m.user_id = auth.uid()))', t, t, t, t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Privileges: lock privilege-escalation columns; clients get least privilege.
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
grant all on all tables in schema public to service_role;

grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.customer_profiles to authenticated;
grant select, insert, update, delete on public.vendor_profiles to authenticated;
grant select, insert, update, delete on public.businesses to authenticated;
grant select, insert, update, delete on public.business_members to authenticated;
grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.workspace_members to authenticated;
grant select, insert, update, delete on public.invitations to authenticated;
grant select, insert, update, delete on public.vendors to authenticated;
grant select, insert on public.bookings to authenticated;
grant select on public.payments to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.decisions to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
grant select, insert, update, delete on public.budget_categories to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
grant select, insert, update, delete on public.vendor_schedules to authenticated;
grant select, insert, update, delete on public.complaints to authenticated;
grant select on public.vendors to anon;

-- Clients may edit only these profile columns; global_role / email_verified /
-- verified / suspended stay server-only (service role).
revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;
revoke update on public.vendor_profiles from authenticated;
grant update (business_name, category, location, contact, price_rate, unavailable_dates)
  on public.vendor_profiles to authenticated;

grant execute on function public.current_global_role() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;