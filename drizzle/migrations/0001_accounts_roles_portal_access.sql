-- ===== Roles & account types =====
create type public.app_role as enum (
  'super_admin','director','operations_manager','sales','project_manager','engineer','technician','finance_officer','client'
);
create type public.account_type as enum ('client','staff');

-- ===== Organizations =====
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  country text check (country is null or char_length(country) <= 80),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.organizations to authenticated;
grant update (name, country) on public.organizations to authenticated;
grant all on public.organizations to service_role;
alter table public.organizations enable row level security;
create trigger organizations_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();

-- ===== Profiles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  full_name text not null default '' check (char_length(full_name) <= 120),
  phone text check (phone is null or char_length(phone) <= 32),
  job_title text check (job_title is null or char_length(job_title) <= 120),
  department text check (department is null or char_length(department) <= 120),
  skills text[] not null default '{}',
  account_type public.account_type not null default 'client',
  organization_id uuid references public.organizations(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_organization_idx on public.profiles (organization_id);
create index profiles_email_idx on public.profiles (lower(email));
grant select on public.profiles to authenticated;
grant update (full_name, phone, job_title) on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ===== User roles =====
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
create index user_roles_user_idx on public.user_roles (user_id);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

-- ===== Audit log =====
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);
grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;

-- ===== Role helpers (security definer, avoid RLS recursion) =====
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles r
    join public.profiles p on p.id = r.user_id
    where r.user_id = _user_id and r.role = _role and (p.is_active or r.role = 'client')
  )
$$;

create or replace function public.has_any_role(_user_id uuid, _roles public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles r
    join public.profiles p on p.id = r.user_id
    where r.user_id = _user_id and r.role = any(_roles) and (p.is_active or r.role = 'client')
  )
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles r
    join public.profiles p on p.id = r.user_id
    where r.user_id = _user_id and r.role <> 'client' and p.is_active
  )
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_any_role(_user_id, array['super_admin','director']::public.app_role[])
$$;

create or replace function public.current_organization_id()
returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

-- ===== Policies =====
create policy "Users read own profile; staff read all" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "Users update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "Users read own roles; staff read all" on public.user_roles
  for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));

create policy "Members read own organization; staff read all" on public.organizations
  for select to authenticated using (id = public.current_organization_id() or public.is_staff(auth.uid()));
create policy "Members update own organization" on public.organizations
  for update to authenticated using (id = public.current_organization_id()) with check (id = public.current_organization_id());

create policy "Admins read audit log" on public.audit_logs
  for select to authenticated using (public.is_admin(auth.uid()));

-- Company settings: admins may edit; every change is audited.
grant update (company_name, positioning, description, vision, mission, email, phones, region) on public.company_settings to authenticated;
create policy "Admins update company settings" on public.company_settings
  for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create or replace function public.audit_company_settings()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, details)
  values (auth.uid(), 'company_settings.updated', 'company_settings', jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new)));
  return new;
end;
$$;
create trigger company_settings_audit after update on public.company_settings
  for each row execute function public.audit_company_settings();

-- ===== Requests: link to accounts =====
alter table public.service_requests add column submitted_by uuid;
alter table public.service_requests add column organization_id uuid references public.organizations(id) on delete set null;
create index service_requests_submitted_by_idx on public.service_requests (submitted_by, created_at desc);

-- Authenticated reads never include the tracking token hash.
grant select (
  id, reference, request_type, status, priority, client_type, organization_name, contact_name, email, phone,
  country, preferred_channel, service_category, subcategory, project_title, description, facility_type,
  project_size, site_country, site_city, site_address, site_type, installation_type, preferred_visit_date,
  estimated_budget, desired_completion_date, additional_comments, consent_given_at, created_at, updated_at,
  submitted_by, organization_id
) on public.service_requests to authenticated;
create policy "Clients read own requests; staff read all" on public.service_requests
  for select to authenticated using (submitted_by = auth.uid() or public.is_staff(auth.uid()));

grant select on public.request_status_events to authenticated;
create policy "Visible status history for request readers" on public.request_status_events
  for select to authenticated using (
    public.is_staff(auth.uid())
    or (client_visible and exists (
      select 1 from public.service_requests s where s.id = request_id and s.submitted_by = auth.uid()
    ))
  );

grant select on public.request_attachments to authenticated;
create policy "Attachments for request readers" on public.request_attachments
  for select to authenticated using (
    public.is_staff(auth.uid())
    or exists (select 1 from public.service_requests s where s.id = request_id and s.submitted_by = auth.uid())
  );

grant select on public.contact_enquiries to authenticated;
create policy "Staff read contact enquiries" on public.contact_enquiries
  for select to authenticated using (public.is_staff(auth.uid()));

-- ===== Account lifecycle =====
-- Links guest requests made with the same address once that address is verified.
create or replace function public.link_guest_requests(_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_email text; v_confirmed timestamptz; v_org uuid;
begin
  select email, email_confirmed_at into v_email, v_confirmed from auth.users where id = _user_id;
  if v_confirmed is null or v_email is null then return; end if;
  select organization_id into v_org from public.profiles where id = _user_id;
  update public.service_requests
    set submitted_by = _user_id, organization_id = coalesce(organization_id, v_org)
    where submitted_by is null and lower(email) = lower(v_email);
end;
$$;

-- The first verified account using the company email becomes the super administrator.
create or replace function public.bootstrap_owner_account(_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_email text; v_confirmed timestamptz; v_company_email text;
begin
  select email, email_confirmed_at into v_email, v_confirmed from auth.users where id = _user_id;
  if v_confirmed is null or v_email is null then return; end if;
  select email into v_company_email from public.company_settings where id = 1;
  if v_company_email is null or lower(v_email) <> lower(v_company_email) then return; end if;
  if exists (select 1 from public.user_roles where role = 'super_admin') then return; end if;
  insert into public.user_roles (user_id, role) values (_user_id, 'super_admin') on conflict do nothing;
  delete from public.user_roles where user_id = _user_id and role = 'client';
  update public.profiles set account_type = 'staff' where id = _user_id;
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
  values (null, 'role.owner_bootstrapped', 'user', _user_id, jsonb_build_object('role', 'super_admin'));
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_org_name text; v_name text;
begin
  v_name := left(coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    ''), 120);
  v_org_name := left(nullif(trim(new.raw_user_meta_data->>'organization_name'), ''), 160);
  if v_org_name is not null and char_length(v_org_name) >= 2 then
    insert into public.organizations (name, created_by) values (v_org_name, new.id) returning id into v_org;
  end if;
  insert into public.profiles (id, email, full_name, phone, organization_id)
  values (new.id, coalesce(new.email, ''), v_name,
          left(nullif(trim(new.raw_user_meta_data->>'phone'), ''), 32), v_org);
  insert into public.user_roles (user_id, role) values (new.id, 'client');
  perform public.bootstrap_owner_account(new.id);
  perform public.link_guest_requests(new.id);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_user_updated()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = coalesce(new.email, '') where id = new.id;
  end if;
  if new.email_confirmed_at is not null and (old.email_confirmed_at is null or new.email is distinct from old.email) then
    perform public.bootstrap_owner_account(new.id);
    perform public.link_guest_requests(new.id);
  end if;
  return new;
end;
$$;
create trigger on_auth_user_updated after update of email, email_confirmed_at on auth.users
  for each row execute function public.handle_user_updated();

revoke execute on function public.link_guest_requests(uuid) from public, anon, authenticated;
revoke execute on function public.bootstrap_owner_account(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_updated() from public, anon, authenticated;
revoke execute on function public.audit_company_settings() from public, anon, authenticated;
