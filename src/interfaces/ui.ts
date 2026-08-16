import { ReactNode } from "react";

export interface BottomSheetInterface {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: ReactNode;
}
