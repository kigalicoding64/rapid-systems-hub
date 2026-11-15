alter table public.company_settings add column owner_email text;
update public.company_settings set owner_email = 'katumbajos@gmail.com', phones = array['+256 774 448 035','+256 703 604 969'] where id = 1;

create table public.leadership_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  title text not null check (char_length(title) between 2 and 120),
  bio text not null default '' check (char_length(bio) <= 3000),
  email text check (email is null or char_length(email) <= 255),
  phone text check (phone is null or char_length(phone) <= 32),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.leadership_profiles to anon, authenticated;
grant insert, update, delete on public.leadership_profiles to authenticated;
grant all on public.leadership_profiles to service_role;
alter table public.leadership_profiles enable row level security;
create trigger leadership_profiles_updated_at before update on public.leadership_profiles
  for each row execute function public.set_updated_at();
create policy "Published leadership is public" on public.leadership_profiles
  for select to anon, authenticated using (is_published or public.is_admin(auth.uid()));
create policy "Admins insert leadership" on public.leadership_profiles
  for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "Admins update leadership" on public.leadership_profiles
  for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "Admins delete leadership" on public.leadership_profiles
  for delete to authenticated using (public.is_admin(auth.uid()));

insert into public.leadership_profiles (full_name, title, bio, email, phone, sort_order) values (
  'Katumba Joseph',
  'Chief Executive Officer',
  E'As Chief Executive Officer of RAPID SYSTEMS, Katumba Joseph leads one of East Africa''s fast-growing integrated technology and engineering solution providers. With a strong background in technical project execution and team leadership, he oversees the company''s full lifecycle operations — from initial engineering design and international compliance alignment through installation, commissioning, and long-term maintenance.\n\nDedicated to engineering excellence and operational resilience, Mr. Katumba guides RAPID SYSTEMS across its core divisions: Enterprise Electronic Security, Fire Protection & Suppression, Audio-Visual & Smart Building Automation, Critical ICT Infrastructure, Electrical & Plumbing, and Digital Signage. His strategic focus centers on delivering unified, high-integrity platforms that safeguard assets, ensure business continuity, and support modern organizations across Uganda and the wider region.',
  'katumbajos@gmail.com',
  '+256 774 448 035',
  0
);

grant update (owner_email) on public.company_settings to authenticated;

create or replace function public.bootstrap_owner_account(_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_email text; v_confirmed timestamptz; v_company_email text; v_owner_email text;
begin
  select email, email_confirmed_at into v_email, v_confirmed from auth.users where id = _user_id;
  if v_confirmed is null or v_email is null then return; end if;
  select email, owner_email into v_company_email, v_owner_email from public.company_settings where id = 1;
  if lower(v_email) is distinct from lower(v_company_email) and lower(v_email) is distinct from lower(v_owner_email) then return; end if;
  if exists (select 1 from public.user_roles where role = 'super_admin') then return; end if;
  insert into public.user_roles (user_id, role) values (_user_id, 'super_admin') on conflict do nothing;
  delete from public.user_roles where user_id = _user_id and role = 'client';
  update public.profiles set account_type = 'staff' where id = _user_id;
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
  values (null, 'role.owner_bootstrapped', 'user', _user_id, jsonb_build_object('role', 'super_admin'));
end;
$$;
revoke execute on function public.bootstrap_owner_account(uuid) from public, anon, authenticated;