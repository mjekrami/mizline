"use client";

import type { MenuProduct, MenuVariant } from "@mizline/shared";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { ProductImage } from "@/components/product-image";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface VariantPickerProps {
  product: MenuProduct;
  open: boolean;
  onClose: () => void;
  onAdd: (variant?: MenuVariant) => void;
}

export function VariantPicker({
  product,
  open,
  onClose,
  onAdd,
}: VariantPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-[min(100%,24rem)] rounded-xl border border-border bg-card p-0 shadow-lg backdrop:bg-black/40"
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 p-5">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="aspect-[4/3] w-full rounded-lg"
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{product.name}</h2>
            {product.description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {product.description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {product.variants.length === 0 ? (
            <button
              type="button"
              onClick={() => onAdd()}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary"
            >
              <span className="font-medium">Standard</span>
              <span className="font-semibold">{formatPrice(product.price)}</span>
            </button>
          ) : (
            product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => onAdd(variant)}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary"
              >
                <span className="font-medium">{variant.name}</span>
                <span className="font-semibold">
                  {formatPrice(product.price + variant.priceModifier)}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </dialog>
  );
}

interface ProductCardProps {
  product: MenuProduct;
  onSelect: (product: MenuProduct) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const fromPrice =
    product.variants.length > 0
      ? Math.min(
          ...product.variants.map((v) => product.price + v.priceModifier),
        )
      : product.price;

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-primary/40"
    >
      <ProductImage
        src={product.image}
        alt={product.name}
        className="aspect-[4/3] w-full"
      />
      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug">{product.name}</h3>
          <span className="shrink-0 text-sm font-semibold text-primary">
            {product.variants.length > 0 ? "from " : ""}
            {formatPrice(fromPrice)}
          </span>
        </div>
        {product.description ? (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        ) : null}
        {product.variants.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            {product.variants.length} size
            {product.variants.length === 1 ? "" : "s"} available
          </p>
        ) : null}
      </div>
    </button>
  );
}

interface MenuCategorySectionProps {
  name: string;
  children: ReactNode;
}

export function MenuCategorySection({
  name,
  children,
}: MenuCategorySectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {name}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

interface CartBarProps {
  itemCount: number;
  subtotal: number;
  onOpenCart: () => void;
  className?: string;
}

export function CartBar({
  itemCount,
  subtotal,
  onOpenCart,
  className,
}: CartBarProps) {
  if (itemCount === 0) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-sm",
        className,
      )}
    >
      <button
        type="button"
        onClick={onOpenCart}
        className="flex w-full items-center justify-between rounded-xl bg-accent px-4 py-3.5 text-accent-foreground shadow-sm transition-colors hover:opacity-95"
      >
        <span className="font-medium">
          View cart · {itemCount} item{itemCount === 1 ? "" : "s"}
        </span>
        <span className="font-semibold">{formatPrice(subtotal)}</span>
      </button>
    </div>
  );
}

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
  lines: Array<{
    key: string;
    productName: string;
    variantName?: string;
    unitPrice: number;
    quantity: number;
  }>;
  subtotal: number;
  submitting: boolean;
  error?: string | null;
  onUpdateQuantity: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
  onCheckout: () => void;
}

export function CartSheet({
  open,
  onClose,
  lines,
  subtotal,
  submitting,
  error,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: CartSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-x-0 bottom-0 z-50 m-0 h-[min(85vh,32rem)] w-full max-w-none rounded-t-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-black/40 open:animate-in sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[85vh] sm:w-[min(100%,28rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
      onClose={onClose}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">Your order</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close cart"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="text-center text-muted-foreground">Your cart is empty.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {lines.map((line) => (
                <li
                  key={line.key}
                  className="flex items-start justify-between gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{line.productName}</p>
                    {line.variantName ? (
                      <p className="text-sm text-muted-foreground">
                        {line.variantName}
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm font-medium">
                      {formatPrice(line.unitPrice * line.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(line.key, line.quantity - 1)
                      }
                      className="rounded-md border border-border p-1.5 hover:bg-muted"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(line.key, line.quantity + 1)
                      }
                      className="rounded-md border border-border p-1.5 hover:bg-muted"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(line.key)}
                      className="ml-1 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                      aria-label="Remove item"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border px-5 py-4">
          {error ? (
            <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-lg font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <button
            type="button"
            disabled={lines.length === 0 || submitting}
            onClick={onCheckout}
            className="w-full rounded-xl bg-accent px-4 py-3.5 font-semibold text-accent-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
