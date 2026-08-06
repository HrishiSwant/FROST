import React from "react";
import styles from "./Button.module.css";

export default function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${styles[variant]}`}
    >
      {children}
    </button>
  );
}