// src/components/Configurator/common/PropertyInput.jsx
import React from "react";
import PropTypes from "prop-types";

const PropertyInput = ({
  label,
  type = "number",
  value,
  onChange,
  step = 0.01,
  children,
  disabled,
  ...props
}) => (
  <div className="mb-2">
    <label className="block text-xs text-gray-600 mb-1">{label}</label>
    {children || (
      <input
        type={type}
        value={value}
        onChange={onChange}
        step={step}
        className={`w-full p-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        disabled={disabled}
        {...props}
      />
    )}
  </div>
);

PropertyInput.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.node,
  disabled: PropTypes.bool,
  min: PropTypes.string, // Added missing prop types
  max: PropTypes.string,
  title: PropTypes.string,
};

export default PropertyInput;
