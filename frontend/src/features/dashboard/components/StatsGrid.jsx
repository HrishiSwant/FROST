import Card from "../../../components/ui/Card/Card";
import styles from "./StatsGrid.module.css";

const stats = [
  { title: "Media Scans", value: 24 },
  { title: "News Checks", value: 18 },
  { title: "Phone Checks", value: 12 },
  { title: "Reports", value: 9 },
];

export default function StatsGrid() {
  return (
    <div className={styles.grid}>
      {stats.map((item) => (
        <Card key={item.title}>
          <div className={styles.item}>
            <h3>{item.title}</h3>
            <h1>{item.value}</h1>
          </div>
        </Card>
      ))}
    </div>
  );
}
