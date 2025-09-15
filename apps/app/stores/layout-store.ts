import { create } from "zustand";

interface LayoutState {
  collapsible: "icon" | "offcanvas" | "none";
  variant: "sidebar" | "floating" | "inset";
  setCollapsible: (collapsible: "icon" | "offcanvas" | "none") => void;
  setVariant: (variant: "sidebar" | "floating" | "inset") => void;
}

export const useLayoutStore = create<LayoutState>()((set) => ({
  collapsible: "icon",
  variant: "floating",
  setCollapsible: (collapsible) => set((state) => ({ ...state, collapsible })),
  setVariant: (variant) => set((state) => ({ ...state, variant })),
}));
