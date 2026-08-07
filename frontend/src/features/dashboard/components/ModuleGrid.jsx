import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import styles from "./ModuleGrid.module.css";

const modules = [
  {
    title: "Media Intelligence",
    description: "Detect AI-generated images, videos and audio.",
    button: "Open Module",
  },
  {
    title: "News Intelligence",
    description: "Verify news authenticity and credibility.",
    button: "Open Module",
  },
  {
    title: "Phone Intelligence",
    description: "Analyze unknown numbers and scam risk.",
    button: "Open Module",
  },
];

export default function ModuleGrid() {
  return (
    <div className={styles.wrapper}>
      <h2>AI Modules</h2>

      <div className={styles.grid}>
        {modules.map((module) => (
          <Card key={module.title}>
            <div className={styles.card}>
              <h3>{module.title}</h3>

              <p>{module.description}</p>

              <Button>{module.button}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
