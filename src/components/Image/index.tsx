import { FC, useEffect } from "react";
import "./index.css";
import NoImage from "../NoImage";
import { ImageInterface } from "@/interfaces/restaurants";

const Image: FC<ImageInterface> = ({ url, alt }) => {
  if (!url) {
    return <NoImage />;
  }

  return <img src={url} alt={alt || "some image"} className="w-full" />;
};

export default Image;
