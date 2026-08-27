-- ============================================================
-- Blue Gems and Jewels — enquiries table update
-- Run this once in the Supabase SQL editor (Project → SQL Editor).
-- Adds Country / State / City / Phone-country-code to the existing
-- "enquiries" table used by the contact form on contact.html.
-- ============================================================

alter table public.enquiries
  add column if not exists country            text,
  add column if not exists state              text,
  add column if not exists city               text,
  add column if not exists phone_country_code text;

comment on column public.enquiries.country            is 'Country selected in the enquiry form';
comment on column public.enquiries.state              is 'State/Province — dropdown for India, free text for other countries';
comment on column public.enquiries.city               is 'City entered in the enquiry form';
comment on column public.enquiries.phone_country_code is 'Calling code selected alongside the phone number, e.g. +91';
