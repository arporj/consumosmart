-- Auditoria da Área de Gestão do Sistema (Módulo 0) — "quem fez o quê e quando" nas ações de
-- admin: criar/atualizar estabelecimento, alterar plano/preço, adicionar/remover admin. Só
-- leitura pelos próprios admins (via RLS); as escritas acontecem sempre pelo client de service
-- role (createAdminClient), que ignora RLS de qualquer forma — a policy aqui é defesa em
-- profundidade, não o único controle de acesso (isso continua sendo requireSystemAdmin()).

set search_path to consumosmart, extensions, public;

create table admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  action text not null,
  target_type text,
  target_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table admin_audit_log enable row level security;

create policy "system admins can read audit log"
  on admin_audit_log for select
  using (exists (select 1 from system_admins sa where sa.user_id = auth.uid()));
