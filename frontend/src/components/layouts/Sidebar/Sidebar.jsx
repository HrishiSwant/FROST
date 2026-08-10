import React from "react";

import {
  LayoutDashboard,
  Shield,
  FileText,
  BarChart3,
  Bell,
  Settings,
  X,
  LogOut,
} from "lucide-react";

import styles from "./Sidebar.module.css";
import { logoutUser } from "../../../services/auth/authService";

const items = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    icon: Shield,
    label: "Intelligence",
  },
  {
    icon: FileText,
    label: "Reports",
  },
  {
    icon: BarChart3,
    label: "Analytics",
  },
  {
    icon: Bell,
    label: "Threat Feed",
  },
  {
    icon: Settings,
    label: "Settings",
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const handleLogout = async () => {
    try {
      await logoutUser();

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside
      className={`${styles.sidebar} ${
        isOpen ? styles.mobileOpen : ""
      }`}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logo}>FROST</div>

        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={24} />
        </button>
      </div>

      {/* Navigation */}
      <nav>
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className={styles.link}
              onClick={onClose}
            >
              <Icon size={26} strokeWidth={1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        type="button"
        className={styles.logout}
        onClick={handleLogout}
      >
        <LogOut size={24} strokeWidth={1.8} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
