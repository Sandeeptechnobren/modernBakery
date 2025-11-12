"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";

type ImagePreviewModalProps = {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  startIndex?: number;
};

export default function ImagePreviewModal({
  images,
  isOpen,
  onClose,
  startIndex = 0,
}: ImagePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    if (isOpen) setCurrentIndex(startIndex);
  }, [isOpen, startIndex]);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  if (!images?.length) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-100 flex items-center justify-center z-50 bg-black/20 px-4 backdrop-blur-[24px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* White Modal Box */}
          <motion.div
            className="
              relative bg-white rounded-2xl shadow-2xl
              w-[90%] max-w-[800px]
              h-[80vh] flex flex-col items-center justify-center
              overflow-hidden
            "
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button (top-right) */}
            <button
              onClick={onClose}
              className="absolute flex items-center bg-gray-200 rounded-bl-full p-5 pt-3 pr-3 top-0 right-0 text-black hover:border-red-500 hover:bg-red-500 hover:text-white hover:cursor-pointer transition"
            >
              <Icon icon="mdi:close" width={30} />
            </button>

            {/* Image */}
            <motion.img
              key={currentIndex}
              src={
                images[currentIndex].startsWith("http") || images[currentIndex].startsWith("blob:")
                  ? images[currentIndex]
                  : `/uploads/${images[currentIndex]}`
              }
              alt={`Preview ${currentIndex + 1}`}
              className="max-h-[70vh] w-auto object-contain rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-100 hover:bg-gray-200 p-2 rounded-full shadow"
                >
                  <Icon
                    icon="mdi:chevron-left"
                    width={30}
                    className="text-gray-800"
                  />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-100 hover:bg-gray-200 p-2 rounded-full shadow"
                >
                  <Icon
                    icon="mdi:chevron-right"
                    width={30}
                    className="text-gray-800"
                  />
                </button>

                <div className="absolute bottom-3 text-sm text-gray-500">
                  Image {currentIndex + 1} of {images.length}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
