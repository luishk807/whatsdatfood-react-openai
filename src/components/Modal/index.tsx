import { Modal, Box } from "@mui/material";
import { useState, useEffect, type FC, useMemo, ChangeEvent } from "react";
import { CustomModalInterface } from "@/interfaces";
import Button from "@/components/Button";
import "./index.css";
const CustomModal: FC<CustomModalInterface> = ({
  children,
  label,
  customButton,
  closeOnParent,
}) => {
  const [open, setOpen] = useState(false);
  const toggleModal = (e: React.MouseEvent<HTMLElement>) => {
    console.log("xxxx");
    e.preventDefault();
    e.stopPropagation();

    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (closeOnParent) {
      setOpen(false);
    }
  }, [closeOnParent]);

  return (
    <>
      {customButton ? (
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
      ) : (
        <Button onClick={toggleModal}>{label}</Button>
      )}
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
