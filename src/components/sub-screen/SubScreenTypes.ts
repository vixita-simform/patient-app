import type { ReactNode } from "react";

export interface SubScreenProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  children: ReactNode;
}
