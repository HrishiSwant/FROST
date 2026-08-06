import React from "react";
import {
  LayoutDashboard,
  Shield,
  FileText,
  BarChart3,
  Bell,
  Settings
} from "lucide-react";

import styles from "./Sidebar.module.css";

const items = [

  {
    icon: LayoutDashboard,
    label: "Dashboard"
  },

  {
    icon: Shield,
    label: "Intelligence"
  },

  {
    icon: FileText,
    label: "Reports"
  },

  {
    icon: BarChart3,
    label: "Analytics"
  },

  {
    icon: Bell,
    label: "Threat Feed"
  },

  {
    icon: Settings,
    label: "Settings"
  }

];

export default function Sidebar(){

return(

<aside className={styles.sidebar}>

<div className={styles.logo}>

FROST

</div>

<nav>

{

items.map(item=>{

const Icon=item.icon;

return(

<button

key={item.label}

className={styles.link}

>

<Icon size={20}/>

<span>

{item.label}

</span>

</button>

)

})

}

</nav>

</aside>

)

}