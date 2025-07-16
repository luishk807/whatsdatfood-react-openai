import { Modal } from "@mui/material";
import { useState, type FC } from "react";
import { CustomModalInterface } from "@/interfaces";
import Button from "@/components/Button";
const CustomModal: FC<CustomModalInterface> = ({ children, label }) => {
  const [open, setOpen] = useState(false);

  const toggleModal = () => {
    setOpen(!open);
  };
  return (
    <>
      <Button onClick={toggleModal}>{label}</Button>
      <Modal
        style={{
          backdropFilter: "blur(2px)",
        }}
        open={open}
        onClose={toggleModal}
      >
        <>{children}</>
      </Modal>
    </>
  );
};

export default CustomModal;
