"use client";

import { usePosStore } from "@/store/pos-store";
import { ProductTile } from "@/components/pos/ProductTile";
import { AddProductTile } from "@/components/pos/AddProductTile";
import { AddCategoryTile } from "@/components/pos/AddCategoryTile";

export default function CardapioPage() {
  const categories = usePosStore((s) => s.categories);
  const products = usePosStore((s) => s.products);
  const removeProduct = usePosStore((s) => s.removeProduct);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-extrabold">Cardápio</h1>
      <p className="mt-1 text-sm text-on-surface-variant">
        Categorias e produtos que aparecem na Venda Balcão e, mais pra frente, no app do
        cliente.
      </p>

      <div className="mt-6 flex flex-col gap-8">
        {categories
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((category) => {
            const categoryProducts = products.filter((p) => p.categoryId === category.id);
            return (
              <section key={category.id}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="whitespace-nowrap text-xs font-extrabold uppercase tracking-wide text-secondary">
                    {category.name}
                  </span>
                  <div className="h-[3px] flex-1 bg-outline-variant" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {categoryProducts.map((product) => (
                    <ProductTile
                      key={product.id}
                      product={product}
                      action={
                        <button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className="w-full rounded-lg border border-outline-variant py-1.5 text-[11px] font-bold text-on-surface-variant transition-colors hover:border-error hover:text-error"
                        >
                          Remover
                        </button>
                      }
                    />
                  ))}
                  <AddProductTile categoryId={category.id} />
                </div>
              </section>
            );
          })}

        <AddCategoryTile />
      </div>
    </div>
  );
}
