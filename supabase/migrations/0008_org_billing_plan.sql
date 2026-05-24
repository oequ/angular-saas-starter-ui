-- 0008 · Plan id on organizations + billing snapshot / plan update RPCs

alter table public.organizations
  add column if not exists plan_id text not null default 'free'
  check (plan_id in ('free', 'pro', 'team'));

comment on column public.organizations.plan_id is
  'Commercial plan tier; drives organizations.seats_limit via seat_limit_for_plan.';

-- ---------------------------------------------------------------------------
-- Plan → seat cap (aligned with libs/ports billing.utils DEFAULT_SEAT_LIMIT_BY_PLAN)
-- ---------------------------------------------------------------------------

create or replace function private.seat_limit_for_plan(p_plan_id text)
returns integer
language sql
immutable
as $$
  select case lower(trim(p_plan_id))
    when 'free' then 3
    when 'pro' then 10
    when 'team' then 50
    else 3
  end;
$$;

-- ---------------------------------------------------------------------------
-- Read billing snapshot (members + plan cap from Postgres)
-- ---------------------------------------------------------------------------

create or replace function public.get_organization_billing_snapshot(p_organization_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  v_row public.organizations;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if not private.is_org_member(p_organization_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into v_row
    from public.organizations o
   where o.id = p_organization_id;

  if v_row.id is null then
    raise exception 'organization not found' using errcode = '22023';
  end if;

  return jsonb_build_object(
    'plan_id', v_row.plan_id,
    'seats_limit', v_row.seats_limit,
    'seats_used', private.org_seats_used(p_organization_id)
  );
end;
$$;

revoke all on function public.get_organization_billing_snapshot(uuid) from public, anon;
grant execute on function public.get_organization_billing_snapshot(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Update plan (admin) — sync seats_limit with plan tier
-- ---------------------------------------------------------------------------

create or replace function public.update_organization_plan(
  p_organization_id uuid,
  p_plan_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_plan_id text := lower(trim(p_plan_id));
  v_row public.organizations;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if not private.is_org_admin(p_organization_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if v_plan_id not in ('free', 'pro', 'team') then
    raise exception 'invalid plan id' using errcode = '22023';
  end if;

  update public.organizations o
     set plan_id = v_plan_id,
         seats_limit = private.seat_limit_for_plan(v_plan_id)
   where o.id = p_organization_id
   returning * into v_row;

  if v_row.id is null then
    raise exception 'organization not found' using errcode = '22023';
  end if;

  return jsonb_build_object(
    'plan_id', v_row.plan_id,
    'seats_limit', v_row.seats_limit,
    'seats_used', private.org_seats_used(p_organization_id)
  );
end;
$$;

revoke all on function public.update_organization_plan(uuid, text) from public, anon;
grant execute on function public.update_organization_plan(uuid, text) to authenticated;
