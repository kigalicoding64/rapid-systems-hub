-- ===== Enums =====
create type public.request_type as enum ('quotation', 'consultation');
create type public.request_status as enum (
  'new','under_review','awaiting_information','assessment_scheduled','assessment_completed',
  'quotation_preparation','quotation_sent','approved','rejected','cancelled'
);
create type public.service_division as enum ('security-systems','fire-life-safety','audio-visual','smart-buildings-ict');
create type public.portfolio_status as enum ('planned','in_progress','completed');

-- ===== Shared updated_at trigger =====
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===== Company settings (single row, editable) =====
create table public.company_settings (
  id smallint primary key default 1 check (id = 1),
  company_name text not null,
  positioning text not null,
  description text not null,
  vision text not null,
  mission text not null,
  email text not null,
  phones text[] not null default '{}',
  region text not null,
  updated_at timestamptz not null default now()
);
grant select on public.company_settings to anon, authenticated;
grant all on public.company_settings to service_role;
alter table public.company_settings enable row level security;
create policy "Company settings are public" on public.company_settings for select to anon, authenticated using (true);
create trigger company_settings_updated_at before update on public.company_settings
  for each row execute function public.set_updated_at();

insert into public.company_settings (id, company_name, positioning, description, vision, mission, email, phones, region) values (
  1,
  'RAPID SYSTEMS',
  'Integrated Security · Fire Protection · Audio Visual · Smart Infrastructure',
  'East Africa''s trusted technology integration partner — designing and delivering secure, compliant, and scalable systems for diplomatic missions, government institutions, financial organizations, and corporate enterprises.',
  'To become East Africa''s trusted leader in intelligent security, fire protection, audio visual, and smart infrastructure integration.',
  'To design and deliver secure, compliant, and scalable technology, life-safety, and AV systems that enhance protection, efficiency, and operational excellence.',
  'katumbajos@gmail.com',
  array['+256 774 448 035', '+256 703 6049'],
  'East Africa'
);

-- ===== Business reference numbers =====
create sequence public.service_request_ref_seq start 1;

-- ===== Service requests =====
create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  tracking_token_hash text not null unique,
  request_type public.request_type not null,
  status public.request_status not null default 'new',
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  client_type text not null check (client_type in ('individual','organization')),
  organization_name text,
  contact_name text not null,
  email text not null,
  phone text not null,
  country text not null,
  preferred_channel text not null check (preferred_channel in ('email','phone','whatsapp')),
  service_category public.service_division not null,
  subcategory text not null,
  project_title text not null,
  description text not null,
  facility_type text not null,
  project_size text,
  site_country text not null,
  site_city text not null,
  site_address text,
  site_type text not null,
  installation_type text not null check (installation_type in ('new','upgrade','not_sure')),
  preferred_visit_date date,
  estimated_budget text,
  desired_completion_date date,
  additional_comments text,
  consent_given_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index service_requests_email_created_idx on public.service_requests (lower(email), created_at desc);
create index service_requests_status_idx on public.service_requests (status);
create index service_requests_created_idx on public.service_requests (created_at desc);
grant all on public.service_requests to service_role;
alter table public.service_requests enable row level security;
-- No anon/authenticated policies yet: public submissions and tracking go through server code.

create or replace function public.assign_service_request_reference()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := 'RS-' || to_char(now() at time zone 'Africa/Kampala', 'YYYY') || '-' ||
      lpad(nextval('public.service_request_ref_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;
create trigger service_requests_reference before insert on public.service_requests
  for each row execute function public.assign_service_request_reference();
create trigger service_requests_updated_at before update on public.service_requests
  for each row execute function public.set_updated_at();

-- ===== Status history =====
create table public.request_status_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  status public.request_status not null,
  note text,
  client_visible boolean not null default true,
  created_at timestamptz not null default now()
);
create index request_status_events_request_idx on public.request_status_events (request_id, created_at);
grant all on public.request_status_events to service_role;
alter table public.request_status_events enable row level security;

create or replace function public.log_service_request_status()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.request_status_events (request_id, status, note)
    values (new.id, new.status, 'Request received');
  elsif new.status is distinct from old.status then
    insert into public.request_status_events (request_id, status) values (new.id, new.status);
  end if;
  return new;
end;
$$;
create trigger service_requests_status_log after insert or update of status on public.service_requests
  for each row execute function public.log_service_request_status();

-- ===== Request attachments =====
create table public.request_attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  category text not null check (category in ('attachment','site_photo','technical_document')),
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes integer not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);
create index request_attachments_request_idx on public.request_attachments (request_id);
grant all on public.request_attachments to service_role;
alter table public.request_attachments enable row level security;

-- ===== Contact enquiries =====
create table public.contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  organization text,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);
create index contact_enquiries_email_created_idx on public.contact_enquiries (lower(email), created_at desc);
grant all on public.contact_enquiries to service_role;
alter table public.contact_enquiries enable row level security;

-- ===== Portfolio (only published entries are public) =====
create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  industry text not null,
  location text not null,
  service_category public.service_division not null,
  description text not null,
  technologies text[] not null default '{}',
  image_urls text[] not null default '{}',
  completion_status public.portfolio_status not null default 'planned',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.portfolio_projects to anon, authenticated;
grant all on public.portfolio_projects to service_role;
alter table public.portfolio_projects enable row level security;
create policy "Published portfolio entries are public" on public.portfolio_projects
  for select to anon, authenticated using (is_published = true);
create trigger portfolio_projects_updated_at before update on public.portfolio_projects
  for each row execute function public.set_updated_at();