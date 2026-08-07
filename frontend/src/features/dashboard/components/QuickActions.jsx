import Button from "../../../components/ui/Button/Button";
import styles from "./QuickActions.module.css";

export default function QuickActions() {
  return (
    <div className={styles.wrapper}>
      <h2>Quick Actions</h2>

      <div className={styles.buttons}>
        <Button>Scan Media</Button>
        <Button>Verify News</Button>
        <Button>Check Phone</Button>
      </div>
    </div>
  );
}
