-- Lets a logged-in parent or tutor submit their own testimonial from the
-- homepage "Share your story" tile. Submissions land as PENDING and stay
-- completely invisible to testimonials_public() (which only ever selects
-- VISIBLE) until an admin reviews and approves them via the existing
-- upsert_testimonial() status change — same moderation pattern already
-- used for Academy enrollments, so nothing fake or spammy reaches the
-- public homepage untouched.

alter table testimonials drop constraint if exists testimonials_status_check;
alter table testimonials add constraint testimonials_status_check
  check (status in ('PENDING', 'VISIBLE', 'DISABLED', 'REMOVED'));

alter table testimonials add column if not exists submitted_by uuid references profiles(id);

-- === Parent/Tutor: submit a testimonial for review =========================
create or replace function submit_testimonial(
  p_quote text,
  p_author_name text,
  p_author_role text default null,
  p_rating int default 5
)
returns testimonials
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_testimonial testimonials;
begin
  if me.role not in ('PARENT', 'TEACHER') then
    raise exception 'Only parents and tutors with an account can submit a testimonial';
  end if;
  if p_quote is null or trim(p_quote) = '' then raise exception 'Quote is required'; end if;
  if p_author_name is null or trim(p_author_name) = '' then raise exception 'Display name is required'; end if;
  if p_rating < 1 or p_rating > 5 then raise exception 'Rating must be between 1 and 5'; end if;

  insert into testimonials (display_id, author_name, author_role, quote, rating, status, submitted_by)
  values (
    next_daily_id('testimonial_daily', 'FMTESTI'), trim(p_author_name), nullif(trim(coalesce(p_author_role, '')), ''),
    trim(p_quote), p_rating, 'PENDING', me.id
  )
  returning * into v_testimonial;

  return v_testimonial;
end;
$$;

-- === Admin: full testimonial list, PENDING first, REMOVED last =============
create or replace function admin_testimonials()
returns setof testimonials
language plpgsql security definer set search_path = public as $$
declare me profiles := current_profile();
begin
  if me.role <> 'ADMIN' then raise exception 'Admin only'; end if;

  return query
    select * from testimonials
    order by
      case status
        when 'PENDING' then 0
        when 'VISIBLE' then 1
        when 'DISABLED' then 2
        when 'REMOVED' then 3
      end,
      display_order, created_at;
end;
$$;

revoke execute on all functions in schema public from public;
grant execute on all functions in schema public to authenticated;
