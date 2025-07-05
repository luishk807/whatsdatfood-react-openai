import { FC } from "react";
import "./index.css";
import NoImage from "../NoImage";
import { ImageInterface } from "@/interfaces";

const Image: FC<ImageInterface> = ({ url, alt }) => {
  if (!url || !alt) {
    return <NoImage />;
  }
  return <img src={url} alt={alt} />;
};

export default Image;
