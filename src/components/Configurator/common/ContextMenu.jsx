import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ContextMenu = ({ x, y, options, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  if (!options || options.length === 0) return null;

  const menuWidth = 180; 
  const menuHeight = options.length * 35; 
  const adjustedX =
    x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : x;
  const adjustedY =
    y + menuHeight > window.innerHeight
      ? window.innerHeight - menuHeight - 10
      : y;

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.15, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.1, ease: "easeIn" } },
  };

  return (
    <motion.div
      ref={menuRef}
      className="fixed bg-card-bg border border-gray-500 shadow-2xl rounded-lg py-2 z-[100] text-sm text-gray-100 min-w-[200px]"
      style={{ top: adjustedY, left: adjustedX }}
      variants={menuVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {options.map((option, index) => {
        if (option.isSeparator) {
          return (
            <div
              key={`sep-${index}`}
              className="border-t border-gray-600 my-1.5 h-0 p-0"
            ></div>
          );
        }
        return (
          <div
            key={option.label || index}
            onClick={() => {
              if (option.onClick && !option.disabled) {
                option.onClick();
              }
              if (!option.keepOpen) {
                onClose();
              }
            }}
            className={`px-4 py-2 whitespace-nowrap transition-colors duration-150 rounded-md mx-1 ${
              option.disabled
                ? "text-gray-500 cursor-not-allowed"
                : "hover:bg-primary-blue hover:text-white cursor-pointer"
            }`}
          >
            {option.label}
          </div>
        );
      })}
    </motion.div>
  );
};

export default ContextMenu;