import { SettingsSection } from "@/customConstants/settings";

export interface SettingsRowInterface {
  section: SettingsSection;
}

export interface SettingsLayoutInterface {
  /** The section title, shown as the page heading on a phone. */
  title: string;
  children: React.ReactNode;
}

export interface SettingsSaveBarInterface {
  canSave: boolean;
  saving: boolean;
  /** `idle` | `saving` | `saved` | `failed`. */
  state: string;
  onSave: () => void;
}
