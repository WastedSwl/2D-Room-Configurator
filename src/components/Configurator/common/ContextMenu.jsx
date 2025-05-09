// src/components/Configurator/common/ContextMenu.jsx
import React, { useEffect, useRef } from "react";

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

  // Adjust position if menu would go off-screen
  const menuWidth = 180; // Approximate width, adjust as needed
  const menuHeight = options.length * 35; // Approximate height
  const adjustedX =
    x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : x;
  const adjustedY =
    y + menuHeight > window.innerHeight
      ? window.innerHeight - menuHeight - 10
      : y;

  return (
    <div
      ref={menuRef}
      className="fixed bg-card-bg border border-gray-600 shadow-2xl rounded-md py-1 z-[100] text-sm text-gray-200 min-w-[180px]"
      style={{ top: adjustedY, left: adjustedX }}
    >
      {options.map((option, index) => {
        if (option.isSeparator) {
          return (
            <div
              key={`sep-${index}`}
              className="border-t border-gray-600 my-1 h-0 p-0"
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
                // Allow some options to keep menu open if needed
                onClose();
              }
            }}
            className={`px-3 py-1.5 whitespace-nowrap ${
              option.disabled
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-700 cursor-pointer"
            }`}
          >
            {option.label}
          </div>
        );
      })}
    </div>
  );
};

export default ContextMenu;
