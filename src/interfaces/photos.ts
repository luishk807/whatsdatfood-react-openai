import { MenuItemPhoto } from "@/interfaces/restaurants";

export interface DishPhotoGalleryInterface {
  photos: MenuItemPhoto[];
  loading?: boolean;
  canParticipate?: boolean;
  hasVoted?: (imageId?: string | number) => boolean;
  onVote?: (imageId: string | number) => void;
  onReport?: (imageId: string | number, reason: string) => void;
  onAddPhoto?: (file: File) => void;
  uploading?: boolean;
}

export interface ReportPhotoMenuInterface {
  open: boolean;
  onSelect: (reason: string) => void;
  onCancel: () => void;
}

/** How an upload trigger presents itself; the picker behind it is identical. */
export const UPLOAD_VARIANT = {
  /** Inline text inside a sentence, e.g. beside the stock-photo disclosure. */
  link: "link",
  /** A pill, for a section header or a follow-up prompt. */
  chip: "chip",
  /** Icon above label, filling an empty photo tile. */
  tile: "tile",
} as const;

export type UploadVariant =
  (typeof UPLOAD_VARIANT)[keyof typeof UPLOAD_VARIANT];

export interface PhotoUploadActionInterface {
  onSelect: (file: File) => void;
  label: string;
  /** Replaces the label while a file is in flight. */
  uploadingLabel?: string;
  uploading?: boolean;
  variant?: UploadVariant;
}
