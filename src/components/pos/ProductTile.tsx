import type { Product } from "@/lib/domain/types";
import { formatCentsBRL } from "@/lib/domain/format";

export function ProductTile({
  product,
  action,
}: {
  product: Product;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-high p-3">
      <div className="mb-2 h-14 flex-none rounded-lg bg-gradient-to-br from-surface-container-highest to-surface-container" />
      <div className="text-sm font-bold">{product.name}</div>
      <p className="mt-1 text-[11px] leading-snug text-on-surface-variant">
        {product.description}
      </p>
      <div className="mt-2 font-mono text-[15px] font-extrabold text-secondary">
        R$ {formatCentsBRL(product.priceCents)}
      </div>
      {action ? <div className="mt-auto pt-2.5">{action}</div> : null}
    </div>
  );
}
