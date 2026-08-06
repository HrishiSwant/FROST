import React from "react";
import styles from "./Content.module.css";

export default function Content({ children }) {
  return (
    <section className={styles.content}>
      {children}
    </section>
  );
}