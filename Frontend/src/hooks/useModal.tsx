import { useState, useCallback } from "react";
import { Modal } from "../components/Modal";

interface UseModalProps {
  height?: string;
  width?: string;
  closeOnOutsideClick?: boolean;
}

export function useModal({
  height,
  width,
  closeOnOutsideClick,
}: UseModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const ModalComponent = useCallback(
    (props: {
      children: React.ReactNode;
      title?: string;
      showCloseButton?: boolean;
    }) => (
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        height={height}
        width={width}
        closeOnOutsideClick={closeOnOutsideClick}
        {...props}
      />
    ),
    [isOpen, closeModal, height, width, closeOnOutsideClick]
  );

  return {
    Modal: ModalComponent,
    openModal,
    closeModal,
    isOpen,
  };
}