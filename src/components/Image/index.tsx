import { FC } from "react";
import "./index.css";
import NoImage from "../NoImage";
export interface ImageInterface {
  url?: string | null;
  alt?: string | null;
}
const Image: FC<ImageInterface> = ({ url, alt }) => {
  if (!url || !alt) {
    return <NoImage />;
  }
  return <img src={url} alt={alt} />;
};

export default Image;
