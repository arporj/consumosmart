-- Marca o admin "dono" da conta (o primeiro admin do sistema, criado fora do fluxo de convite)
-- como intocável: nenhum outro admin consegue remover essa linha de system_admins, mesmo tendo
-- poder de remover qualquer outro admin comum. Evita que um admin recém-adicionado (ou
-- comprometido) tire o acesso de quem fundou a conta.

set search_path to consumosmart, extensions, public;

alter table system_admins add column is_owner boolean not null default false;

update system_admins
set is_owner = true
where user_id = (select id from auth.users where email = 'arporj@gmail.com');
