-- Imagem de produto no cardápio: coluna + bucket público de storage (upload sempre via service
-- role na action, então não precisamos de policy de storage.objects — leitura é pública porque
-- a imagem do cardápio também vai aparecer pro cliente final na Área 4 mais adiante).

alter table consumosmart.products add column image_url text;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
