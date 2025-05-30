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
          className={`w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none transition-colors duration-150 placeholder-gray-500 ${disabled ? "bg-gray-800 opacity-70 cursor-not-allowed" : "hover:border-gray-500"} ${inputClassName || ""}`}
          {...props}
        />
      )}
    </div>
  );
};

export default PropertyInput;