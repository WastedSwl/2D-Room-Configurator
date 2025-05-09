// src/components/Configurator/common/PropertyInput.jsx
import React from "react";

const PropertyInput = ({
  label,
  value,
  onChange,
  type = "text",
  disabled,
  children,
  className,
  inputClassName,
  labelClassName,
  ...props
}) => {
  return (
    <div className={`mb-2 ${className || ""}`}>
      {label && (
        <label
          className={`block text-xs text-gray-400 mb-0.5 ${labelClassName || ""}`}
        >
          {label}
        </label>
      )}
      {children ? (
        React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { disabled })
            : child,
        )
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full p-1.5 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200 focus:ring-1 focus:ring-primary-blue focus:border-primary-blue outline-none ${disabled ? "bg-gray-800 opacity-60 cursor-not-allowed" : ""} ${inputClassName || ""}`}
          {...props}
        />
      )}
    </div>
  );
};

export default PropertyInput;
