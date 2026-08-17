-- The ₹500–₹12,000 budget slider and 6-digit pincode format were only
-- enforced client-side in find-tutor's form — a direct RPC call could
-- submit a negative or absurd budget, which then feeds the admin's
-- 20%-of-budget one-time fee auto-calculation in MatchModal. Re-validating
-- here closes that off for every entry point (parent self-service, admin
-- on-behalf-of registration) since both funnel through this one function.

create or replace function _submit_requirement_for(
  p_parent_id uuid,
  p_subject text,
  p_mode text[],
  p_location text default null,
  p_schedule_pref text default null,
  p_pricing_type text default null,
  p_budget numeric default null,
  p_preferred_teacher_gender text default null,
  p_student_id text default null,
  p_student_name text default null,
  p_age_grade text default null,
  p_age int default null,
  p_gender text default null,
  p_address text default null,
  p_area_city text default null,
  p_pincode text default null,
  p_whatsapp text default null,
  p_notes text default null,
  p_prior_tutoring_experience text default null,
  p_time_preference text default null
)
returns requirements
language plpgsql security definer set search_path = public as $$
declare
  v_student students;
  v_req requirements;
  v_count int;
  v_best_score int;
begin
  if p_subject is null or p_mode is null or array_length(p_mode, 1) is null then
    raise exception 'Subject and at least one mode are required';
  end if;

  if p_budget is not null and (p_budget < 500 or p_budget > 12000) then
    raise exception 'Monthly budget must be between Rs 500 and Rs 12,000';
  end if;

  if p_pincode is not null and p_pincode !~ '^[0-9]{6}$' then
    raise exception 'Pincode must be a 6-digit number';
  end if;

  if p_student_id is not null then
    v_student := find_student(p_student_id, p_parent_id);
    if v_student.id is null then raise exception 'Student not found for this account'; end if;
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
    select count(*) into v_count from students where parent_id = p_parent_id;
    if v_count >= 4 then
      raise exception 'You can register up to 4 students per parent account. To add a subject for an existing student instead, pass their Student ID.';
    end if;
    insert into students (display_id, parent_id, student_name, age_grade, age, gender, address, area_city, pincode, whatsapp, notes, prior_tutoring_experience)
    values (next_daily_id('student_daily', 'FMSTU'), p_parent_id, p_student_name, p_age_grade, p_age, p_gender, p_address, p_area_city, p_pincode, p_whatsapp, p_notes, p_prior_tutoring_experience)
    returning * into v_student;
  end if;

  insert into requirements (display_id, parent_id, student_id, subject, mode, location, schedule_pref, time_preference, pricing_type, budget, preferred_teacher_gender)
  values (next_daily_id('requirement_daily', 'FMREQ'), p_parent_id, v_student.id, p_subject, p_mode, p_location, p_schedule_pref, p_time_preference, p_pricing_type, p_budget, p_preferred_teacher_gender)
  returning * into v_req;

  perform _notify('PARENT', p_parent_id, 'REQUIREMENT_SUBMITTED', 'Request received',
    'Your request for ' || p_subject || ' has been received (ID: ' || v_req.display_id || '). Our team will review it shortly.');

  -- === Simplified match-quality check, notification-only ===================
  select max(
    (case when exists (select 1 from unnest(t.subjects) s where s ilike '%' || p_subject || '%' or p_subject ilike '%' || s || '%') then 50 else 0 end)
    + (case when t.teaching_mode && p_mode then 25 else 10 end)
    + (case when p_location is null or p_location = '' or exists (select 1 from unnest(t.preferred_locations) l where l ilike '%' || p_location || '%' or p_location ilike '%' || l || '%') then 25 else 10 end)
  )
  into v_best_score
  from teacher_profiles t
  join profiles u on u.id = t.user_id
  where t.kyc_status = 'APPROVED' and u.status = 'ACTIVE';

  if coalesce(v_best_score, 0) < 40 then
    perform _notify('PARENT', p_parent_id, 'LOW_MATCH_AVAILABILITY',
      'We''re still working on your request',
      'We''re currently looking to fulfil your request for ' || p_subject || ', since tutor availability in your location doesn''t yet match what you''re looking for. We''ll get back to you as soon as possible — our executive will call you back. If you need further assistance, please reach us on WhatsApp or email (see the contact options in the footer).');
  end if;

  return v_req;
end;
$$;

revoke execute on all functions in schema public from public;
grant execute on all functions in schema public to authenticated;
