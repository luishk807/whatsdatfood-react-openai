import { type FC } from "react";
import LegalPage from "@/components/LegalPage";
import {
  TERMS_TITLE,
  TERMS_INTRO,
  TERMS_SECTIONS,
} from "@/customConstants/legal";

const Terms: FC = () => (
  <LegalPage title={TERMS_TITLE} intro={TERMS_INTRO} sections={TERMS_SECTIONS} />
);

export default Terms;
