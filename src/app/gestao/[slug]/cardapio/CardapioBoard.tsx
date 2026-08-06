"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  createCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  toggleProductActive,
} from "./actions";
import { ConfirmModal } from "@/components/ConfirmModal";

type Category = { id: string; name: string };
type Product = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price_cents: number;
  station: string;
  is_active: boolean;
  image_url: string | null;
};

const STATIONS = [
  { value: "cozinha", label: "Cozinha", icon: "skillet" },
  { value: "bar", label: "Bar", icon: "local_bar" },
  { value: "sobremesas", label: "Sobremesas", icon: "icecream" },
];

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Máscara de moeda estilo "digitar da direita pra esquerda": o valor digitado é sempre
// interpretado em centavos, então o campo nunca fica num estado "0,9" ou "19," inválido.
function CurrencyInput({
  cents,
  onChange,
}: {
  cents: number;
  onChange: (cents: number) => void;
}) {
  const display = (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-semibold text-on-surface-variant">
        R$
      </span>
      <input
        inputMode="numeric"
        value={display}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "");
          onChange(digits ? parseInt(digits, 10) : 0);
        }}
        placeholder="0,00"
        className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-3 pr-4 pl-10 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

function ProductModal({
  open,
  title,
  categories,
  initial,
  defaultCategoryId,
  pending,
  onSave,
  onCancel,
}: {
  open: boolean;
  title: string;
  categories: Category[];
  initial?: Product;
  defaultCategoryId: string | null;
  pending: boolean;
  onSave: (fields: {
    name: string;
    description: string;
    priceCents: number;
    station: string;
    categoryId: string | null;
    imageFile: File | null;
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceCents, setPriceCents] = useState(initial?.price_cents ?? 0);
  const [station, setStation] = useState(initial?.station ?? "cozinha");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? defaultCategoryId);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.image_url ?? null);

  function reset() {
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setPriceCents(initial?.price_cents ?? 0);
    setStation(initial?.station ?? "cozinha");
    setCategoryId(initial?.category_id ?? defaultCategoryId);
    setImageFile(null);
    setImagePreview(initial?.image_url ?? null);
  }

  function handleCancel() {
    reset();
    onCancel();
  }

  function handleSave() {
    onSave({ name, description, priceCents, station, categoryId, imageFile });
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só precisa resubscrever quando abre/fecha
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-high shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/40 px-6 py-5">
          <div>
            <h2 id="product-modal-title" className="font-display text-xl font-bold">
              {title}
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              Preencha os detalhes para adicionar ao cardápio.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div>
            <label className="mb-2 block text-sm font-semibold">Foto do prato</label>
            <label className="relative flex h-36 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low transition-colors hover:border-primary/70">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- preview de upload, sem otimização de imagem
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container">
                    <span className="material-symbols-outlined text-xl text-on-surface-variant">
                      add_a_photo
                    </span>
                  </span>
                  <p className="mt-2 text-sm font-semibold">Clique para fazer upload</p>
                  <p className="text-xs text-on-surface-variant">
                    PNG ou JPG, até 5MB · Recomendado 1200×900px (4:3)
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setImageFile(file);
                  if (file) setImagePreview(URL.createObjectURL(file));
                }}
              />
            </label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold" htmlFor="product-name">
              Nome do produto
            </label>
            <input
              id="product-name"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Bruschetta de Tomate"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold" htmlFor="product-category">
                Categoria
              </label>
              <select
                id="product-category"
                value={categoryId ?? ""}
                onChange={(event) => setCategoryId(event.target.value || null)}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
              >
                <option value="">Sem categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold" htmlFor="product-station">
                Setor
              </label>
              <select
                id="product-station"
                value={station}
                onChange={(event) => setStation(event.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
              >
                {STATIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Preço de venda</label>
              <CurrencyInput cents={priceCents} onChange={setPriceCents} />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <label className="text-sm font-semibold" htmlFor="product-description">
                Descrição
              </label>
              <span className="text-xs text-on-surface-variant">{description.length}/250</span>
            </div>
            <textarea
              id="product-description"
              value={description}
              onChange={(event) => setDescription(event.target.value.slice(0, 250))}
              placeholder="Descreva os ingredientes e detalhes do prato…"
              rows={3}
              maxLength={250}
              className="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-outline-variant/40 px-6 py-4">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full border border-primary px-6 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={pending || !name.trim()}
            onClick={handleSave}
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {pending ? "Salvando…" : "Salvar produto"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ProductCard({
  slug,
  categories,
  product,
}: {
  slug: string;
  categories: Category[];
  product: Product;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const station = STATIONS.find((s) => s.value === product.station);

  return (
    <>
      <div
        className={`group flex flex-col overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-high shadow-sm transition-shadow hover:shadow-md ${!product.is_active ? "opacity-60 grayscale" : ""}`}
      >
        <div className="relative h-40 w-full flex-none bg-surface-container-low">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- imagem vinda do storage do usuário, sem otimização
            <img src={product.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant">restaurant</span>
            </div>
          )}
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-surface/80 px-2 py-0.5 text-[10px] font-bold backdrop-blur">
            <span
              className={`h-1.5 w-1.5 rounded-full ${product.is_active ? "bg-status-free" : "bg-on-surface-variant"}`}
            />
            {product.is_active ? "Ativo" : "Inativo"}
          </span>
          {station && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-surface/80 px-2 py-0.5 text-[10px] font-bold text-secondary backdrop-blur">
              <span className="material-symbols-outlined text-[13px]">{station.icon}</span>
              {station.label}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4">
          <h4 className="font-display text-sm font-bold leading-tight">{product.name}</h4>
          {product.description && (
            <p className="line-clamp-2 flex-1 text-xs text-on-surface-variant">{product.description}</p>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-outline-variant/30 pt-3">
            <span className="font-display text-lg font-black text-primary">
              {formatPrice(product.price_cents)}
            </span>
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant transition-colors hover:text-primary"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    try {
                      await toggleProductActive(slug, product.id, !product.is_active);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Erro ao atualizar produto.");
                    }
                  });
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant transition-colors hover:text-error disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {product.is_active ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProductModal
        open={editing}
        title="Editar produto"
        categories={categories}
        initial={product}
        defaultCategoryId={product.category_id}
        pending={pending}
        onCancel={() => setEditing(false)}
        onSave={({ name, description, priceCents, station: newStation, categoryId, imageFile }) => {
          startTransition(async () => {
            try {
              await updateProduct(
                slug,
                product.id,
                name,
                description,
                priceCents,
                newStation,
                imageFile,
                categoryId,
              );
              setEditing(false);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erro ao salvar produto.");
            }
          });
        }}
      />
      <ConfirmModal
        open={error !== null}
        title="Não foi possível salvar"
        description={error ?? ""}
        confirmLabel="Ok"
        hideCancel
        onCancel={() => setError(null)}
        onConfirm={() => setError(null)}
      />
    </>
  );
}

function AddProductButton({
  slug,
  categories,
  categoryId,
}: {
  slug: string;
  categories: Category[];
  categoryId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="col-span-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-outline-variant px-4 py-6 text-sm font-bold text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-container-high">
          <span className="material-symbols-outlined text-xs">add</span>
        </span>
        Novo produto
      </button>

      <ProductModal
        open={open}
        title="Novo produto"
        categories={categories}
        defaultCategoryId={categoryId}
        pending={pending}
        onCancel={() => setOpen(false)}
        onSave={({ name, description, priceCents, station, categoryId: selectedCategoryId, imageFile }) => {
          startTransition(async () => {
            try {
              await createProduct(slug, selectedCategoryId, name, description, priceCents, station, imageFile);
              setOpen(false);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erro ao criar produto.");
            }
          });
        }}
      />
      <ConfirmModal
        open={error !== null}
        title="Não foi possível criar"
        description={error ?? ""}
        confirmLabel="Ok"
        hideCancel
        onCancel={() => setError(null)}
        onConfirm={() => setError(null)}
      />
    </>
  );
}

function AddCategoryInline({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-dashed border-outline-variant px-4 py-3 text-sm font-bold text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      >
        <span className="material-symbols-outlined">add</span>
        Nova categoria
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:flex-row sm:items-center">
      <input
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Ex: Entradas, Bebidas"
        className="flex-1 rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              try {
                await createCategory(slug, name);
                setName("");
                setOpen(false);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao criar categoria.");
              }
            });
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant"
        >
          Cancelar
        </button>
      </div>
      <ConfirmModal
        open={error !== null}
        title="Não foi possível criar a categoria"
        description={error ?? ""}
        confirmLabel="Ok"
        hideCancel
        onCancel={() => setError(null)}
        onConfirm={() => setError(null)}
      />
    </div>
  );
}

function CategoryCard({
  slug,
  categories,
  category,
  products,
}: {
  slug: string;
  categories: Category[];
  category: Category | null;
  products: Product[];
}) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-outline-variant/60 bg-surface-container-low p-6 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-lg font-bold text-secondary">
            {category ? category.name : "Sem categoria"}
          </h3>
          <span className="rounded-md bg-surface-container-high px-2 py-1 text-xs font-bold text-on-surface-variant">
            {products.length} item{products.length === 1 ? "" : "s"}
          </span>
        </div>
        {category && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmOpen(true)}
            className="inline-flex p-1 text-on-surface-variant transition-colors hover:text-error disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-base">delete</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} slug={slug} categories={categories} product={product} />
        ))}
        {products.length === 0 && (
          <p className="col-span-full text-sm text-on-surface-variant">Nenhum produto aqui ainda.</p>
        )}
        <AddProductButton slug={slug} categories={categories} categoryId={category?.id ?? null} />
      </div>

      {category && (
        <>
          <ConfirmModal
            open={confirmOpen}
            title="Excluir categoria"
            description={`Excluir a categoria "${category.name}"? Os produtos dela passam a ficar sem categoria — nada é apagado.`}
            confirmLabel="Excluir"
            cancelLabel="Voltar"
            destructive
            pending={pending}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={() => {
              startTransition(async () => {
                try {
                  await deleteCategory(slug, category.id);
                  setConfirmOpen(false);
                } catch (err) {
                  setConfirmOpen(false);
                  setError(err instanceof Error ? err.message : "Erro ao excluir categoria.");
                }
              });
            }}
          />
          <ConfirmModal
            open={error !== null}
            title="Não foi possível excluir"
            description={error ?? ""}
            confirmLabel="Ok"
            hideCancel
            onCancel={() => setError(null)}
            onConfirm={() => setError(null)}
          />
        </>
      )}
    </section>
  );
}

export function CardapioBoard({
  slug,
  categories,
  products,
}: {
  slug: string;
  categories: Category[];
  products: Product[];
}) {
  const productsWithoutCategory = products.filter((p) => p.category_id === null);

  return (
    <div className="flex flex-col gap-6">
      <AddCategoryInline slug={slug} />
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          slug={slug}
          categories={categories}
          category={category}
          products={products.filter((p) => p.category_id === category.id)}
        />
      ))}
      {(productsWithoutCategory.length > 0 || categories.length === 0) && (
        <CategoryCard slug={slug} categories={categories} category={null} products={productsWithoutCategory} />
      )}
    </div>
  );
}
