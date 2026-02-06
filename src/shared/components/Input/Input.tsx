import React, { type InputHTMLAttributes } from 'react';

import styles from './Input.module.scss';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  iconEnd?: React.ReactNode;
  invalid?: boolean;
};

const Input: React.FC<InputProps> = ({ icon, iconEnd, invalid, ...props }) => {
  return (
    <div className={`relative ${invalid ? styles.invalid : ''}`}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <input {...props} />
      {iconEnd && <span className={styles.iconEnd}>{iconEnd}</span>}
    </div>
  );
};

export default Input;
