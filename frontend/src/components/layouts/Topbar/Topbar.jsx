import React from "react";

import {
  Search,
  Bell,
  Moon,
  User,
  Menu,
} from "lucide-react";

import styles from "./Topbar.module.css";

export default function Topbar({ onMenuClick }) {
  return (
    <header className={styles.topbar}>
      {/* Mobile menu */}
      <button
        type="button"
        className={styles.menuButton}
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu size={24} />
      </button>

      {/* Search */}
      <div className={styles.search}>
        <Search size={18} />

        <input
          placeholder="Search reports, scans..."
          aria-label="Search reports and scans"
        />
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button type="button" aria-label="Notifications">
          <Bell />
        </button>

        <button type="button" aria-label="Toggle theme">
          <Moon />
        </button>

        <button type="button" aria-label="Profile">
          <User />
        </button>
      </div>
    </header>
  );
}
