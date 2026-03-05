import React, { useRef, useState, type InputHTMLAttributes } from 'react';

import styles from './Input.module.scss';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  iconEnd?: React.ReactNode;
  invalid?: boolean;
};

const Input: React.FC<InputProps> = ({ icon, iconEnd, invalid, ...props }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasValue, setHasValue] = useState(false);
  const [inputType, setInputType] = useState(props.type);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);

    if (props.onChange) {
      props.onChange(e);
    }
  };

  const togglePasswordVisibility = () =>
    setInputType(prev => (prev === 'password' ? 'text' : 'password'));

  return (
    <div
      className={`relative ${styles.iconInput} ${invalid ? styles.invalid : ''} ${iconEnd || inputType === 'password' ? styles.endIcon : ''}`}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <input ref={inputRef} {...props} onChange={handleChange} type={inputType} />
      {props.type === 'password' && hasValue ? (
        <span
          role="button"
          tabIndex={0}
          className={`${styles.iconEnd} cursor-pointer ${styles.toggle}`}
          onClick={togglePasswordVisibility}
        >
          {inputType === 'password' ? (
            <i className="fa-solid fa-eye"></i>
          ) : (
            <i className="fa-solid fa-eye-slash"></i>
          )}
        </span>
      ) : iconEnd ? (
        <span className={styles.iconEnd}>{iconEnd}</span>
      ) : null}
    </div>
  );
};

export default Input;
