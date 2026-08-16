import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import styles from "./ModuleGrid.module.css";

const modules = [
  // ===== Available Modules =====

  {
    title: "Media Intelligence",
    description: "Detect AI-generated images, videos and audio.",
    button: "Open Module",
    route: "/deepfake",
    available: true,
  },

  {
    title: "News Intelligence",
    description: "Verify news authenticity and credibility.",
    button: "Open Module",
    route: "/news",
    available: true,
  },

  {
    title: "Phone Intelligence",
    description: "Analyze unknown numbers and scam risk.",
    button: "Open Module",
    route: "/phone",
    available: true,
  },

  {
    title: "Malware Intelligence",
    description:
      "Analyze URLs and malware indicators using VirusTotal AI.",
    button: "Open Module",
    route: "/intelligence/malware",
    available: true,
  },

  // ===== Coming Soon =====

  {
    title: "Email Intelligence",
    description:
      "Analyze suspicious emails and phishing attempts.",
    button: "Coming Soon",
    available: false,
  },

  {
    title: "Domain Intelligence",
    description:
      "Investigate domains using DNS, WHOIS and reputation.",
    button: "Coming Soon",
    available: false,
  },

  {
    title: "Threat Intelligence",
    description:
      "Correlate multiple threat intelligence feeds.",
    button: "Coming Soon",
    available: false,
  },

  {
    title: "APK Intelligence",
    description:
      "Analyze Android applications for malware.",
    button: "Coming Soon",
    available: false,
  },

  {
    title: "Dark Web Intelligence",
    description:
      "Search breach and dark web intelligence.",
    button: "Coming Soon",
    available: false,
  },

  {
    title: "AI Investigation",
    description:
      "Generate complete AI-powered investigation reports.",
    button: "Coming Soon",
    available: false,
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

              <Button
                disabled={!module.available}
                onClick={() => {
                  if (module.available) {
                    navigate(module.route);
                  }
                }}
              >
                {module.button}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
