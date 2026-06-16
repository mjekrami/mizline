"use client";

import type {
  MenuModifierGroup,
  MenuProduct,
  MenuVariant,
} from "@mizline/shared";
import { Minus, Plus, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ProductImage } from "@/components/product-image";
import type { CartModifier } from "@/lib/cart";
import { computeUnitPrice } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { getProductFromPrice } from "@/lib/menu/filter";
import { cn } from "@/lib/utils";

export interface VariantPickerSelection {
  variant?: MenuVariant;
  modifiers: CartModifier[];
  notes?: string;
}

interface VariantPickerProps {
  product: MenuProduct;
  open: boolean;
  onClose: () => void;
  onAdd: (selection: VariantPickerSelection) => void;
}

function toggleModifierSelection(
  group: MenuModifierGroup,
  optionId: string,
  current: CartModifier[],
): CartModifier[] {
  const option = group.options.find((entry) => entry.id === optionId);
  if (!option) return current;

  const inGroup = current.filter((entry) =>
    group.options.some((opt) => opt.id === entry.optionId),
  );
  const isSelected = inGroup.some((entry) => entry.optionId === optionId);

  if (group.maxSelect === 1) {
    const withoutGroup = current.filter(
      (entry) => !group.options.some((opt) => opt.id === entry.optionId),
    );
    return isSelected
      ? withoutGroup
      : [
          ...withoutGroup,
          {
            optionId: option.id,
            name: option.name,
            priceModifier: option.priceModifier,
          },
        ];
  }

  if (isSelected) {
    return current.filter((entry) => entry.optionId !== optionId);
  }

  if (inGroup.length >= group.maxSelect) {
    return current;
  }

  return [
    ...current,
    {
      optionId: option.id,
      name: option.name,
      priceModifier: option.priceModifier,
    },
  ];
}

export function VariantPicker({
  product,
  open,
  onClose,
  onAdd,
}: VariantPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedVariant, setSelectedVariant] = useState<MenuVariant | undefined>(
    product.variants.length === 1 ? product.variants[0] : undefined,
  );
  const [selectedModifiers, setSelectedModifiers] = useState<CartModifier[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedVariant(
        product.variants.length === 1 ? product.variants[0] : undefined,
      );
      setSelectedModifiers([]);
      setNotes("");
    }
  }, [open, product]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const unitPrice = useMemo(
    () =>
      computeUnitPrice(
        product.price,
        selectedVariant?.priceModifier ?? 0,
        selectedModifiers,
      ),
    [product.price, selectedVariant, selectedModifiers],
  );

  const canAdd =
    (product.variants.length === 0 || selectedVariant !== undefined) &&
    product.modifierGroups.every((group) => {
      const count = selectedModifiers.filter((entry) =>
        group.options.some((opt) => opt.id === entry.optionId),
      ).length;
      return count >= group.minSelect && count <= group.maxSelect;
    });

  function handleAdd() {
    if (!canAdd) return;
    onAdd({
      variant: selectedVariant,
      modifiers: selectedModifiers,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <dialog
      ref={dialogRef}
      className="customer-detail-hero fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-background p-0 backdrop:bg-black/30"
      onClose={onClose}
    >
      <div className="flex h-full flex-col">
        <div className="relative flex shrink-0 flex-col items-center px-5 pb-6 pt-4">
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-secondary p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            <h2 className="text-lg font-bold tracking-tight">{product.name}</h2>
            <span className="size-9" aria-hidden />
          </div>

          <div className="customer-detail-image-ring mt-6 size-52 overflow-hidden rounded-full">
            <ProductImage
              src={product.image}
              alt={product.name}
              className="size-full object-cover"
            />
          </div>

          {product.description ? (
            <p className="mt-5 max-w-xs text-center text-sm text-muted-foreground">
              {product.description}
            </p>
          ) : null}
        </div>

        <div className="customer-detail-sheet flex flex-1 flex-col gap-5 overflow-y-auto rounded-t-3xl px-5 py-6">
          {product.variants.length > 0 ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const selected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={cn(
                        "rounded-2xl border px-5 py-3 text-sm font-semibold transition-all",
                        selected
                          ? "customer-pill-active border-transparent"
                          : "customer-pill border border-border text-foreground hover:border-accent/40",
                      )}
                    >
                      <span>{variant.name}</span>
                      <span className="ml-2 opacity-80">
                        {formatPrice(product.price + variant.priceModifier)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {product.modifierGroups.map((group) => (
            <div key={group.id} className="flex flex-col gap-2">
              <div>
                <p className="text-sm font-semibold">{group.name}</p>
                <p className="text-xs text-muted-foreground">
                  {group.minSelect > 0 ? "Required · " : ""}
                  {group.maxSelect === 1
                    ? "Choose one"
                    : `Choose up to ${group.maxSelect}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const selected = selectedModifiers.some(
                    (entry) => entry.optionId === option.id,
                  );
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setSelectedModifiers((current) =>
                          toggleModifierSelection(group, option.id, current),
                        )
                      }
                      className={cn(
                        "rounded-2xl border px-4 py-2.5 text-sm transition-all",
                        selected
                          ? "customer-pill-active border-transparent font-medium"
                          : "customer-pill border border-border hover:border-accent/40",
                      )}
                    >
                      {option.name}
                      {option.priceModifier > 0
                        ? ` +${formatPrice(option.priceModifier)}`
                        : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-semibold">Special instructions</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional notes for the kitchen"
              rows={2}
              className="resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground"
            />
          </label>
        </div>

        <div className="shrink-0 border-t border-border bg-card px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            disabled={!canAdd}
            onClick={handleAdd}
            className="customer-btn-primary flex w-full items-center justify-between rounded-2xl px-5 py-4 font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>Add to cart</span>
            <span>{formatPrice(unitPrice)}</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}

interface ProductCardProps {
  product: MenuProduct;
  onSelect: (product: MenuProduct) => void;
  onQuickAdd?: (product: MenuProduct) => void;
}

export function ProductCard({
  product,
  onSelect,
  onQuickAdd,
}: ProductCardProps) {
  const fromPrice = getProductFromPrice(product);
  const hasVariants = product.variants.length > 0;
  const customizable =
    hasVariants || product.modifierGroups.length > 0;

  function handleQuickAdd(event: React.MouseEvent) {
    event.stopPropagation();
    if (customizable) {
      onSelect(product);
      return;
    }
    onQuickAdd?.(product);
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="customer-product-card flex flex-col overflow-hidden rounded-3xl text-left transition-transform active:scale-[0.97]"
    >
      <ProductImage
        src={product.image}
        alt={product.name}
        className="aspect-square w-full"
        wrapClassName="customer-product-image-wrap"
      />
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="text-sm font-bold leading-tight">{product.name}</h3>
        {product.description ? (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-bold customer-text-accent">
            {hasVariants ? "from " : ""}
            {formatPrice(fromPrice)}
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={handleQuickAdd}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleQuickAdd(event as unknown as React.MouseEvent);
              }
            }}
            className="customer-add-btn flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-xl"
            aria-label={`Add ${product.name}`}
          >
            <Plus className="size-4 stroke-[2.5]" />
          </span>
        </div>
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
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {name}
      </h2>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </section>
  );
}

interface CategoryTabsProps {
  categories: { id: string; name: string }[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryTabs({
  categories,
  selectedId,
  onSelect,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold transition-all",
          selectedId === null
            ? "customer-pill-active"
            : "customer-pill text-muted-foreground hover:text-foreground",
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={cn(
            "shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold transition-all",
            selectedId === category.id
              ? "customer-pill-active"
              : "customer-pill text-muted-foreground hover:text-foreground",
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

interface MenuSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function MenuSearch({ value, onChange }: MenuSearchProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Find your coffee…"
        className="customer-search w-full rounded-2xl py-3 pr-4 pl-11 text-sm placeholder:text-muted-foreground focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
        aria-label="Search menu"
      />
    </div>
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
        "fixed inset-x-4 bottom-4 z-40 pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <button
        type="button"
        onClick={onOpenCart}
        className="customer-btn-primary flex w-full items-center justify-between rounded-2xl px-5 py-4 font-bold transition-transform active:scale-[0.98]"
      >
        <span className="flex items-center gap-2">
          <ShoppingBag className="size-5" />
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </span>
        <span>{formatPrice(subtotal)}</span>
      </button>
    </div>
  );
}

interface CartSheetLine {
  key: string;
  productName: string;
  variantName?: string;
  modifierNames: string[];
  unitPrice: number;
  quantity: number;
  notes?: string;
}

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
  lines: CartSheetLine[];
  subtotal: number;
  submitting: boolean;
  error?: string | null;
  onUpdateQuantity: (key: string, quantity: number) => void;
  onUpdateNotes: (key: string, notes: string) => void;
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
  onUpdateNotes,
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
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-background p-0 backdrop:bg-black/30"
      onClose={onClose}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-secondary p-2 text-muted-foreground hover:text-foreground"
            aria-label="Close cart"
          >
            <X className="size-5" />
          </button>
          <h2 className="text-xl font-bold">Cart</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Your cart is empty.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {lines.map((line) => (
                <li
                  key={line.key}
                  className="customer-cart-line flex flex-col gap-2 rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{line.productName}</p>
                      {line.variantName ? (
                        <p className="text-sm text-muted-foreground">
                          {line.variantName}
                        </p>
                      ) : null}
                      {line.modifierNames.length > 0 ? (
                        <p className="text-sm text-muted-foreground">
                          {line.modifierNames.join(", ")}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm font-bold customer-text-accent">
                        {formatPrice(line.unitPrice * line.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(line.key, line.quantity - 1)
                        }
                        className="rounded-xl bg-secondary p-2 hover:bg-muted"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(line.key, line.quantity + 1)
                        }
                        className="rounded-xl bg-secondary p-2 hover:bg-muted"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(line.key)}
                        className="ml-1 rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        aria-label="Remove item"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                  <label className="flex flex-col gap-1 text-xs">
                    <span className="font-medium text-muted-foreground">
                      Special instructions
                    </span>
                    <input
                      type="text"
                      defaultValue={line.notes ?? ""}
                      placeholder="Optional"
                      onBlur={(event) =>
                        onUpdateNotes(line.key, event.target.value)
                      }
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="customer-cart-summary shrink-0 rounded-t-3xl px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {error ? (
            <p className="mb-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <p className="mb-4 text-sm text-muted-foreground">
            Pay at the counter when you&apos;re ready — no online payment.
          </p>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <div className="mb-2 flex items-center justify-between border-t border-border pt-2 text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
          </div>
          <button
            type="button"
            disabled={lines.length === 0 || submitting}
            onClick={onCheckout}
            className="customer-btn-primary flex w-full items-center justify-between rounded-2xl px-5 py-4 font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{submitting ? "Placing order…" : "Proceed to checkout"}</span>
            <span>{formatPrice(subtotal)}</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}
