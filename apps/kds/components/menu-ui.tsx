"use client";

import type {
  MenuModifierGroup,
  MenuProduct,
  MenuVariant,
} from "@mizline/shared";
import { formatPrice } from "@mizline/shared";
import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductImage } from "@/components/product-image";
import type { CartModifier } from "@/lib/cart";
import { computeUnitPrice } from "@/lib/cart";
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
      className="customer-detail-view fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 p-0 backdrop:bg-black/30"
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

        <div className="customer-detail-sheet flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6">
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

        <div className="customer-detail-footer shrink-0 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
