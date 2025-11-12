import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "../Modal/Modal.css";
type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const closeOnBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="ModalRoot"
      onMouseDown={closeOnBackdrop}>
      <div className="ModalOverlay"/>
      <div
        className="ModalWindow"
        onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}