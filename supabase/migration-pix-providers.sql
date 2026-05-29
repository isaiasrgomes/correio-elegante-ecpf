-- Execute se o banco já existia antes da integração Pix com provedores

alter table settings add column if not exists pix_provider text default 'brcode';
alter table settings add column if not exists mercadopago_access_token text;
alter table settings add column if not exists openpix_app_id text;
