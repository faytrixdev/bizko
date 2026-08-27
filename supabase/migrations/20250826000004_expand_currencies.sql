alter table public.services drop constraint services_currency_check;

alter table public.services add constraint services_currency_check check (currency in ('XOF','XAF','NGN','KES','ZAR','DZD','GHS','TZS','UGX','USD','EUR','GBP'));
