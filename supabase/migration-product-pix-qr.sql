-- Chaves Pix e imagens de QR Code por produto (admin)
alter table settings
  add column if not exists product_pix_keys jsonb default '{}'::jsonb,
  add column if not exists product_qr_codes jsonb default '{}'::jsonb;

-- Storage: crie o bucket "qr-codes" como público no painel Supabase
