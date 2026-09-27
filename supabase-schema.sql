-- ============================================================================
-- TEXPRO UNIFORMES ERP - SCHEMA DO SUPABASE (POSTGRESQL REALTIME)
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
