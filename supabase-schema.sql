-- ============================================================================
-- BRAVVI ERP TÊXTIL - SCHEMA DO SUPABASE (POSTGRESQL REALTIME)
-- ============================================================================
-- Como rodar:
-- 1. Acesse o seu dashboard no Supabase: https://supabase.com/dashboard
-- 2. Selecione o seu projeto e clique em "SQL Editor" no menu lateral esquerdo
-- 3. Cole este script completo e clique no botão verde "Run"
-- ============================================================================

-- 1. Cria a tabela principal de multi-tenants e estado operacional do ERP
create table if not exists public.erp_tenants (
  tenant_id text primary key,
  db jsonb not null,
  empresa jsonb,
  ultima_atualizacao_ms bigint,
  versao_erp text default '8.4.0',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilita o canal de Realtime (WebSockets) para atualizações instantâneas
alter publication supabase_realtime add table public.erp_tenants;

-- 3. Habilita Row Level Security (RLS)
alter table public.erp_tenants enable row level security;

-- 4. Cria política de acesso público anônimo para o ERP
create policy "Acesso livre anonimo ao ERP"
on public.erp_tenants
for all
using (true)
with check (true);

-- 5. Tabela de controle de assinaturas e status de pagamento (InfinitePay / Recorrência)
create table if not exists public.erp_subscriptions (
  id uuid default gen_random_uuid() primary key,
  tenant_id text references public.erp_tenants(tenant_id) on delete cascade,
  email text,
  whatsapp text,
  plano text default 'mensal', -- 'mensal' | 'anual' | 'vitalicio'
  status text default 'ativa', -- 'ativa' | 'pendente' | 'bloqueada' | 'cancelada'
  valor numeric default 97.00,
  data_inicio timestamp with time zone default timezone('utc'::text, now()) not null,
  data_vencimento timestamp with time zone not null,
  dias_carencia int default 3,
  gateway text default 'infinitepay',
  infinitepay_link_id text,
  order_nsu text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.erp_subscriptions enable row level security;
create policy "Acesso livre a assinaturas" on public.erp_subscriptions for all using (true) with check (true);

-- 6. Tabela de tokens de primeiro acesso / ativação blindada
create table if not exists public.erp_tokens (
  token text primary key,
  tenant_id text,
  tipo text default 'ativacao', -- 'ativacao' | 'renovacao'
  email text,
  nome_cliente text,
  plano text default 'mensal',
  dias_acesso int default 30,
  valor numeric,
  order_nsu text,
  status text default 'aprovado',
  usado boolean default false,
  usado_em timestamp with time zone,
  criado_por text default 'infinitepay_webhook', -- 'infinitepay_webhook' | 'manual_x1'
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.erp_tokens enable row level security;
create policy "Acesso livre a tokens de ativacao" on public.erp_tokens for all using (true) with check (true);
