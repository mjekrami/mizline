"use client";

import type { MenuProduct } from "@mizline/shared";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  headline: string;
  subheadline: string;
  products: MenuProduct[];
  className?: string;
}

export function HeroBanner({
  headline,
  subheadline,
  products,
  className,
}: HeroBannerProps) {
  const thumbnails = products.filter((product) => product.image).slice(0, 2);

  return (
    <div
      className={cn(
        "customer-hero relative mx-5 overflow-visible rounded-3xl px-1 py-2",
        className,
      )}
    >
      <div className="relative z-10 max-w-[62%] py-4 pl-2">
        <p className="customer-hero-headline text-xl font-extrabold leading-tight tracking-tight">
          {headline}{" "}
          <span className="customer-text-accent">{subheadline}</span>
        </p>
      </div>

      {thumbnails.length > 0 ? (
        <div className="pointer-events-none absolute -right-1 top-0 flex h-full items-center gap-2 pr-1">
          {thumbnails.map((product, index) => (
            <div
              key={product.id}
              className={cn(
                "size-[4.5rem] overflow-hidden rounded-2xl border-2 border-card shadow-lg",
                index === 1 && "-translate-y-3 rotate-6",
                index === 0 && "-translate-x-2 -rotate-3",
              )}
              style={{ boxShadow: "var(--customer-float-shadow)" }}
            >
              <ProductImage
                src={product.image}
                alt={product.name}
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
