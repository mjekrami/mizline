"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface KitchenDndProviderProps {
  children: React.ReactNode;
}

export function KitchenDndProvider({ children }: KitchenDndProviderProps) {
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
}
