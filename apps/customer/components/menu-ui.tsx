"use client";

import type {
  MenuModifierGroup,
  MenuProduct,
  MenuVariant,
} from "@mizline/shared";
import {
  ArrowLeft,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ProductImage } from "@/components/product-image";
import { getCategoryIcon } from "@/lib/category-icons";
import type { CartModifier } from "@/lib/cart";
import { computeUnitPrice } from "@/lib/cart";
import { formatPrice, getProductFromPrice } from "@mizline/shared";
import { cn } from "@/lib/utils";

export interface VariantPickerSelection {
  variant?: MenuVariant;
  modifiers: CartModifier[];
  notes?: string;
  quantity?: number;
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

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${value} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < Math.round(value)
              ? "customer-rating-star fill-current"
              : "customer-rating-star-empty",
          )}
        />
      ))}
    </div>
  );
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
  const [quantity, setQuantity] = useState(1);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedVariant(
        product.variants.length === 1 ? product.variants[0] : undefined,
      );
      setSelectedModifiers([]);
      setNotes("");
      setQuantity(1);
      setDescriptionExpanded(false);
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

  const sizeLabel = selectedVariant?.name ?? "Regular";
  const description = product.description?.trim() ?? "";
  const showReadMore = description.length > 120;

  function handleAdd() {
    if (!canAdd) return;
    onAdd({
      variant: selectedVariant,
      modifiers: selectedModifiers,
      notes: notes.trim() || undefined,
      quantity,
    });
  }

  return (
    <dialog
      ref={dialogRef}
      className="customer-detail-view fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 p-0 backdrop:bg-black/20"
      onClose={onClose}
    >
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onClose}
            className="customer-icon-btn flex size-10 items-center justify-center rounded-full"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h2 className="text-base font-extrabold tracking-tight text-foreground">
            {product.name}
          </h2>
          <span className="size-10" aria-hidden />
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-36">
          <div className="relative mx-auto flex w-full max-w-sm items-center justify-center py-4">
            {product.variants.length > 0 ? (
              <div className="absolute left-0 top-1/2 flex -translate-y-1/2 flex-col gap-2">
                {product.variants.map((variant) => {
                  const selected = selectedVariant?.id === variant.id;
                  const shortLabel = variant.name.charAt(0).toUpperCase();
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full text-sm font-bold transition-all",
                        selected
                          ? "customer-size-pill-active"
                          : "customer-size-pill",
                      )}
                      aria-label={variant.name}
                      aria-pressed={selected}
                    >
                      {shortLabel}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="size-48 overflow-hidden rounded-full shadow-lg">
              <ProductImage
                src={product.image}
                alt={product.name}
                className="size-full object-cover"
              />
            </div>

            <div className="absolute right-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((value) => value + 1)}
                className="customer-stepper-btn-dark flex size-9 items-center justify-center rounded-full"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
              <span className="text-lg font-extrabold text-foreground">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="customer-stepper-btn-outline flex size-9 items-center justify-center rounded-full"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
            </div>
          </div>

          {product.variants.length > 0 ? (
            <p className="mb-5 text-center text-sm font-semibold text-muted-foreground">
              {sizeLabel}
            </p>
          ) : null}

          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Rating</span>
              <StarRating value={4.8} />
              <span className="text-sm text-muted-foreground">(4.8)</span>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Reviews</p>
              <p className="text-sm text-muted-foreground">Popular choice</p>
            </div>
            <span className="customer-price-pill rounded-full px-4 py-2 text-sm font-bold">
              {formatPrice(unitPrice)}
            </span>
          </div>

          {description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {descriptionExpanded || !showReadMore
                ? description
                : `${description.slice(0, 120)}…`}{" "}
              {showReadMore && !descriptionExpanded ? (
                <button
                  type="button"
                  onClick={() => setDescriptionExpanded(true)}
                  className="font-semibold text-foreground underline-offset-2 hover:underline"
                >
                  Read more..
                </button>
              ) : null}
            </p>
          ) : null}

          {product.modifierGroups.map((group) => (
            <div key={group.id} className="mt-6 flex flex-col gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{group.name}</p>
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
                        "rounded-full px-4 py-2 text-sm font-medium transition-all",
                        selected
                          ? "customer-size-pill-active"
                          : "customer-size-pill",
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

          <label className="mt-6 flex flex-col gap-1.5 text-sm">
            <span className="font-semibold text-foreground">Special instructions</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional notes for the kitchen"
              rows={2}
              className="resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground"
            />
          </label>
        </div>

        <div className="customer-detail-footer fixed inset-x-0 bottom-0 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            disabled={!canAdd}
            onClick={handleAdd}
            className="customer-add-cart-btn flex w-full items-center justify-between rounded-full py-4 pl-6 pr-2 font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>Add to Cart</span>
            <span className="customer-add-cart-btn-icon flex size-10 items-center justify-center rounded-full">
              <ShoppingCart className="size-5" />
            </span>
          </button>
        </div>
      </div>
    </dialog>
  );
}

interface CategoryTabsProps {
  categories: { id: string; name: string }[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function isProductCustomizable(product: MenuProduct): boolean {
  return product.variants.length > 0 || product.modifierGroups.length > 0;
}

function handleProductQuickAdd(
  event: React.MouseEvent,
  product: MenuProduct,
  onSelect: (product: MenuProduct) => void,
  onQuickAdd?: (product: MenuProduct) => void,
) {
  event.stopPropagation();
  if (isProductCustomizable(product)) {
    onSelect(product);
    return;
  }
  onQuickAdd?.(product);
}

interface HorizontalProductCardProps {
  product: MenuProduct;
  onSelect: (product: MenuProduct) => void;
  onQuickAdd?: (product: MenuProduct) => void;
  badge?: string | null;
}

export function HorizontalProductCard({
  product,
  onSelect,
  onQuickAdd,
  badge,
}: HorizontalProductCardProps) {
  const fromPrice = getProductFromPrice(product);
  const hasVariants = product.variants.length > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="customer-horizontal-card flex w-[9.5rem] shrink-0 flex-col overflow-hidden rounded-3xl text-left transition-transform active:scale-[0.97]"
    >
      <div className="relative shrink-0">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="aspect-square w-full"
        />
        {badge ? (
          <span className="absolute right-2 top-2 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-accent-foreground">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="customer-card-body">
        <h3 className="customer-card-title line-clamp-2">{product.name}</h3>
        <div className="customer-card-footer">
          <span className="customer-card-price">
            {hasVariants ? "from " : ""}
            {formatPrice(fromPrice)}
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={(event) =>
              handleProductQuickAdd(event, product, onSelect, onQuickAdd)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleProductQuickAdd(
                  event as unknown as React.MouseEvent,
                  product,
                  onSelect,
                  onQuickAdd,
                );
              }
            }}
            className="customer-add-btn flex size-8 shrink-0 items-center justify-center rounded-full"
            aria-label={`Add ${product.name}`}
          >
            <Plus className="size-4 stroke-[2.5]" />
          </span>
        </div>
      </div>
    </button>
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

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="customer-product-card flex flex-col overflow-hidden rounded-3xl text-left transition-transform active:scale-[0.97]"
    >
      <ProductImage
        src={product.image}
        alt={product.name}
        className="aspect-square w-full shrink-0"
      />
      <div className="customer-card-body">
        <h3 className="customer-card-title line-clamp-2">{product.name}</h3>
        {product.description ? (
          <p className="customer-card-desc line-clamp-2">
            {product.description}
          </p>
        ) : null}
        <div className="customer-card-footer">
          <span className="customer-card-price">
            {hasVariants ? "from " : ""}
            {formatPrice(fromPrice)}
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={(event) =>
              handleProductQuickAdd(event, product, onSelect, onQuickAdd)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleProductQuickAdd(
                  event as unknown as React.MouseEvent,
                  product,
                  onSelect,
                  onQuickAdd,
                );
              }
            }}
            className="customer-add-btn flex size-8 shrink-0 items-center justify-center rounded-full"
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
      <h2 className="text-lg font-extrabold tracking-tight">{name}</h2>
      <div className="grid grid-cols-2 items-start gap-3">{children}</div>
    </section>
  );
}

export function CategoryTabs({
  categories,
  selectedId,
  onSelect,
}: CategoryTabsProps) {
  return (
    <div className="customer-scroll-row flex gap-2.5">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.name);
        const selected = selectedId === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
              selected
                ? "customer-pill-active"
                : "customer-pill-outlined",
            )}
          >
            <Icon className="size-4" />
            {category.name}
          </button>
        );
      })}
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
        "fixed inset-x-4 bottom-[5.5rem] z-40 pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <button
        type="button"
        onClick={onOpenCart}
        className="customer-btn-primary flex w-full items-center justify-between rounded-full px-5 py-4 font-bold shadow-lg transition-transform active:scale-[0.98]"
      >
        <span>
          {itemCount} item{itemCount === 1 ? "" : "s"} · View cart
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
      className="customer-overlay-view fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 p-0 backdrop:bg-black/20"
      onClose={onClose}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onClose}
            className="customer-icon-btn flex size-10 items-center justify-center rounded-full"
            aria-label="Close cart"
          >
            <X className="size-5" />
          </button>
          <h2 className="text-xl font-extrabold">Cart</h2>
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
                      <p className="mt-1 text-sm font-bold">
                        {formatPrice(line.unitPrice * line.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(line.key, line.quantity - 1)
                        }
                        className="customer-stepper-btn-outline flex size-8 items-center justify-center rounded-full"
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
                        className="customer-stepper-btn-dark flex size-8 items-center justify-center rounded-full"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(line.key)}
                        className="ml-1 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
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
                      className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
                    />
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="customer-cart-summary shrink-0 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
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
          <div className="mb-4 flex items-center justify-between border-t border-border pt-2">
            <span className="text-muted-foreground">Total</span>
            <span className="text-lg font-extrabold">{formatPrice(subtotal)}</span>
          </div>
          <button
            type="button"
            disabled={lines.length === 0 || submitting}
            onClick={onCheckout}
            className="customer-btn-primary flex w-full items-center justify-between rounded-full px-5 py-4 font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{submitting ? "Placing order…" : "Proceed to checkout"}</span>
            <span>{formatPrice(subtotal)}</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}
