import { useNavigate } from "react-router-dom";

import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import styles from "./ModuleGrid.module.css";

const modules = [
  {
    title: "Media Intelligence",
    description: "Detect AI-generated images, videos and audio.",
    button: "Open Module",
    route: "/dashboard/deepfake",
  },
  {
    title: "News Intelligence",
    description: "Verify news authenticity and credibility.",
    button: "Open Module",
    route: "/dashboard/fake-news",
  },
  {
    title: "Phone Intelligence",
    description: "Analyze unknown numbers and scam risk.",
    button: "Open Module",
    route: "/dashboard/phone",
  },
];

export default function ModuleGrid() {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className={styles.title}>AI Modules</h2>

      <div className={styles.grid}>
        {modules.map((module) => (
          <Card key={module.title}>
            <div className={styles.card}>
              <h3>{module.title}</h3>

              <p>{module.description}</p>

              <Button onClick={() => navigate(module.route)}>
                {module.button}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
