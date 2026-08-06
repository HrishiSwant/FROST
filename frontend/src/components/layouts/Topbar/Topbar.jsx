import React from "react";
import {

Search,

Bell,

Moon,

User

}

from "lucide-react";

import styles from "./Topbar.module.css";

export default function Topbar(){

return(

<header className={styles.topbar}>

<div className={styles.search}>

<Search size={18}/>

<input

placeholder="Search reports, scans..."

 />

</div>

<div className={styles.actions}>

<Bell/>

<Moon/>

<User/>

</div>

</header>

)

}