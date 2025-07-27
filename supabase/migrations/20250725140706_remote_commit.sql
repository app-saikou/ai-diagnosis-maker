alter table "public"."users" drop constraint "users_id_fkey";

alter table "public"."quiz_results" drop column "recommended_action";

alter table "public"."users" add column "ticket_count" integer not null default 0;

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.increment_quiz_completions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE quizzes
  SET completions = completions + 1
  WHERE id = NEW.quiz_id;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_login_streak(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  today_date date := CURRENT_DATE;
  last_login date;
  current_streak integer;
BEGIN
  SELECT last_login_date, consecutive_login_days 
  INTO last_login, current_streak
  FROM users 
  WHERE id = user_id;
  
  -- If first login or no previous login
  IF last_login IS NULL THEN
    UPDATE users 
    SET consecutive_login_days = 1, last_login_date = today_date
    WHERE id = user_id;
  -- If logged in yesterday, increment streak
  ELSIF last_login = today_date - INTERVAL '1 day' THEN
    UPDATE users 
    SET consecutive_login_days = current_streak + 1, last_login_date = today_date
    WHERE id = user_id;
  -- If logged in today already, do nothing
  ELSIF last_login = today_date THEN
    -- No update needed
    NULL;
  -- If gap in login, reset streak
  ELSE
    UPDATE users 
    SET consecutive_login_days = 1, last_login_date = today_date
    WHERE id = user_id;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_quiz_likes_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE quizzes
    SET likes = likes + 1
    WHERE id = NEW.quiz_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE quizzes
    SET likes = GREATEST(0, likes - 1)
    WHERE id = OLD.quiz_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$
;

create policy "Allow read for all users"
on "public"."users"
as permissive
for select
to public
using (true);


CREATE TRIGGER increment_quiz_completions_trigger AFTER INSERT ON public.user_quiz_results FOR EACH ROW EXECUTE FUNCTION increment_quiz_completions();


