-- Every mutating endpoint from the Express prototype, ported 1:1 as a
-- SECURITY DEFINER Postgres function. The frontend calls these via
-- supabase.rpc('function_name', {...}) instead of POST/PUT REST calls.
-- Table grants (0006) block direct INSERT/UPDATE/DELETE, so these
-- functions are the *only* way to mutate business data — same effect as
-- "only the Express routes can touch the JSON file."

create or replace function current_profile()
returns profiles language sql stable as $$
  select * from profiles where id = auth.uid();
$$;

-- === requirements.js: POST /requirements ===================================
create or replace function submit_requirement(
  p_subject text,
  p_mode text,
  p_consent boolean,
  p_location text default null,
  p_schedule_pref text default null,
  p_pricing_type text default null,
  p_budget numeric default null,
  p_preferred_teacher_gender text default null,
  p_student_id text default null,       -- pass to enroll an EXISTING student in another subject
  p_student_name text default null,     -- pass (with age_grade) to register a NEW student
  p_age_grade text default null,
  p_age int default null,
  p_gender text default null,
  p_address text default null,
  p_area_city text default null,
  p_pincode text default null,
  p_whatsapp text default null,
  p_notes text default null,
  p_prior_tutoring_experience text default null
)
returns requirements
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_student students;
  v_req requirements;
  v_count int;
begin
  if me.role <> 'PARENT' then raise exception 'Only parents can submit requirements'; end if;
  if not p_consent then raise exception 'Consent to be contacted is required'; end if;
  if p_subject is null or p_mode is null then raise exception 'Subject and mode are required'; end if;

  if p_student_id is not null then
    v_student := find_student(p_student_id, me.id);
    if v_student.id is null then raise exception 'Student not found for your account'; end if;
    update students set
      address = coalesce(p_address, address),
      area_city = coalesce(p_area_city, area_city),
      pincode = coalesce(p_pincode, pincode),
      whatsapp = coalesce(p_whatsapp, whatsapp),
      notes = coalesce(p_notes, notes),
      prior_tutoring_experience = coalesce(p_prior_tutoring_experience, prior_tutoring_experience)
    where id = v_student.id
    returning * into v_student;
  elsif p_student_name is not null or p_age_grade is not null then
    select count(*) into v_count from students where parent_id = me.id;
    if v_count >= 4 then
      raise exception 'You can register up to 4 students per parent account. To add a subject for an existing student instead, pass their Student ID.';
    end if;
    insert into students (display_id, parent_id, student_name, age_grade, age, gender, address, area_city, pincode, whatsapp, notes, prior_tutoring_experience)
    values (next_daily_id('student_daily', 'FMSTU'), me.id, p_student_name, p_age_grade, p_age, p_gender, p_address, p_area_city, p_pincode, p_whatsapp, p_notes, p_prior_tutoring_experience)
    returning * into v_student;
  end if;

  insert into requirements (display_id, parent_id, student_id, subject, mode, location, schedule_pref, pricing_type, budget, preferred_teacher_gender)
  values (next_daily_id('requirement_daily', 'FMREQ'), me.id, v_student.id, p_subject, p_mode, p_location, p_schedule_pref, p_pricing_type, p_budget, p_preferred_teacher_gender)
  returning * into v_req;

  return v_req;
end;
$$;

-- === teachers.js: PUT /teachers/me =========================================
create or replace function upsert_teacher_profile(
  p_qualification text default null,
  p_experience text default null,
  p_subjects text[] default null,
  p_preferred_locations text[] default null,
  p_teaching_mode text default null,
  p_availability text[] default null,
  p_time_slot text default null,        -- single-slot dropdown shorthand for availability
  p_rate_expectation numeric default null,
  p_bank_upi_ref text default null,
  p_address text default null,
  p_area_city text default null,
  p_pincode text default null,
  p_whatsapp text default null
)
returns teacher_profiles
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_profile teacher_profiles;
  v_availability text[] := coalesce(p_availability, case when p_time_slot is not null then array[p_time_slot] else '{}'::text[] end);
begin
  if me.role <> 'TEACHER' then raise exception 'Teacher only'; end if;

  select * into v_profile from teacher_profiles where user_id = me.id;

  if v_profile.id is null then
    insert into teacher_profiles (display_id, user_id, qualification, experience, subjects, preferred_locations, teaching_mode, availability, rate_expectation, bank_upi_ref, address, area_city, pincode, whatsapp, kyc_status)
    values (me.display_id, me.id, p_qualification, p_experience, coalesce(p_subjects, '{}'), coalesce(p_preferred_locations, '{}'), p_teaching_mode, v_availability, p_rate_expectation, p_bank_upi_ref, p_address, p_area_city, p_pincode, p_whatsapp, 'PENDING')
    returning * into v_profile;
  else
    update teacher_profiles set
      qualification = coalesce(p_qualification, qualification),
      experience = coalesce(p_experience, experience),
      subjects = case when p_subjects is not null and array_length(p_subjects, 1) > 0 then p_subjects else subjects end,
      preferred_locations = case when p_preferred_locations is not null and array_length(p_preferred_locations, 1) > 0 then p_preferred_locations else preferred_locations end,
      teaching_mode = coalesce(p_teaching_mode, teaching_mode),
      availability = case when array_length(v_availability, 1) > 0 then v_availability else availability end,
      rate_expectation = coalesce(p_rate_expectation, rate_expectation),
      bank_upi_ref = coalesce(p_bank_upi_ref, bank_upi_ref),
      address = coalesce(p_address, address),
      area_city = coalesce(p_area_city, area_city),
      pincode = coalesce(p_pincode, pincode),
      whatsapp = coalesce(p_whatsapp, whatsapp)
    where id = v_profile.id
    returning * into v_profile;
  end if;

  return v_profile;
end;
$$;

-- === matches.js: POST /matches =============================================
create or replace function create_match(p_requirement_id text, p_teacher_id text, p_match_score numeric default null)
returns matches
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_req requirements;
  v_teacher teacher_profiles;
  v_seq record;
  v_match matches;
begin
  if me.role <> 'ADMIN' then raise exception 'Admin only'; end if;

  v_req := find_requirement(p_requirement_id);
  if v_req.id is null then raise exception 'Requirement not found'; end if;
  v_teacher := find_teacher(p_teacher_id);
  if v_teacher.id is null then raise exception 'Teacher profile not found'; end if;

  select * into v_seq from next_match_seq();

  insert into matches (id_year, id_seq, requirement_id, teacher_id, match_score, status)
  values (v_seq.id_year, v_seq.id_seq, v_req.id, v_teacher.id, p_match_score, 'PROPOSED')
  returning * into v_match;

  return v_match;
end;
$$;

-- === matches.js: PUT /matches/:id/propose-demo =============================
create or replace function propose_demo(p_match_id text, p_date date, p_time_slot text default null)
returns matches
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_match matches;
  v_clash matches;
begin
  if me.role <> 'ADMIN' then raise exception 'Admin only'; end if;
  if p_date is null then raise exception 'date is required'; end if;

  v_match := find_match(p_match_id);
  if v_match.id is null then raise exception 'Match not found'; end if;
  if v_match.status <> 'PROPOSED' then
    raise exception 'Cannot propose a demo from status %', v_match.status;
  end if;

  if p_time_slot is not null then
    select * into v_clash from matches m
    where m.id <> v_match.id
      and m.teacher_id = v_match.teacher_id
      and m.status in ('DEMO_PROPOSED', 'DEMO_SCHEDULED', 'CONFIRMED')
      and m.demo_date = p_date
      and m.demo_time_slot = p_time_slot
    limit 1;

    if v_clash.id is not null then
      raise exception 'This teacher already has % booked on % in the "%" slot. Pick a different date/slot or a different teacher.',
        match_display_id(v_clash), p_date, p_time_slot;
    end if;
  end if;

  update matches set
    status = 'DEMO_PROPOSED',
    demo_date = p_date,
    demo_time_slot = p_time_slot,
    demo_proposed_at = now(),
    parent_accepted_demo = false,
    teacher_accepted_demo = false
  where id = v_match.id
  returning * into v_match;

  return v_match;
end;
$$;

-- === matches.js: PUT /matches/:id/accept-demo ===============================
create or replace function accept_demo(p_match_id text)
returns matches
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_match matches;
  v_req requirements;
  v_teacher teacher_profiles;
begin
  if me.role not in ('PARENT', 'TEACHER') then raise exception 'Not authorized'; end if;

  v_match := find_match(p_match_id);
  if v_match.id is null then raise exception 'Match not found'; end if;
  if v_match.status not in ('DEMO_PROPOSED', 'DEMO_SCHEDULED') then
    raise exception 'No demo awaiting response (status: %)', v_match.status;
  end if;

  if me.role = 'PARENT' then
    select r.* into v_req from requirements r where r.id = v_match.requirement_id;
    if v_req.id is null or v_req.parent_id <> me.id then raise exception 'Not your requirement'; end if;
    update matches set parent_accepted_demo = true where id = v_match.id returning * into v_match;
  else
    select t.* into v_teacher from teacher_profiles t where t.user_id = me.id;
    if v_teacher.id is null or v_match.teacher_id <> v_teacher.id then raise exception 'Not your match'; end if;
    update matches set teacher_accepted_demo = true where id = v_match.id returning * into v_match;
  end if;

  if v_match.parent_accepted_demo and v_match.teacher_accepted_demo and v_match.status = 'DEMO_PROPOSED' then
    update matches set status = 'DEMO_SCHEDULED', scheduled_at = now() where id = v_match.id returning * into v_match;
  end if;

  return v_match;
end;
$$;

-- === matches.js: PUT /matches/:id/decline-demo ==============================
create or replace function decline_demo(p_match_id text, p_reason text default null)
returns matches
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_match matches;
  v_req requirements;
  v_teacher teacher_profiles;
  v_frozen text;
begin
  if me.role not in ('PARENT', 'TEACHER') then raise exception 'Not authorized'; end if;

  v_match := find_match(p_match_id);
  if v_match.id is null then raise exception 'Match not found'; end if;
  if v_match.status not in ('DEMO_PROPOSED', 'DEMO_SCHEDULED') then
    raise exception 'No demo awaiting response (status: %)', v_match.status;
  end if;

  if me.role = 'PARENT' then
    select r.* into v_req from requirements r where r.id = v_match.requirement_id;
    if v_req.id is null or v_req.parent_id <> me.id then raise exception 'Not your requirement'; end if;
  else
    select t.* into v_teacher from teacher_profiles t where t.user_id = me.id;
    if v_teacher.id is null or v_match.teacher_id <> v_teacher.id then raise exception 'Not your match'; end if;
  end if;

  v_frozen := match_display_id(v_match); -- freeze BEFORE status flips, same as the original

  update matches set
    frozen_display_id = v_frozen,
    status = 'DECLINED',
    dead = true,
    declined_by = me.role::text,
    decline_reason = p_reason
  where id = v_match.id
  returning * into v_match;

  return v_match;
end;
$$;

-- === matches.js: PUT /matches/:id/approve-teacher ===========================
create or replace function approve_teacher(p_match_id text)
returns matches
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_match matches;
  v_req requirements;
begin
  if me.role <> 'PARENT' then raise exception 'Not authorized'; end if;

  v_match := find_match(p_match_id);
  if v_match.id is null then raise exception 'Match not found'; end if;

  select r.* into v_req from requirements r where r.id = v_match.requirement_id;
  if v_req.id is null or v_req.parent_id <> me.id then raise exception 'Not your requirement'; end if;
  if v_match.status <> 'DEMO_SCHEDULED' then
    raise exception 'Cannot approve from status % — demo must be scheduled first', v_match.status;
  end if;

  update matches set status = 'CONFIRMED', parent_approved_at = now() where id = v_match.id returning * into v_match;
  update requirements set status = 'assigned' where id = v_req.id;

  return v_match;
end;
$$;

-- === attendance.js: POST /attendance/sessions ===============================
create or replace function log_session(p_match_id text, p_date date, p_time_slot text default null, p_amount numeric default null)
returns class_sessions
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_match matches;
  v_teacher teacher_profiles;
  v_session class_sessions;
begin
  if me.role <> 'TEACHER' then raise exception 'Teacher only'; end if;
  if p_match_id is null or p_date is null then raise exception 'matchId and date are required'; end if;

  v_match := find_match(p_match_id);
  if v_match.id is null then raise exception 'Match not found'; end if;

  select t.* into v_teacher from teacher_profiles t where t.user_id = me.id;
  if v_teacher.id is null or v_match.teacher_id <> v_teacher.id then raise exception 'Not your match'; end if;
  if v_match.status <> 'CONFIRMED' then
    raise exception 'Match must be CONFIRMED (an FMAPPROVED... ID) before logging classes';
  end if;

  insert into class_sessions (display_id, match_id, date, time_slot, amount)
  values (next_daily_id('attendance_daily', 'FMATTEND'), v_match.id, p_date, p_time_slot, p_amount)
  returning * into v_session;

  return v_session;
end;
$$;

-- === attendance.js: PUT /attendance/sessions/:id/confirm ====================
create or replace function confirm_session(p_session_id text)
returns class_sessions
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_session class_sessions;
  v_match matches;
  v_req requirements;
begin
  if me.role <> 'PARENT' then raise exception 'Parent only'; end if;

  v_session := find_session(p_session_id);
  if v_session.id is null then raise exception 'Session not found'; end if;

  select * into v_match from matches where id = v_session.match_id;
  select * into v_req from requirements where id = v_match.requirement_id;
  if v_req.id is null or v_req.parent_id <> me.id then raise exception 'Not your class session'; end if;
  if v_session.status <> 'LOGGED' then raise exception 'Cannot confirm from status %', v_session.status; end if;

  update class_sessions set status = 'PARENT_CONFIRMED', parent_confirmed_at = now()
  where id = v_session.id returning * into v_session;

  return v_session;
end;
$$;

-- === attendance.js: PUT /attendance/sessions/:id/dispute ====================
create or replace function dispute_session(p_session_id text, p_reason text default null)
returns class_sessions
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_session class_sessions;
  v_match matches;
  v_req requirements;
begin
  if me.role <> 'PARENT' then raise exception 'Parent only'; end if;

  v_session := find_session(p_session_id);
  if v_session.id is null then raise exception 'Session not found'; end if;

  select * into v_match from matches where id = v_session.match_id;
  select * into v_req from requirements where id = v_match.requirement_id;
  if v_req.id is null or v_req.parent_id <> me.id then raise exception 'Not your class session'; end if;

  update class_sessions set status = 'DISPUTED', disputed_at = now(), dispute_reason = p_reason
  where id = v_session.id returning * into v_session;

  return v_session;
end;
$$;

-- === attendance.js: PUT /attendance/sessions/:id/validate ===================
create or replace function validate_session(p_session_id text)
returns class_sessions
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_session class_sessions;
begin
  if me.role <> 'ADMIN' then raise exception 'Admin only'; end if;

  v_session := find_session(p_session_id);
  if v_session.id is null then raise exception 'Session not found'; end if;
  if v_session.status <> 'PARENT_CONFIRMED' then
    raise exception 'Session must be PARENT_CONFIRMED before admin validation';
  end if;

  update class_sessions set status = 'ADMIN_VALIDATED', admin_validated_at = now()
  where id = v_session.id returning * into v_session;

  return v_session;
end;
$$;

-- === attendance.js: POST /attendance/payouts =================================
create or replace function release_payout(
  p_teacher_id text default null,
  p_match_id text default null,     -- pass instead of teacher_id; teacher is resolved from the match
  p_period text default null,
  p_commission_percent numeric default 0
)
returns payouts
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_teacher teacher_profiles;
  v_match matches;
  v_gross numeric;
  v_commission numeric;
  v_payout payouts;
  v_session_ids uuid[];
begin
  if me.role <> 'ADMIN' then raise exception 'Admin only'; end if;

  if p_teacher_id is null and p_match_id is not null then
    v_match := find_match(p_match_id);
    if v_match.id is null then raise exception 'Match not found for that ID'; end if;
    p_teacher_id := v_match.teacher_id::text;
  end if;
  if p_teacher_id is null then
    raise exception 'Provide teacherId, or a matchId (FMAPPROVED...) to resolve it automatically';
  end if;

  v_teacher := find_teacher(p_teacher_id);
  if v_teacher.id is null then raise exception 'Teacher profile not found'; end if;
  if v_teacher.bank_upi_ref is null then
    raise exception 'Teacher has no bank/UPI details on file — cannot release payout until they add one';
  end if;

  select array_agg(s.id), coalesce(sum(s.amount), 0)
  into v_session_ids, v_gross
  from class_sessions s
  join matches m on m.id = s.match_id
  where m.teacher_id = v_teacher.id and s.status = 'ADMIN_VALIDATED' and s.payout_id is null;

  if v_session_ids is null or array_length(v_session_ids, 1) is null then
    raise exception 'No validated, unpaid sessions for this teacher';
  end if;

  v_commission := round(v_gross * (p_commission_percent / 100));

  insert into payouts (teacher_id, period, gross_amount, commission_percent, commission_deducted, amount, bank_upi_ref, status, released_at)
  values (v_teacher.id, p_period, v_gross, p_commission_percent, v_commission, v_gross - v_commission, v_teacher.bank_upi_ref, 'RELEASED', now())
  returning * into v_payout;

  update class_sessions set payout_id = v_payout.id where id = any(v_session_ids);

  return v_payout;
end;
$$;

-- === KYC: teacher records where their uploaded ID document landed =========
-- Called right after a successful upload to the private kyc-documents
-- storage bucket (see 0007_kyc_storage.sql). Resets status to PENDING so a
-- re-upload (e.g. after a rejection) goes back through admin review.
create or replace function set_kyc_document(p_path text)
returns teacher_profiles
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_profile teacher_profiles;
begin
  if me.role <> 'TEACHER' then raise exception 'Teacher only'; end if;

  update teacher_profiles
  set kyc_document_path = p_path, kyc_status = 'PENDING'
  where user_id = me.id
  returning * into v_profile;

  if v_profile.id is null then raise exception 'Complete your teacher profile before uploading KYC documents'; end if;
  return v_profile;
end;
$$;

-- === KYC: admin approves or rejects a teacher's submitted ID document =====
create or replace function set_teacher_kyc_status(p_teacher_id text, p_status text)
returns teacher_profiles
language plpgsql security definer set search_path = public as $$
declare
  me profiles := current_profile();
  v_teacher teacher_profiles;
begin
  if me.role <> 'ADMIN' then raise exception 'Admin only'; end if;
  if p_status not in ('APPROVED', 'REJECTED', 'PENDING') then
    raise exception 'Status must be APPROVED, REJECTED, or PENDING';
  end if;

  v_teacher := find_teacher(p_teacher_id);
  if v_teacher.id is null then raise exception 'Teacher profile not found'; end if;

  update teacher_profiles set kyc_status = p_status where id = v_teacher.id returning * into v_teacher;
  return v_teacher;
end;
$$;
