-- roaster-grants-2026-07-11.sql (v2: these ARE the alumni, founding numbers assigned)
-- 36 alumni -> Roaster 12mo (until 2027-07-11), reason 'learner', founding_no 1..36 in ORDER-DATE order
-- (oldest order = No. 1; Shopify export assumed newest-first, reversed here: VERIFY the order).
-- Cupper alumni (6) keep founding_no 37..42 + cupper_no 1..6: add via founding-migration template.
-- Run AFTER founding-migration.sql ALTERs.

INSERT INTO entitlements (email, access, founding_no, updated_at) VALUES
  ('fatura@gochescoffee.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Özge Hanım"}'::jsonb, 1, now()),
  ('ferhatmete94@icloud.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Ferhat Mete"}'::jsonb, 2, now()),
  ('melekiremerkus@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Melek İrem Erkuş"}'::jsonb, 3, now()),
  ('arkeokan11@gmai.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Çiğdem Kara"}'::jsonb, 4, now()),
  ('aragozbek@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "ARA GÖZBEK"}'::jsonb, 5, now()),
  ('hasil.hmz@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Hamza HAŞIL"}'::jsonb, 6, now()),
  ('ufukozcan78@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Ufuk ozcan Karabacak"}'::jsonb, 7, now()),
  ('mmertuner@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "mert üner"}'::jsonb, 8, now()),
  ('mdemir.uk@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "mustafa demir"}'::jsonb, 9, now()),
  ('sam_murgatroyd_101@hotmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Samuel Alan Murgatroyd"}'::jsonb, 10, now()),
  ('p1tuny4@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "AZİZ SİNAN VARGÜN"}'::jsonb, 11, now()),
  ('s.abusheikhah@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Saleh Abusheikhah"}'::jsonb, 12, now()),
  ('aylinpektekin@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Mustafa Mujahed"}'::jsonb, 13, now()),
  ('togaycalikoglu@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Togay Çalıkoğlu"}'::jsonb, 14, now()),
  ('odgnaaa@icloud.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Doğan Bircan"}'::jsonb, 15, now()),
  ('serap.akcay@delapau.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Saggezza A.Ş Saggezza A.Ş"}'::jsonb, 16, now()),
  ('hamwar_shwany@yahoo.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Hamwar Azad"}'::jsonb, 17, now()),
  ('pirpirik35@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Yiğit Kuşçu"}'::jsonb, 18, now()),
  ('alirizaduzgun@outlook.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Ali Rıza Düzgün"}'::jsonb, 19, now()),
  ('tevhid191@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Tevhid İlhan"}'::jsonb, 20, now()),
  ('s.elhamkia@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "SIMA ELHAMKIA"}'::jsonb, 21, now()),
  ('cagriozdemir1@hotmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Çağrı Özdemir"}'::jsonb, 22, now()),
  ('taylankaynar@hotmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Taylan Kaynar"}'::jsonb, 23, now()),
  ('serkanmms.6@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "serkan memiş"}'::jsonb, 24, now()),
  ('mbarankaratay@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Mehmet Baran Karatay"}'::jsonb, 25, now()),
  ('mustafasdemirdas@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "mustafa sergen demirdaş"}'::jsonb, 26, now()),
  ('mehmetdurandal@hotmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "mehmet durandal"}'::jsonb, 27, now()),
  ('gokberkcetin1@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Gökberk Çetin"}'::jsonb, 28, now()),
  ('huseyinucr@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Hüseyin Uçar"}'::jsonb, 29, now()),
  ('tobecreativereklam@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Serkan Yücedağ"}'::jsonb, 30, now()),
  ('mustafaay1989@hotmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Mustafa Ay"}'::jsonb, 31, now()),
  ('tolgacankok26@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Tolga Can KÖK"}'::jsonb, 32, now()),
  ('mzshawa@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Mhd Muaaz ALSHAWA"}'::jsonb, 33, now()),
  ('cakirhsn@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Hasan Çakır"}'::jsonb, 34, now()),
  ('utkucanertan@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Utkucan Ertan"}'::jsonb, 35, now()),
  ('furkanbalcova981@gmail.com', '{"roast": "full", "cup": "lite", "grade": "lite", "value": "lite", "plan": "Roaster", "until": "2027-07-11", "reason": "learner", "name": "Furkan Balçova"}'::jsonb, 36, now())
ON CONFLICT (email) DO UPDATE SET access=EXCLUDED.access, founding_no=COALESCE(entitlements.founding_no,EXCLUDED.founding_no), updated_at=now();
