-- Admin-assisted password reset. For when a parent/tutor can't complete
-- the normal self-service "forgot password" email flow (e.g. SMTP is down
-- or rate-limited) and reaches out via WhatsApp/phone instead. The admin
-- verifies the caller's identity on the call (name, email, phone match
-- what's on file — already visible in ManageUsers), then issues a temp
-- password from the admin dashboard. The auth password itself is set via
-- the service-role Admin API in the Next.js route (Postgres can't touch
-- auth.users) — this migration only adds the "must set a real password
-- before doing anything else" flag and the two RPCs that flip it.

alter table profiles add column if not exists must_change_password boolean not null default false;

-- Called by the admin route right after auth.admin.updateUserById() sets
-- the temp password, so the account is flagged before the caller ever
-- gets a chance to log in with it.
create or replace function admin_flag_password_reset(p_profile_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare me profiles := current_profile();
begin
  if me.role <> 'ADMIN' then raise exception 'Admin only'; end if;
  update profiles set must_change_password = true where id = p_profile_id;
end;
$$;

-- Called by the user themselves, right after they set their own permanent
-- password on /set-new-password — clears the flag so future logins go
-- straight to their dashboard as normal.
create or replace function clear_must_change_password()
returns void
language plpgsql security definer set search_path = public as $$
declare me profiles := current_profile();
begin
  update profiles set must_change_password = false where id = me.id;
end;
$$;

revoke execute on all functions in schema public from public;
grant execute on all functions in schema public to authenticated;
