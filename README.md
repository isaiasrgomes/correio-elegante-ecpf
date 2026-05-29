# Correio Elegante

Site para aquisição de cartas de Dia dos Namorados — EREM Carlos Pena Filho.

## Stack

Next.js, TypeScript, Tailwind CSS, Framer Motion, React Hook Form, Zod, **Supabase** (banco + storage).

## Configuração

1. Crie um projeto no [Supabase](https://supabase.com).
2. Execute o SQL em `supabase/schema.sql` no SQL Editor.
3. Crie o bucket **polaroids** (público) em Storage.
4. Copie as variáveis para o `.env` (veja `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=uma-chave-secreta-com-pelo-menos-16-caracteres
```

Use a chave **service_role** (ou **secret**) do Supabase — não use a chave `anon` / public.

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

## Deploy na Vercel

No painel da Vercel → **Settings → Environment Variables**, adicione **todas** estas variáveis:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Chave **service_role** / **secret** (não a anon) |
| `JWT_SECRET` | Sim | Chave para sessão do admin (mín. 16 caracteres) |
| `ADMIN_EMAIL` | Seed | E-mail do admin (só para `npm run db:seed`) |
| `ADMIN_PASSWORD` | Seed | Senha do admin (só para `npm run db:seed`) |

Depois do primeiro deploy:

1. Execute `supabase/schema.sql` no SQL Editor do Supabase (se ainda não executou).
2. Rode o seed **apontando para o banco de produção** (no seu PC, com o `.env` usando as mesmas credenciais do Supabase):

```bash
npm run db:seed
```

3. Faça um **Redeploy** na Vercel após adicionar ou alterar variáveis.

Sem `JWT_SECRET`, o login do admin retorna erro na Vercel.

## Pix automático

Webhook: `POST /api/webhooks/payment` com header `x-webhook-secret` e body `{ "orderId": "...", "status": "paid" }`.
