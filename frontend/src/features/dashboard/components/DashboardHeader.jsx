import React from "react";
import styles from "./DashboardHeader.module.css";

export default function DashboardHeader() {
  const hour = new Date().getHours();

  let greeting = "Welcome";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  return (
    <div className={styles.header}>
      <div>
        <h1>{greeting} 👋</h1>
        <p>Welcome back to FROST Security Center</p>
      </div>
    </div>
  );
}
