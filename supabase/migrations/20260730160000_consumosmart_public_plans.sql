-- Libera leitura pública da tabela `plans` (nome, preço e features de cada plano) — a Landing
-- Page (tela 0.0, `src/app/page.tsx`) passa a buscar preço e funcionalidades direto do banco em
-- vez de ter os valores hardcoded, então precisa que a role `anon` (visitante não logado)
-- consiga ler essa tabela. Nenhuma outra tabela recebe grant para `anon` aqui — só `plans`,
-- que já era informação pública (mostrada como texto estático na landing antes disso).

set search_path to consumosmart, extensions, public;

grant usage on schema consumosmart to anon;
grant select on plans to anon;

create policy "anyone can read plans"
  on plans for select
  using (true);
