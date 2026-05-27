-- 0027 · Organization projects (scoped workspaces with per-project membership)

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.organization_projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 128),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  visibility text not null default 'invited_only'
    check (visibility in ('invited_only')),
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create index organization_projects_org_idx
  on public.organization_projects (organization_id);

create table public.project_members (
  project_id uuid not null references public.organization_projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index project_members_user_idx on public.project_members (user_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function private.is_project_member(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.project_members pm
    where pm.project_id = p_project_id
      and pm.user_id = auth.uid()
  );
$$;

create or replace function private.is_project_owner(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.project_members pm
    where pm.project_id = p_project_id
      and pm.user_id = auth.uid()
      and pm.role = 'owner'
  );
$$;

create or replace function private.is_project_editor(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.project_members pm
    where pm.project_id = p_project_id
      and pm.user_id = auth.uid()
      and pm.role in ('owner', 'editor')
  );
$$;

grant execute on function private.is_project_member(uuid) to authenticated;
grant execute on function private.is_project_owner(uuid) to authenticated;
grant execute on function private.is_project_editor(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS (SELECT for project members only)
-- ---------------------------------------------------------------------------

alter table public.organization_projects enable row level security;
alter table public.project_members enable row level security;

grant select on public.organization_projects to authenticated;
grant select on public.project_members to authenticated;

drop policy if exists "org_projects_select_member" on public.organization_projects;
create policy "org_projects_select_member"
  on public.organization_projects
  for select
  to authenticated
  using (private.is_project_member(id));

drop policy if exists "project_members_select_member" on public.project_members;
create policy "project_members_select_member"
  on public.project_members
  for select
  to authenticated
  using (private.is_project_member(project_id));

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

create or replace function public.list_organization_projects(p_organization_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if not private.is_org_member(p_organization_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'organization_id', p.organization_id,
          'name', p.name,
          'slug', p.slug,
          'description', p.description,
          'visibility', p.visibility,
          'created_by', p.created_by,
          'created_at', p.created_at,
          'updated_at', p.updated_at
        )
        order by p.updated_at desc
      )
      from public.organization_projects p
      inner join public.project_members pm on pm.project_id = p.id
      where p.organization_id = p_organization_id
        and pm.user_id = auth.uid()
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.list_organization_projects(uuid) from public, anon;
grant execute on function public.list_organization_projects(uuid) to authenticated;

create or replace function public.create_organization_project(
  p_organization_id uuid,
  p_name text,
  p_slug text default null,
  p_description text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_name text := trim(p_name);
  v_slug text := nullif(trim(lower(coalesce(p_slug, p_name))), '');
  v_row public.organization_projects;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if not private.is_org_member(p_organization_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if char_length(v_name) < 1 then
    raise exception 'project name invalid' using errcode = '22023';
  end if;

  v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' then
    v_slug := 'project';
  end if;

  insert into public.organization_projects (
    organization_id,
    name,
    slug,
    description,
    created_by
  )
  values (
    p_organization_id,
    v_name,
    v_slug,
    nullif(trim(p_description), ''),
    auth.uid()
  )
  returning * into v_row;

  insert into public.project_members (project_id, user_id, role)
  values (v_row.id, auth.uid(), 'owner');

  return jsonb_build_object(
    'id', v_row.id,
    'organization_id', v_row.organization_id,
    'name', v_row.name,
    'slug', v_row.slug,
    'description', v_row.description,
    'visibility', v_row.visibility,
    'created_by', v_row.created_by,
    'created_at', v_row.created_at,
    'updated_at', v_row.updated_at
  );
end;
$$;

revoke all on function public.create_organization_project(uuid, text, text, text)
  from public, anon;
grant execute on function public.create_organization_project(uuid, text, text, text)
  to authenticated;

create or replace function public.update_organization_project(
  p_organization_id uuid,
  p_project_id uuid,
  p_name text default null,
  p_description text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_row public.organization_projects;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if not private.is_project_editor(p_project_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.organization_projects p
  set
    name = coalesce(nullif(trim(p_name), ''), p.name),
    description = case
      when p_description is null then p.description
      else nullif(trim(p_description), '')
    end,
    updated_at = now()
  where p.id = p_project_id
    and p.organization_id = p_organization_id
  returning * into v_row;

  if not found then
    raise exception 'project not found' using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'id', v_row.id,
    'organization_id', v_row.organization_id,
    'name', v_row.name,
    'slug', v_row.slug,
    'description', v_row.description,
    'visibility', v_row.visibility,
    'created_by', v_row.created_by,
    'created_at', v_row.created_at,
    'updated_at', v_row.updated_at
  );
end;
$$;

revoke all on function public.update_organization_project(uuid, uuid, text, text)
  from public, anon;
grant execute on function public.update_organization_project(uuid, uuid, text, text)
  to authenticated;

create or replace function public.delete_organization_project(
  p_organization_id uuid,
  p_project_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if not private.is_project_owner(p_project_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  delete from public.organization_projects p
  where p.id = p_project_id
    and p.organization_id = p_organization_id;

  if not found then
    raise exception 'project not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.delete_organization_project(uuid, uuid) from public, anon;
grant execute on function public.delete_organization_project(uuid, uuid) to authenticated;

create or replace function public.list_project_members(p_project_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if not private.is_project_member(p_project_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'project_id', pm.project_id,
          'user_id', pm.user_id,
          'email', u.email,
          'display_name', u.raw_user_meta_data ->> 'display_name',
          'role', pm.role,
          'created_at', pm.created_at
        )
        order by pm.created_at
      )
      from public.project_members pm
      inner join auth.users u on u.id = pm.user_id
      where pm.project_id = p_project_id
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.list_project_members(uuid) from public, anon;
grant execute on function public.list_project_members(uuid) to authenticated;

create or replace function public.add_project_member(
  p_organization_id uuid,
  p_project_id uuid,
  p_email text,
  p_role text
)
returns jsonb
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_email text := lower(trim(p_email));
  v_role text := trim(p_role);
  v_user_id uuid;
  v_row public.project_members;
  v_display_name text;
  v_user_email text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if not private.is_project_owner(p_project_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if v_role not in ('editor', 'viewer') then
    raise exception 'invalid project role' using errcode = '22023';
  end if;

  select om.user_id into v_user_id
  from public.organization_members om
  inner join auth.users u on u.id = om.user_id
  where om.organization_id = p_organization_id
    and lower(u.email) = v_email
  limit 1;

  if v_user_id is null then
    raise exception 'user not in organization' using errcode = 'P0002';
  end if;

  insert into public.project_members (project_id, user_id, role)
  values (p_project_id, v_user_id, v_role)
  on conflict (project_id, user_id) do update
    set role = excluded.role
  returning * into v_row;

  select u.email, u.raw_user_meta_data ->> 'display_name'
  into v_user_email, v_display_name
  from auth.users u
  where u.id = v_user_id;

  return jsonb_build_object(
    'project_id', v_row.project_id,
    'user_id', v_row.user_id,
    'email', v_user_email,
    'display_name', v_display_name,
    'role', v_row.role,
    'created_at', v_row.created_at
  );
end;
$$;

revoke all on function public.add_project_member(uuid, uuid, text, text)
  from public, anon;
grant execute on function public.add_project_member(uuid, uuid, text, text)
  to authenticated;

create or replace function public.update_project_member_role(
  p_organization_id uuid,
  p_project_id uuid,
  p_user_id uuid,
  p_role text
)
returns jsonb
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_role text := trim(p_role);
  v_row public.project_members;
  v_display_name text;
  v_user_email text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if not private.is_project_owner(p_project_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if v_role not in ('editor', 'viewer') then
    raise exception 'invalid project role' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.project_members
    where project_id = p_project_id
      and user_id = p_user_id
      and role = 'owner'
  ) then
    raise exception 'cannot change project owner role' using errcode = '22023';
  end if;

  update public.project_members pm
  set role = v_role
  where pm.project_id = p_project_id
    and pm.user_id = p_user_id
  returning * into v_row;

  if not found then
    raise exception 'member not found' using errcode = 'P0002';
  end if;

  select u.email, u.raw_user_meta_data ->> 'display_name'
  into v_user_email, v_display_name
  from auth.users u
  where u.id = p_user_id;

  return jsonb_build_object(
    'project_id', v_row.project_id,
    'user_id', v_row.user_id,
    'email', v_user_email,
    'display_name', v_display_name,
    'role', v_row.role,
    'created_at', v_row.created_at
  );
end;
$$;

revoke all on function public.update_project_member_role(uuid, uuid, uuid, text)
  from public, anon;
grant execute on function public.update_project_member_role(uuid, uuid, uuid, text)
  to authenticated;

create or replace function public.remove_project_member(
  p_organization_id uuid,
  p_project_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_owner_count integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if not private.is_project_owner(p_project_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.project_members
    where project_id = p_project_id
      and user_id = p_user_id
      and role = 'owner'
  ) then
    select count(*)::integer into v_owner_count
    from public.project_members
    where project_id = p_project_id
      and role = 'owner';

    if v_owner_count <= 1 then
      raise exception 'cannot remove last project owner' using errcode = '22023';
    end if;
  end if;

  delete from public.project_members pm
  where pm.project_id = p_project_id
    and pm.user_id = p_user_id;

  if not found then
    raise exception 'member not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.remove_project_member(uuid, uuid, uuid)
  from public, anon;
grant execute on function public.remove_project_member(uuid, uuid, uuid)
  to authenticated;
