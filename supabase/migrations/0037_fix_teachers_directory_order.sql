-- admin_teachers_directory() has never had an ORDER BY, so Postgres is free
-- to return the teacher rows in a different order on every call (rows can
-- shift position after any UPDATE touches the profiles/teacher_profiles
-- heap, including the status update this very RPC is used to trigger from
-- ManageUsers.tsx). The admin Manage Users teacher table refetches after
-- every status change, so with no ordering the table would reshuffle and
-- the row the admin just changed could reappear at a different position —
-- looking exactly like the status change "jumped" to the wrong teacher,
-- even though the correct teacher (matched by user_id) was always updated.
-- Fix: order deterministically, same as admin_parents_directory() already
-- does with p.created_at desc.

create or replace function admin_teachers_directory(p_subject text default null)
returns table (
  id uuid, display_id text, name text, phone text, email text, qualification text,
  experience text, subjects text[], preferred_locations text[], teaching_mode text[],
  availability text[], schedule_pref text, time_preference text, rate_expectation numeric,
  bank_upi_ref text, kyc_status text, kyc_document_path text, photo_url text,
  tutoring_for text[], boards text[], rating numeric,
  languages jsonb,
  total_hours numeric, students_trained int, active_batches int,
  rating_avg numeric, rating_count int,
  user_id uuid, status entity_status
)
language plpgsql security definer set search_path = public as $$
declare me profiles := current_profile();
begin
  if me.role <> 'ADMIN' then raise exception 'Admin only'; end if;
  perform _recompute_all_statuses();

  return query
  select t.id, t.display_id, u.name, u.phone, u.email, t.qualification, t.experience,
    t.subjects, t.preferred_locations, t.teaching_mode, t.availability, t.schedule_pref, t.time_preference, t.rate_expectation,
    t.bank_upi_ref, t.kyc_status, t.kyc_document_path, t.photo_url,
    t.tutoring_for, t.boards, t.rating,
    coalesce(
      (select jsonb_agg(jsonb_build_object('language', tl.language, 'can_read', tl.can_read, 'can_write', tl.can_write, 'can_speak', tl.can_speak))
       from teacher_languages tl where tl.teacher_id = t.id),
      '[]'::jsonb
    ),
    coalesce((select sum(cs.duration_hours) from class_sessions cs join matches m on m.id = cs.match_id where m.teacher_id = t.id and cs.status <> 'DISPUTED'), 0),
    coalesce((select count(distinct r.student_id) from matches m join requirements r on r.id = m.requirement_id where m.teacher_id = t.id and m.status = 'CONFIRMED'), 0)::int,
    coalesce((select count(*) from matches m where m.teacher_id = t.id and m.status = 'CONFIRMED'), 0)::int,
    (select round(avg(tr.rating), 1) from teacher_reviews tr where tr.teacher_id = t.id),
    coalesce((select count(*) from teacher_reviews tr where tr.teacher_id = t.id), 0)::int,
    u.id, u.status
  from teacher_profiles t
  join profiles u on u.id = t.user_id
  where p_subject is null or p_subject = any(t.subjects)
  order by u.created_at desc;
end;
$$;

revoke execute on all functions in schema public from public;
grant execute on all functions in schema public to authenticated;
