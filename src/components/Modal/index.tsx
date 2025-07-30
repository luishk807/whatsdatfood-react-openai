import { Modal, Box } from "@mui/material";
import { useState, useEffect, type FC, useMemo, ChangeEvent } from "react";
import { CustomModalInterface } from "@/interfaces";
import Button from "@/components/Button";
import "./index.css";
import { Link } from "react-router-dom";
const CustomModal: FC<CustomModalInterface> = ({
  children,
  label,
  type,
  customButton,
  closeOnParent,
}) => {
  const [open, setOpen] = useState(false);
  const toggleModal = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setOpen((prev) => !prev);
  };

  const determineType = useMemo(() => {
    return customButton ? "custom" : type || "button";
  }, [customButton]);

  const ModalButton = useMemo(() => {
    switch (determineType) {
      case "button":
        return <Button onClick={toggleModal}>{label}</Button>;
      case "text":
        return <Link to="/">{label || "link label"}</Link>;
      case "link":
        return <Link to="/">{label || "link label"}</Link>;
      case "custom":
        return (
          <Box
            component="div"
            role="button"
            tabIndex={0}
            onClick={toggleModal} // <- this is what was missing
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") toggleModal(e as any);
            }}
          >
            {customButton}
          </Box>
        );
      default:
        return <Button onClick={toggleModal}>{label}</Button>;
    }
  }, [determineType]);

  useEffect(() => {
    if (closeOnParent) {
      setOpen(false);
    }
  }, [closeOnParent]);

  return (
    <>
      {ModalButton}
      <Modal
        style={{
          backdropFilter: "blur(2px)",
        }}
        open={open}
        onClose={toggleModal}
      >
        <Box id="custom-modal-container">{children}</Box>
      </Modal>
    </>
  );
};

export default CustomModal;
