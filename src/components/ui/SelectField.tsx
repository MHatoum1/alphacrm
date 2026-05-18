import React from "react";

interface SelectFieldProps {
  label: string;
  options: string[];
  icon: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, options, icon }) => (
  <div className="form__col">
    <div className="field form__field">
      <div className="field__label">{label}</div>
      <div className="field__wrap">
        <select className="field__select" defaultValue="">
          <option value="" disabled>
            {`Select ${label.toLowerCase()}`}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="field__icon">
          <i className={icon}></i>
        </div>
      </div>
    </div>
  </div>
);

export default SelectField;
