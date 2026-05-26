-- Block invites when Stripe subscription is past_due or unpaid.

create or replace function public.invite_organization_member(
  p_organization_id uuid,
  p_email text,
  p_role text default 'member'
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text := lower(trim(p_email));
  v_role text := lower(trim(p_role));
  v_inviter uuid := auth.uid();
  v_user_id uuid;
  v_member public.organization_members;
begin
  if v_inviter is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if not private.is_org_admin(p_organization_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if exists (
    select 1
      from public.organization_billing b
     where b.organization_id = p_organization_id
       and b.provider = 'stripe'
       and b.subscription_status in ('past_due', 'unpaid')
  ) then
    raise exception 'billing payment past due' using errcode = 'P0001';
  end if;

  if v_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    raise exception 'invalid invite email' using errcode = '22023';
  end if;

  if v_role not in ('admin', 'member') then
    raise exception 'invalid member role' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.organization_invitations i
     where i.organization_id = p_organization_id and i.email = v_email
  ) then
    raise exception 'invite conflict' using errcode = '23505';
  end if;

  select u.id into v_user_id
    from auth.users u
   where lower(u.email) = v_email
   limit 1;

  if v_user_id is not null then
    if exists (
      select 1 from public.organization_members m
       where m.organization_id = p_organization_id and m.user_id = v_user_id
    ) then
      raise exception 'invite conflict' using errcode = '23505';
    end if;

    perform private.assert_org_seat_available(p_organization_id);

    insert into public.organization_members (organization_id, user_id, role)
    values (p_organization_id, v_user_id, v_role)
    returning * into v_member;

    return jsonb_build_object(
      'kind', 'member',
      'organization_id', v_member.organization_id,
      'user_id', v_member.user_id,
      'role', v_member.role,
      'email', v_email,
      'status', 'active'
    );
  end if;

  perform private.assert_org_seat_available(p_organization_id);

  insert into public.organization_invitations (organization_id, email, role, invited_by)
  values (p_organization_id, v_email, v_role, v_inviter);

  return jsonb_build_object(
    'kind', 'invitation',
    'organization_id', p_organization_id,
    'email', v_email,
    'role', v_role,
    'status', 'invited'
  );
end;
$$;
