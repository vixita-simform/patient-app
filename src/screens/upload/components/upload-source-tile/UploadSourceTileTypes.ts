import type { ReactNode } from "react";

export interface UploadSourceTileProps {
  label: string;
  tone: "green" | "teal";
  icon: ReactNode;
  onPress: () => void;
}
