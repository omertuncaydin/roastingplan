-- 2026-10-12 · Personel Saatleri: limited view for HQ staff accounts.
-- Run once in the Supabase SQL editor (after roast-hq.sql, which defines is_hq_admin / is_hq_staff / hq_staff).
-- The admin reads the full staff_hours jar as before (RLS, admin only).
-- Staff accounts listed in hq_staff call this function instead: it returns the calendar marks and the
-- employee list WITHOUT any money field (rate, yol, osx) and without the paid flags or off-site expenses.
-- Anyone else gets null. Security definer, so the function can read the jar that RLS hides from staff.

create or replace function public.staff_hours_public() returns jsonb
language sql stable security definer set search_path = public as
$$
  select case
    when public.is_hq_admin() or public.is_hq_staff() then
      (select jsonb_build_object(
         'emps',  coalesce((select jsonb_agg(x.e - 'rate' - 'yol' - 'osx')
                            from jsonb_array_elements(s.data->'emps') as x(e)), '[]'::jsonb),
         'marks', coalesce(s.data->'marks', '{}'::jsonb),
         'up',    s.data->'up',
         'limited', true)
       from public.staff_hours s where s.id = 1)
    else null
  end
$$;

revoke all on function public.staff_hours_public() from public;
grant execute on function public.staff_hours_public() to authenticated;
