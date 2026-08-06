import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";
import Content from "../Content/Content";

import styles from "./AppShell.module.css";

export default function AppShell({children}){

return(

<div className={styles.shell}>

<Sidebar/>

<div className={styles.main}>

<Topbar/>

<Content>

{children}

</Content>

</div>

</div>

)

}