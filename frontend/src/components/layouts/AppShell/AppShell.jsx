import React, { useState } from "react";

import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";
import Content from "../Content/Content";

import styles from "./AppShell.module.css";

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.shell}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={styles.main}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <Content>
          {children}
        </Content>
      </div>
    </div>
  );
}
