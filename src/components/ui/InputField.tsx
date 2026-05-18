import React from "react";

interface InputFieldProps {
  label: string;
  placeholder?: string;
  icon: string;
  type?: string;
  value?: string;
  readOnly?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder = "Start typing…",
  icon,
  type = "text",
  value,
  readOnly = false,
}) => (
  <div className="form__col">
    <div className="field form__field">
      <div className="field__label">{label}</div>
      <div className="field__wrap">
        <input
          className="field__input"
          type={type}
          placeholder={placeholder}
          value={value}
          readOnly={readOnly}
        />
        <div className="field__icon">
          <i className={icon}></i>
        </div>
      </div>
    </div>
  </div>
);

export default InputField;
