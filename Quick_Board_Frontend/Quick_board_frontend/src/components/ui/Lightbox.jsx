// src/components/ui/Lightbox.jsx
import React, { useEffect } from "react";

/*
  Very small lightbox component:
  props: src (image url), alt, isOpen, onClose
*/
export default function Lightbox({ src, alt = "", isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full rounded shadow-lg cursor-zoom-out"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}