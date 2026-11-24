-- MY DAY additive migration 0002: vendor overflow payload + verification hardening.
-- Run once in Supabase Dashboard -> SQL Editor (owner role). Additive only:
-- adds a column and tightens privileges; drops nothing, inserts no data.
-- Safe to re-run (IF NOT EXISTS + revoke/grant are idempotent).
--
-- Why: the API's vendor records carry fields the normalized vendors table does
-- not model (description, review status, ...). The durable Postgres adapter
-- (server/pgStore.js) stores those in this jsonb column so no field is lost.
-- Because that payload includes the review status, verification/suspension and
-- the payload itself must stay server-only (service role), never client-writable.

alter table public.vendors
  add column if not exists data jsonb not null default '{}'::jsonb;

-- Owners may edit catalog details only. verified / suspended / data / owner_id
-- are server-managed: a vendor can never self-verify or flip its review status.
-- The API uses the service role (bypasses RLS, holds ALL), so this does not
-- affect server-side registration, approval or suspension.
revoke insert, update on public.vendors from authenticated;
grant insert (id, owner_id, name, category, location, price_rate, contact, unavailable_dates)
  on public.vendors to authenticated;
grant update (name, category, location, price_rate, contact, unavailable_dates)
  on public.vendors to authenticated;