import { type FC } from "react";
import LegalPage from "@/components/LegalPage";
import {
  PRIVACY_TITLE,
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
} from "@/customConstants/legal";

const Privacy: FC = () => (
  <LegalPage
    title={PRIVACY_TITLE}
    intro={PRIVACY_INTRO}
    sections={PRIVACY_SECTIONS}
  />
);

export default Privacy;
