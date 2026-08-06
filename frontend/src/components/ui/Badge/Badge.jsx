import React from "react";
import styles from "./Badge.module.css";

export default function Badge({
  children,
  type="primary"
}){

    return(

        <span className={`${styles.badge} ${styles[type]}`}>

            {children}

        </span>

    )

}