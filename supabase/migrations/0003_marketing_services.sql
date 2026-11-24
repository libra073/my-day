-- ===========================================================================
-- 0003: MY DAY Vendor Marketing Services
--
-- Managed marketing services MY DAY offers to registered vendors: service
-- catalogue, vendor requests with an audited lifecycle, assets, messages,
-- sponsored placements and campaign reports. Payments reuse public.payments
-- (server-recorded only); no separate payment system is introduced.
--
-- Conventions follow 0001: text ids, profiles(id) uuid owners, is_admin()
-- helper, least-privilege grants, no client writes to status or payments.
-- Descriptive multilingual content lives in `data` jsonb ({en,sw} pairs).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Service catalogue (admin-managed; prices never invented by the client)
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_services (
  id         text primary key,
  slug       text not null unique,
  active     boolean not null default true,
  price_type text not null default 'quote'
             check (price_type in ('quote', 'fixed')),
  price_tzs  bigint check (price_tzs is null or price_tzs >= 0),
  sort       int not null default 0,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Vendor requests + audited lifecycle
-- submitted -> under_review -> awaiting_info -> approved -> awaiting_payment
--           -> scheduled -> in_progress -> completed  (+ rejected, cancelled)
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_requests (
  id               text primary key,
  service_id       text not null references public.marketing_services (id) on delete restrict,
  vendor_id        uuid not null references public.profiles (id) on delete cascade,
  status           text not null default 'submitted'
                   check (status in ('submitted', 'under_review', 'awaiting_info',
                                     'approved', 'awaiting_payment', 'scheduled',
                                     'in_progress', 'completed', 'rejected', 'cancelled')),
  payment_status   text not null default 'not_required'
                   check (payment_status in ('not_required', 'awaiting_quote',
                                             'awaiting_payment', 'paid', 'refunded')),
  assignee_id      uuid references public.profiles (id) on delete set null,
  quoted_price_tzs bigint check (quoted_price_tzs is null or quoted_price_tzs >= 0),
  agreed_price_tzs bigint check (agreed_price_tzs is null or agreed_price_tzs >= 0),
  preferred_start  date,
  preferred_end    date,
  campaign_start   date,
  campaign_end     date,
  data             jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists marketing_requests_vendor_idx on public.marketing_requests (vendor_id);
create index if not exists marketing_requests_status_idx on public.marketing_requests (status);

create table if not exists public.marketing_request_events (
  id          text primary key,
  request_id  text not null references public.marketing_requests (id) on delete cascade,
  actor_id    uuid references public.profiles (id) on delete set null,
  kind        text not null,
  from_status text,
  to_status   text,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists marketing_events_request_idx on public.marketing_request_events (request_id);

create table if not exists public.marketing_request_assets (
  id           text primary key,
  request_id   text not null references public.marketing_requests (id) on delete cascade,
  uploaded_by  uuid not null references public.profiles (id) on delete cascade,
  kind         text not null check (kind in ('image', 'video')),
  status       text not null default 'pending'
               check (status in ('pending', 'approved', 'rejected')),
  storage_path text not null,
  data         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists marketing_assets_request_idx on public.marketing_request_assets (request_id);

create table if not exists public.marketing_request_messages (
  id          text primary key,
  request_id  text not null references public.marketing_requests (id) on delete cascade,
  sender_id   uuid not null references public.profiles (id) on delete cascade,
  sender_role text not null default 'customer',
  body        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists marketing_messages_request_idx on public.marketing_request_messages (request_id);

-- ---------------------------------------------------------------------------
-- Sponsored placements: admin-controlled, visibly labelled, time-bounded.
-- Display is gated on starts_at/ends_at at read time so expiry is automatic.
-- Organic vendor ranking is never touched by this table.
-- ---------------------------------------------------------------------------
create table if not exists public.sponsored_placements (
  id         text primary key,
  vendor_id  text not null references public.vendors (id) on delete cascade,
  request_id text references public.marketing_requests (id) on delete set null,
  location   text not null check (location in ('homepage', 'featured', 'category', 'banner')),
  category   text not null default '',
  status     text not null default 'scheduled'
             check (status in ('scheduled', 'active', 'cancelled')),
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists sponsored_placements_window_idx
  on public.sponsored_placements (status, starts_at, ends_at);

create table if not exists public.campaign_reports (
  id         text primary key,
  request_id text not null unique references public.marketing_requests (id) on delete cascade,
  published  boolean not null default false,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Payments: reuse the existing ledger for marketing services. A payment rows
-- targets exactly one of booking / marketing request. Still server-only writes.
-- ---------------------------------------------------------------------------
alter table public.payments alter column booking_id drop not null;
alter table public.payments
  add column if not exists marketing_request_id text
  references public.marketing_requests (id) on delete cascade;
alter table public.payments drop constraint if exists payments_one_target;
alter table public.payments add constraint payments_one_target
  check (booking_id is not null or marketing_request_id is not null);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists marketing_services_touch on public.marketing_services;
create trigger marketing_services_touch before update on public.marketing_services
  for each row execute function public.touch_updated_at();
drop trigger if exists marketing_requests_touch on public.marketing_requests;
create trigger marketing_requests_touch before update on public.marketing_requests
  for each row execute function public.touch_updated_at();
drop trigger if exists sponsored_placements_touch on public.sponsored_placements;
create trigger sponsored_placements_touch before update on public.sponsored_placements
  for each row execute function public.touch_updated_at();
drop trigger if exists campaign_reports_touch on public.campaign_reports;
create trigger campaign_reports_touch before update on public.campaign_reports
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.marketing_services        enable row level security;
alter table public.marketing_requests        enable row level security;
alter table public.marketing_request_events  enable row level security;
alter table public.marketing_request_assets  enable row level security;
alter table public.marketing_request_messages enable row level security;
alter table public.sponsored_placements      enable row level security;
alter table public.campaign_reports          enable row level security;

-- Catalogue: anyone reads active services; only admins see/manage drafts.
drop policy if exists marketing_services_select on public.marketing_services;
create policy marketing_services_select on public.marketing_services for select
  using (active or public.is_admin());
drop policy if exists marketing_services_write on public.marketing_services;
create policy marketing_services_write on public.marketing_services for all
  using (public.is_admin()) with check (public.is_admin());

-- Requests: vendor reads/creates own; status and money move only via service role.
drop policy if exists marketing_requests_select on public.marketing_requests;
create policy marketing_requests_select on public.marketing_requests for select
  using (vendor_id = auth.uid() or public.is_admin());
drop policy if exists marketing_requests_insert on public.marketing_requests;
create policy marketing_requests_insert on public.marketing_requests for insert
  with check (vendor_id = auth.uid() and status = 'submitted');

-- Audit trail: readable by the request owner and admins; written by server only.
drop policy if exists marketing_events_select on public.marketing_request_events;
create policy marketing_events_select on public.marketing_request_events for select
  using (
    public.is_admin()
    or exists (select 1 from public.marketing_requests r
               where r.id = marketing_request_events.request_id
                 and r.vendor_id = auth.uid())
  );

-- Assets: owner uploads pending items for own request; admin reviews.
drop policy if exists marketing_assets_select on public.marketing_request_assets;
create policy marketing_assets_select on public.marketing_request_assets for select
  using (
    public.is_admin()
    or exists (select 1 from public.marketing_requests r
               where r.id = marketing_request_assets.request_id
                 and r.vendor_id = auth.uid())
  );
drop policy if exists marketing_assets_insert on public.marketing_request_assets;
create policy marketing_assets_insert on public.marketing_request_assets for insert
  with check (
    uploaded_by = auth.uid() and status = 'pending'
    and exists (select 1 from public.marketing_requests r
                where r.id = marketing_request_assets.request_id
                  and r.vendor_id = auth.uid())
  );

-- Messages: request owner and admin only.
drop policy if exists marketing_messages_select on public.marketing_request_messages;
create policy marketing_messages_select on public.marketing_request_messages for select
  using (
    public.is_admin()
    or exists (select 1 from public.marketing_requests r
               where r.id = marketing_request_messages.request_id
                 and r.vendor_id = auth.uid())
  );
drop policy if exists marketing_messages_insert on public.marketing_request_messages;
create policy marketing_messages_insert on public.marketing_request_messages for insert
  with check (
    sender_id = auth.uid()
    and (
      public.is_admin()
      or exists (select 1 from public.marketing_requests r
                 where r.id = marketing_request_messages.request_id
                   and r.vendor_id = auth.uid())
    )
  );

-- Placements: public reads only what is live right now; admins manage all.
drop policy if exists sponsored_placements_select on public.sponsored_placements;
create policy sponsored_placements_select on public.sponsored_placements for select
  using (
    public.is_admin()
    or (status = 'active' and starts_at <= now() and ends_at >= now())
  );
drop policy if exists sponsored_placements_write on public.sponsored_placements;
create policy sponsored_placements_write on public.sponsored_placements for all
  using (public.is_admin()) with check (public.is_admin());

-- Reports: vendor reads own published report; admins manage.
drop policy if exists campaign_reports_select on public.campaign_reports;
create policy campaign_reports_select on public.campaign_reports for select
  using (
    public.is_admin()
    or (published and exists (select 1 from public.marketing_requests r
                              where r.id = campaign_reports.request_id
                                and r.vendor_id = auth.uid()))
  );
drop policy if exists campaign_reports_write on public.campaign_reports;
create policy campaign_reports_write on public.campaign_reports for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------
revoke all on public.marketing_services, public.marketing_requests,
  public.marketing_request_events, public.marketing_request_assets,
  public.marketing_request_messages, public.sponsored_placements,
  public.campaign_reports from anon, authenticated;
grant all on public.marketing_services, public.marketing_requests,
  public.marketing_request_events, public.marketing_request_assets,
  public.marketing_request_messages, public.sponsored_placements,
  public.campaign_reports to service_role;

grant select on public.marketing_services to anon, authenticated;
grant select, insert on public.marketing_requests to authenticated;
grant select on public.marketing_request_events to authenticated;
grant select, insert on public.marketing_request_assets to authenticated;
grant select, insert on public.marketing_request_messages to authenticated;
grant select on public.sponsored_placements to anon, authenticated;
grant select, insert, update, delete on public.sponsored_placements to authenticated;
grant select on public.campaign_reports to authenticated;

-- ---------------------------------------------------------------------------
-- Seed catalogue: six managed services. No prices are invented — every service
-- starts quote-based; admins set fixed prices later via the admin console.
-- ---------------------------------------------------------------------------
insert into public.marketing_services (id, slug, sort, data) values
('mks-profile', 'profile-creation', 1, '{
  "name": {"en": "Professional Vendor Profile Creation", "sw": "Uundaji wa Wasifu wa Biashara wa Kitaalamu"},
  "summary": {"en": "A complete, polished business profile that presents your services, packages and portfolio at their best.", "sw": "Wasifu kamili na wa kuvutia wa biashara unaoonyesha huduma, vifurushi na kwingineko yako kwa ubora."},
  "description": {"en": "Our team builds and optimises your MY DAY business profile: business description, service presentation, package and pricing layout, portfolio organisation and branding improvements.", "sw": "Timu yetu huunda na kuboresha wasifu wa biashara yako ya MY DAY: maelezo ya biashara, uwasilishaji wa huduma, mpangilio wa vifurushi na bei, upangaji wa kwingineko na uboreshaji wa chapa."},
  "requirements": {"en": "Registered vendor account; business name, logo and contact details; existing photos or portfolio items; package list with prices.", "sw": "Akaunti ya muuzaji iliyosajiliwa; jina la biashara, nembo na maelezo ya mawasiliano; picha au vitu vya kwingineko vilivyopo; orodha ya vifurushi na bei."},
  "deliverables": [
    {"en": "Profile setup & optimization", "sw": "Uundaji na uboreshaji wa wasifu"},
    {"en": "Business description & service presentation", "sw": "Maelezo ya biashara na uwasilishaji wa huduma"},
    {"en": "Package & pricing presentation", "sw": "Uwasilishaji wa vifurushi na bei"},
    {"en": "Portfolio organisation", "sw": "Upangaji wa kwingineko"},
    {"en": "Branding & profile improvement", "sw": "Chapa na uboreshaji wa wasifu"}
  ],
  "managed": true
}'::jsonb),
('mks-photo', 'photo-video', 2, '{
  "name": {"en": "Photography & Videography Services", "sw": "Huduma za Picha na Video"},
  "summary": {"en": "Professional photography and video that show your business, products and venues at production quality.", "sw": "Picha na video za kitaalamu zinazoonyesha biashara, bidhaa na maeneo yako kwa ubora wa kitaalamu."},
  "description": {"en": "Booked shoots by the MY DAY media team: business photography, product and service photography, venue photography, behind-the-scenes content and business introduction videos.", "sw": "Upigaji picha uliopangwa na timu ya media ya MY DAY: picha za biashara, picha za bidhaa na huduma, picha za maeneo, maudhui ya nyuma ya pazia na video za utangulizi wa biashara."},
  "requirements": {"en": "Approved vendor profile; shoot location and access; preferred shoot dates; list of products or services to feature.", "sw": "Wasifu wa muuzaji ulioidhinishwa; eneo la upigaji picha na ruhusa ya kuingia; tarehe unazopendelea; orodha ya bidhaa au huduma za kuonyesha."},
  "deliverables": [
    {"en": "Business photography", "sw": "Picha za biashara"},
    {"en": "Product & service photography", "sw": "Picha za bidhaa na huduma"},
    {"en": "Venue photography", "sw": "Picha za maeneo"},
    {"en": "Behind-the-scenes content", "sw": "Maudhui ya nyuma ya pazia"},
    {"en": "Business introduction video", "sw": "Video ya utangulizi wa biashara"}
  ],
  "managed": true
}'::jsonb),
('mks-social', 'social-promotion', 3, '{
  "name": {"en": "Social Media Promotion", "sw": "Promosheni za Mitandao ya Kijamii"},
  "summary": {"en": "Planned promotion of your business through MY DAY''s official social channels.", "sw": "Promosheni iliyopangwa ya biashara yako kupitia njia rasmi za mitandao ya kijamii za MY DAY."},
  "description": {"en": "Promotional posts, stories and reels, vendor spotlights and a content plan, published through MY DAY''s official social channels. Managed service: MY DAY creates and publishes the content; no external advertising accounts are connected.", "sw": "Machapisho ya promosheni, stori na reels, uangalizi wa wauzaji na mpango wa maudhui, kuchapishwa kupitia njia rasmi za MY DAY. Huduma inayosimamiwa: MY DAY huunda na kuchapisha maudhui; hakuna akaunti za matangazo za nje zilizounganishwa."},
  "requirements": {"en": "Approved vendor profile; brand assets (logo, photos); offer or message to promote; preferred promotion window.", "sw": "Wasifu wa muuzaji ulioidhinishwa; vitu vya chapa (nembo, picha); ofa au ujumbe wa kupromoti; kipindi unachopendelea cha promosheni."},
  "deliverables": [
    {"en": "Promotional posts", "sw": "Machapisho ya promosheni"},
    {"en": "Stories & reels", "sw": "Stori na reels"},
    {"en": "Vendor spotlights", "sw": "Uangalizi wa wauzaji"},
    {"en": "Social content planning", "sw": "Mpango wa maudhui ya kijamii"},
    {"en": "Publication on MY DAY channels", "sw": "Uchapishaji kwenye njia za MY DAY"}
  ],
  "managed": true
}'::jsonb),
('mks-video', 'promo-videos', 4, '{
  "name": {"en": "Promotional Videos", "sw": "Video za Promosheni"},
  "summary": {"en": "Edited promotional videos for your business, services, venues and special offers.", "sw": "Video za promosheni zilizohaririwa kwa biashara, huduma, maeneo na ofa maalum."},
  "description": {"en": "The MY DAY media team produces business introduction videos, service showcases, promotional advertisements, venue and product showcases and special-offer videos.", "sw": "Timu ya media ya MY DAY hutengeneza video za utangulizi wa biashara, maonyesho ya huduma, matangazo ya promosheni, maonyesho ya maeneo na bidhaa na video za ofa maalum."},
  "requirements": {"en": "Approved vendor profile; shoot access and dates; script approval; brand assets and offer details.", "sw": "Wasifu wa muuzaji ulioidhinishwa; ruhusa na tarehe za upigaji; idhini ya hati; vitu vya chapa na maelezo ya ofa."},
  "deliverables": [
    {"en": "Business introduction video", "sw": "Video ya utangulizi wa biashara"},
    {"en": "Service showcase video", "sw": "Video ya maonyesho ya huduma"},
    {"en": "Promotional advertisement", "sw": "Tangazo la promosheni"},
    {"en": "Venue & product showcase", "sw": "Maonyesho ya maeneo na bidhaa"},
    {"en": "Special offer video", "sw": "Video ya ofa maalum"}
  ],
  "managed": true
}'::jsonb),
('mks-sponsored', 'sponsored-features', 5, '{
  "name": {"en": "Sponsored Vendor Features", "sw": "Nafasi za Udhamini kwa Wauzaji"},
  "summary": {"en": "Clearly labelled sponsored placements across MY DAY, controlled entirely by the MY DAY team.", "sw": "Nafasi za udhamini zilizoandikwa wazi kote MY DAY, zinazosimamiwa kabisa na timu ya MY DAY."},
  "description": {"en": "Homepage sponsored placements, featured vendor sections, sponsored category placements and promotional banners. Every placement is visibly labelled Sponsored and expires automatically; organic vendor rankings are never affected.", "sw": "Nafasi za udhamini za ukurasa wa nyumbani, sehemu za wauzaji walioangaziwa, nafasi za udhamini za kategoria na mabango ya promosheni. Kila nafasi huandikwa wazi Sponsored na huisha kiotomatiki; mpangilio wa asili wa wauzaji hauathiriwi kamwe."},
  "requirements": {"en": "Approved vendor profile; campaign objective; preferred placement and duration; approved promotional content.", "sw": "Wasifu wa muuzaji ulioidhinishwa; lengo la kampeni; nafasi na muda unaopendelewa; maudhui ya promosheni yaliyoidhinishwa."},
  "deliverables": [
    {"en": "Homepage sponsored placement", "sw": "Nafasi ya udhamini ya ukurasa wa nyumbani"},
    {"en": "Featured vendor section", "sw": "Sehemu ya muuzaji aliyeangaziwa"},
    {"en": "Sponsored category placement", "sw": "Nafasi ya udhamini ya kategoria"},
    {"en": "Promotional banner", "sw": "Bango la promosheni"},
    {"en": "Visible Sponsored label", "sw": "Lebo iliyo wazi ya Sponsored"}
  ],
  "managed": true
}'::jsonb),
('mks-campaigns', 'campaigns', 6, '{
  "name": {"en": "Marketing Campaigns", "sw": "Kampeni za Masoko"},
  "summary": {"en": "Managed campaigns for launches, seasons and special offers, with a real performance report at the end.", "sw": "Kampeni zinazosimamiwa za uzinduzi, misimu na ofa maalum, na ripoti halisi ya utendaji mwishoni."},
  "description": {"en": "Business launch campaigns, seasonal promotions, wedding-season campaigns, discount and special-offer campaigns and custom promotional campaigns, planned and executed by the MY DAY marketing team.", "sw": "Kampeni za uzinduzi wa biashara, promosheni za misimu, kampeni za msimu wa harusi, kampeni za punguzo na ofa maalum na kampeni maalum za promosheni, zilizopangwa na kutekelezwa na timu ya masoko ya MY DAY."},
  "requirements": {"en": "Approved vendor profile; campaign objective and budget; target audience; start and end dates; offer details.", "sw": "Wasifu wa muuzaji ulioidhinishwa; lengo na bajeti ya kampeni; hadhira lengwa; tarehe za kuanza na kuisha; maelezo ya ofa."},
  "deliverables": [
    {"en": "Business launch campaign", "sw": "Kampeni ya uzinduzi wa biashara"},
    {"en": "Seasonal promotion", "sw": "Promosheni ya msimu"},
    {"en": "Wedding-season campaign", "sw": "Kampeni ya msimu wa harusi"},
    {"en": "Discount & special-offer campaign", "sw": "Kampeni ya punguzo na ofa maalum"},
    {"en": "Custom campaign & performance report", "sw": "Kampeni maalum na ripoti ya utendaji"}
  ],
  "managed": true
}'::jsonb)
on conflict (slug) do nothing;