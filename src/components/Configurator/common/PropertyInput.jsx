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
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    {children || (
      <input
        type={type}
        value={value}
        onChange={onChange}
        step={type === 'number' ? step : undefined}
        className={`w-full p-1.5 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200 focus:ring-1 focus:ring-primary-blue focus:border-primary-blue outline-none placeholder-gray-400 ${disabled ? "bg-gray-800 cursor-not-allowed opacity-60" : ""}`}
        disabled={disabled}
        {...props}
      />
    )}
  </div>
);

PropertyInput.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]).isRequired,
  onChange: PropTypes.func.isRequired,
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.node,
  disabled: PropTypes.bool,
  min: PropTypes.string, 
  max: PropTypes.string,
  title: PropTypes.string,
};

export default PropertyInput;