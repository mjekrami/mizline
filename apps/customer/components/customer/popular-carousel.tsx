"use client";

import type { MenuProduct } from "@mizline/shared";
import { HorizontalProductCard } from "@/components/menu-ui";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface PopularCarouselProps {
  products: MenuProduct[];
  onSelect: (product: MenuProduct) => void;
  onQuickAdd?: (product: MenuProduct) => void;
}

export function PopularCarousel({
  products,
  onSelect,
  onQuickAdd,
}: PopularCarouselProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-3">
        {products.map((product, index) => (
          <CarouselItem key={product.id} className="basis-auto pl-3">
            <HorizontalProductCard
              product={product}
              onSelect={onSelect}
              onQuickAdd={onQuickAdd}
              badge={index === 0 ? "Top pick" : null}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
