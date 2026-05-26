-- 0024 · Limit logo_url to 256 KB (M5 security fix)
--
-- Without a constraint, a malicious admin could store megabytes in
-- logo_url as a data-URI, bloating every query that selects from
-- organizations.  256 KB is generous for a base64-encoded workspace icon.

alter table public.organizations
  add constraint organizations_logo_url_max_size
  check (logo_url is null or octet_length(logo_url) <= 262144);
