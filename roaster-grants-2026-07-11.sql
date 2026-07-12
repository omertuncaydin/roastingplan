-- roaster-grants-2026-07-11.sql
-- 36 Shopify customers -> Roaster, 12 months (until 2027-07-11), reason 'user'.
-- NO founding_no assigned: Omer must rule whether customers consume founding slots
-- (36 customers + 60 alumni = 96/100 on day one). Add founding_no separately if yes.
-- Run AFTER founding-migration.sql ALTERs. Idempotent upsert by email.

INSERT INTO entitlements (email, access, updated_at) VALUES
  ('aragozbek@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "ARA GÖZBEK"}'::jsonb, now()),
  ('p1tuny4@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "AZİZ SİNAN VARGÜN"}'::jsonb, now()),
  ('alirizaduzgun@outlook.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Ali Rıza Düzgün"}'::jsonb, now()),
  ('odgnaaa@icloud.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Doğan Bircan"}'::jsonb, now()),
  ('ferhatmete94@icloud.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Ferhat Mete"}'::jsonb, now()),
  ('furkanbalcova981@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Furkan Balçova"}'::jsonb, now()),
  ('gokberkcetin1@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Gökberk Çetin"}'::jsonb, now()),
  ('hamwar_shwany@yahoo.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Hamwar Azad"}'::jsonb, now()),
  ('hasil.hmz@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Hamza HAŞIL"}'::jsonb, now()),
  ('cakirhsn@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Hasan Çakır"}'::jsonb, now()),
  ('huseyinucr@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Hüseyin Uçar"}'::jsonb, now()),
  ('mbarankaratay@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Mehmet Baran Karatay"}'::jsonb, now()),
  ('melekiremerkus@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Melek İrem Erkuş"}'::jsonb, now()),
  ('mzshawa@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Mhd Muaaz ALSHAWA"}'::jsonb, now()),
  ('mustafaay1989@hotmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Mustafa Ay"}'::jsonb, now()),
  ('aylinpektekin@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Mustafa Mujahed"}'::jsonb, now()),
  ('s.elhamkia@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "SIMA ELHAMKIA"}'::jsonb, now()),
  ('serap.akcay@delapau.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Saggezza A.Ş Saggezza A.Ş"}'::jsonb, now()),
  ('s.abusheikhah@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Saleh Abusheikhah"}'::jsonb, now()),
  ('sam_murgatroyd_101@hotmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Samuel Alan Murgatroyd"}'::jsonb, now()),
  ('tobecreativereklam@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Serkan Yücedağ"}'::jsonb, now()),
  ('taylankaynar@hotmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Taylan Kaynar"}'::jsonb, now()),
  ('tevhid191@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Tevhid İlhan"}'::jsonb, now()),
  ('togaycalikoglu@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Togay Çalıkoğlu"}'::jsonb, now()),
  ('tolgacankok26@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Tolga Can KÖK"}'::jsonb, now()),
  ('ufukozcan78@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Ufuk ozcan Karabacak"}'::jsonb, now()),
  ('utkucanertan@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Utkucan Ertan"}'::jsonb, now()),
  ('pirpirik35@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Yiğit Kuşçu"}'::jsonb, now()),
  ('mehmetdurandal@hotmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "mehmet durandal"}'::jsonb, now()),
  ('mmertuner@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "mert üner"}'::jsonb, now()),
  ('mdemir.uk@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "mustafa demir"}'::jsonb, now()),
  ('mustafasdemirdas@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "mustafa sergen demirdaş"}'::jsonb, now()),
  ('serkanmms.6@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "serkan memiş"}'::jsonb, now()),
  ('cagriozdemir1@hotmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Çağrı Özdemir"}'::jsonb, now()),
  ('arkeokan11@gmai.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Çiğdem Kara"}'::jsonb, now()),
  ('fatura@gochescoffee.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "user", "name": "Özge Hanım"}'::jsonb, now())
ON CONFLICT (email) DO UPDATE SET access=EXCLUDED.access, updated_at=now();
