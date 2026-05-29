# Correio Elegante

Site para aquisição de cartas de Dia dos Namorados — EREM Carlos Pena Filho.

## Stack

Next.js, TypeScript, Tailwind CSS, Framer Motion, React Hook Form, Zod, **Supabase** (banco + storage).

## Configuração

1. Crie um projeto no [Supabase](https://supabase.com).
2. Execute o SQL em `supabase/schema.sql` no SQL Editor.
3. Crie o bucket **polaroids** (público) em Storage.
4. Copie URL e Service Role Key para o `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

5. Instale e rode:

```bash
npm install
npm run db:seed
npm run dev
```

## Admin

- URL: `/painel/admin-correio`
- Login padrão: `admin@correioelegante.com` / `admin123`

Configure a chave Pix e habilite pagamentos no painel.

## Pix automático

Webhook: `POST /api/webhooks/payment` com header `x-webhook-secret` e body `{ "orderId": "...", "status": "paid" }`.
