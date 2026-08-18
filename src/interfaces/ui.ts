import { ReactNode } from "react";
import { SeverityType } from "@/types";

export interface BottomSheetInterface {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: ReactNode;
}

export interface SnackBarComponentInterface {
  message: string;
  severity?: SeverityType;
  open: boolean;
  onClose: () => void;
}
