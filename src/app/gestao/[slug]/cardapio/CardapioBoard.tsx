"use client";

import { useState, useTransition } from "react";
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
  { value: "cozinha", label: "Cozinha" },
  { value: "bar", label: "Bar" },
  { value: "sobremesas", label: "Sobremesas" },
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
    <input
      inputMode="numeric"
      value={display}
      onChange={(event) => {
        const digits = event.target.value.replace(/\D/g, "");
        onChange(digits ? parseInt(digits, 10) : 0);
      }}
      placeholder="0,00"
      className="w-28 rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 text-right text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
    />
  );
}

function ProductForm({
  initial,
  pending,
  onSave,
  onCancel,
}: {
  initial?: Product;
  pending: boolean;
  onSave: (fields: {
    name: string;
    description: string;
    priceCents: number;
    station: string;
    imageFile: File | null;
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceCents, setPriceCents] = useState(initial?.price_cents ?? 0);
  const [station, setStation] = useState(initial?.station ?? "cozinha");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.image_url ?? null);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-low p-3">
      <div className="flex gap-3">
        <label className="flex h-16 w-16 flex-none cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-outline-variant bg-surface-container-highest">
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview de upload, sem otimização de imagem
            <img src={imagePreview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-on-surface-variant">add_photo_alternate</span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setImageFile(file);
              if (file) setImagePreview(URL.createObjectURL(file));
            }}
          />
        </label>
        <div className="flex flex-1 flex-col gap-2">
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome do produto"
            className="rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descrição (opcional)"
            className="rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <CurrencyInput cents={priceCents} onChange={setPriceCents} />
        <select
          value={station}
          onChange={(event) => setStation(event.target.value)}
          className="flex-1 rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
        >
          {STATIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => onSave({ name, description, priceCents, station, imageFile })}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function ProductRow({ slug, product }: { slug: string; product: Product }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <>
        <ProductForm
          initial={product}
          pending={pending}
          onCancel={() => setEditing(false)}
          onSave={({ name, description, priceCents, station, imageFile }) => {
            startTransition(async () => {
              try {
                await updateProduct(
                  slug,
                  product.id,
                  name,
                  description,
                  priceCents,
                  station,
                  imageFile,
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

  return (
    <div
      className={`flex items-center justify-between rounded-xl border border-outline-variant/50 bg-surface-container-highest px-4 py-2.5 shadow-sm shadow-black/10 ${!product.is_active ? "opacity-50 grayscale" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded-lg bg-surface-container-low">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- imagem vinda do storage do usuário, sem otimização
            <img src={product.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-sm text-on-surface-variant">restaurant</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold">{product.name}</span>
          <span className="text-xs text-on-surface-variant">
            {formatPrice(product.price_cents)} ·{" "}
            {STATIONS.find((s) => s.value === product.station)?.label ?? product.station}
            {!product.is_active && " · Inativo"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex p-1 text-on-surface-variant transition-colors hover:text-primary"
        >
          <span className="material-symbols-outlined text-base">edit</span>
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
          className="inline-flex p-1 text-on-surface-variant transition-colors hover:text-error disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-base">
            {product.is_active ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
      <ConfirmModal
        open={error !== null}
        title="Não foi possível atualizar"
        description={error ?? ""}
        confirmLabel="Ok"
        hideCancel
        onCancel={() => setError(null)}
        onConfirm={() => setError(null)}
      />
    </div>
  );
}

function AddProductInline({ slug, categoryId }: { slug: string; categoryId: string | null }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-dashed border-outline-variant px-4 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      >
        <span className="material-symbols-outlined text-base">add</span>
        Novo produto
      </button>
    );
  }

  return (
    <>
      <ProductForm
        pending={pending}
        onCancel={() => setOpen(false)}
        onSave={({ name, description, priceCents, station, imageFile }) => {
          startTransition(async () => {
            try {
              await createProduct(
                slug,
                categoryId,
                name,
                description,
                priceCents,
                station,
                imageFile,
              );
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
  category,
  products,
}: {
  slug: string;
  category: Category | null;
  products: Product[];
}) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-outline-variant/60 bg-surface-container-low p-6 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">{category ? category.name : "Sem categoria"}</h3>
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

      <div className="flex flex-col gap-2">
        {products.map((product) => (
          <ProductRow key={product.id} slug={slug} product={product} />
        ))}
        {products.length === 0 && (
          <p className="text-sm text-on-surface-variant">Nenhum produto aqui ainda.</p>
        )}
      </div>

      <AddProductInline slug={slug} categoryId={category?.id ?? null} />

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
          category={category}
          products={products.filter((p) => p.category_id === category.id)}
        />
      ))}
      {(productsWithoutCategory.length > 0 || categories.length === 0) && (
        <CategoryCard slug={slug} category={null} products={productsWithoutCategory} />
      )}
    </div>
  );
}
