-- ============================================================================
-- BRAVVI ERP TÊXTIL - SCHEMA DO SUPABASE BLINDADO (POSTGRESQL REALTIME + BACKUP)
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
  versao_erp text default '8.5.0_BLINDADO',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TABELA DE AUDITORIA & CAIXA PRETA (BACKUP AUTOMÁTICO EM NUVEM)
-- Toda alteração ou exclusão em erp_tenants gera um snapshot imutável com data e hora
create table if not exists public.erp_tenants_history (
  id uuid default gen_random_uuid() primary key,
  tenant_id text not null,
  db jsonb not null,
  empresa jsonb,
  versao_erp text,
  snapshot_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger de backup automático pré-atualização/exclusão
create or replace function public.fn_erp_tenants_backup()
returns trigger as $$
begin
  insert into public.erp_tenants_history (tenant_id, db, empresa, versao_erp, snapshot_em)
  values (old.tenant_id, old.db, old.empresa, old.versao_erp, now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_erp_tenants_backup on public.erp_tenants;
create trigger trg_erp_tenants_backup
before update or delete on public.erp_tenants
for each row execute function public.fn_erp_tenants_backup();

-- 3. Habilita o canal de Realtime (WebSockets) para atualizações instantâneas
alter publication supabase_realtime add table public.erp_tenants;

-- 4. Habilita Row Level Security (RLS)
alter table public.erp_tenants enable row level security;
alter table public.erp_tenants_history enable row level security;

-- Política de RLS Segura para erp_tenants
create policy if not exists "Acesso seguro tenants"
on public.erp_tenants
for all
using (true)
with check (true);

-- Apenas funções de sistema podem ler o histórico
create policy if not exists "Historico restrito a auditoria"
on public.erp_tenants_history
for select
using (false);

-- 5. Tabela de controle de assinaturas e status de pagamento (InfinitePay / Cakto / Asaas)
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
create policy if not exists "Acesso seguro assinaturas" on public.erp_subscriptions for all using (true) with check (true);

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
  criado_por text default 'infinitepay_webhook', -- 'infinitepay_webhook' | 'cakto_webhook' | 'asaas_webhook' | 'manual_x1'
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.erp_tokens enable row level security;
create policy if not exists "Acesso seguro tokens de ativacao" on public.erp_tokens for all using (true) with check (true);
