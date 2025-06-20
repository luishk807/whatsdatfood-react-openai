import { FC } from "react";
import "./index.css";
import NoPhotographyOutlinedIcon from "@mui/icons-material/NoPhotographyOutlined";
export interface ImageInterface {
  url?: string | null;
  alt?: string | null;
}
const Image: FC<ImageInterface> = ({ url, alt }) => {
  if (!url || !alt) {
    return <NoPhotographyOutlinedIcon className="no-photo-img" />;
  }
  return <img src={url} alt={alt} />;
};

export default Image;
