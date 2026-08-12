-- Admin-managed testimonials shown on the homepage, right after Learning
-- Categories (app/components/Testimonials.tsx). Same shape as
-- 0034_partners.sql: a status-gated table, a public read RPC, an admin
-- CRUD RPC. No storage bucket needed here — these are text cards, not
-- uploaded images.
--
-- Same three statuses as partners:
--   VISIBLE  — shown on the public site.
--   DISABLED — hidden from the public site, stays in place in the admin
--              list (a temporary pause, not a removal).
--   REMOVED  — hidden from the public site AND sorted to the very end of
--              the admin list (soft-delete, not a hard delete).

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  display_id text unique not null,
  author_name text not null,
  author_role text,
  quote text not null,
  rating int not null default 5 check (rating between 1 and 5),
  status text not null default 'VISIBLE' check (status in ('VISIBLE', 'DISABLED', 'REMOVED')),
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table testimonials enable row level security;
revoke all on testimonials from authenticated, anon;

-- Draft/illustrative seed content so the section isn't empty on launch —
-- grounded in real platform mechanics (KYC, attendance confirmation,
-- Community Pooling, the referral program) rather than generic praise,
-- and following the same "Parent of <child's first name>" anonymized
-- attribution the real teacher_reviews already use on Teacher/profile.
-- These are placeholders for the founder to review and swap for real
-- quotes from the new Testimonials admin tab — not claimed as real.
insert into testimonials (display_id, author_name, author_role, quote, rating, display_order)
values
  (next_daily_id('testimonial_daily', 'FMTESTI'), 'Parent of Aadhya', 'Parent, Chennai',
   'Future Minds matched us with a tutor within days, and their team coordinated the whole demo class for us. No back-and-forth, no confusion — just a good fit for my daughter.', 5, 1),
  (next_daily_id('testimonial_daily', 'FMTESTI'), 'Parent of Rohan', 'Parent, Coimbatore',
   'What I liked most was the KYC verification — knowing every tutor is checked before they ever meet my son gave me real peace of mind.', 5, 2),
  (next_daily_id('testimonial_daily', 'FMTESTI'), 'Anitha K.', 'Mathematics Tutor',
   'I did not have to chase for students or negotiate fees myself — Future Minds handled the matching, and I could just focus on teaching.', 5, 3),
  (next_daily_id('testimonial_daily', 'FMTESTI'), 'Parent of Meera', 'Parent, Vellore',
   'The attendance tracking means I never have to just take someone''s word for it — I confirm every class myself before payment goes through.', 5, 4),
  (next_daily_id('testimonial_daily', 'FMTESTI'), 'Karthik S.', 'Music Tutor',
   'Community Pooling let me teach a full batch of students from the same apartment complex — steady income without ten separate one-to-one families to manage.', 5, 5),
  (next_daily_id('testimonial_daily', 'FMTESTI'), 'Deepa R.', 'Soft Skills Tutor',
   'The referral program is a nice touch — a parent I taught referred another family, and I actually got credited for it automatically.', 5, 6);

-- === Public: homepage testimonials section (signed-out too) ===============
create or replace function testimonials_public()
returns table (id uuid, author_name text, author_role text, quote text, rating int)
language sql security definer set search_path = public as $$
  select id, author_name, author_role, quote, rating
  from testimonials
  where status = 'VISIBLE'
  order by display_order, created_at;
$$;

-- === Admin: full testimonial list (any status), REMOVED sorted last =======
create or replace function admin_testimonials()
returns setof testimonials
language plpgsql security definer set search_path = public as $$
declare me profiles := current_profile();
begin
  if me.role <> 'ADMIN' then raise exception 'Admin only'; end if;

  return query
    select * from testimonials
    order by (status = 'REMOVED'), display_order, created_at;
end;
$$;

-- === Admin: create/update a testimonial ====================================
create or replace function upsert_testimonial(
  p_id text default null,
  p_author_name text default null,
  p_author_role text default null,
  p_quote text default null,
  p_rating int default null,
  p_status text default null,
  p_display_order int default null
)
returns testimonials
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_testimonial testimonials;
begin
  if me.role <> 'ADMIN' then raise exception 'Admin only'; end if;
  if p_status is not null and p_status not in ('VISIBLE', 'DISABLED', 'REMOVED') then
    raise exception 'Invalid status';
  end if;
  if p_rating is not null and (p_rating < 1 or p_rating > 5) then
    raise exception 'Rating must be between 1 and 5';
  end if;

  if p_id is not null then
    select * into v_testimonial from testimonials where id::text = p_id or display_id = p_id;
  end if;

  if v_testimonial.id is null then
    if p_author_name is null or trim(p_author_name) = '' then raise exception 'Author name is required'; end if;
    if p_quote is null or trim(p_quote) = '' then raise exception 'Quote is required'; end if;
    insert into testimonials (display_id, author_name, author_role, quote, rating, status, display_order)
    values (
      next_daily_id('testimonial_daily', 'FMTESTI'), trim(p_author_name), p_author_role, trim(p_quote),
      coalesce(p_rating, 5), coalesce(p_status, 'VISIBLE'), coalesce(p_display_order, 0)
    )
    returning * into v_testimonial;
  else
    update testimonials set
      author_name = coalesce(p_author_name, author_name),
      author_role = coalesce(p_author_role, author_role),
      quote = coalesce(p_quote, quote),
      rating = coalesce(p_rating, rating),
      status = coalesce(p_status, status),
      display_order = coalesce(p_display_order, display_order)
    where id = v_testimonial.id
    returning * into v_testimonial;
  end if;

  return v_testimonial;
end;
$$;

revoke execute on all functions in schema public from public;
grant execute on all functions in schema public to authenticated;

grant execute on function testimonials_public() to anon;
