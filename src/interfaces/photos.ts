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
