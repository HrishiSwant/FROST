import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.content}>
          <span className={styles.badge}>FROST SECURITY PLATFORM</span>

          <h1>
            Protect Yourself
            <br />
            From Digital Deception.
          </h1>

          <p>
            FROST helps you detect fake news, identify suspicious phone
            numbers, and analyze images for signs of AI manipulation.
          </p>

          <div className={styles.actions}>
            <button
              className={styles.primaryButton}
              onClick={() => navigate("/dashboard")}
            >
              Get Started
            </button>

            <button
              className={styles.secondaryButton}
              onClick={() => navigate("/about")}
            >
              Learn About FROST
            </button>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.orb}></div>

          <div className={`${styles.card} ${styles.cardOne}`}>
            <span>MEDIA</span>
            <strong>AI Detection</strong>
            <small>Image authenticity analysis</small>
          </div>

          <div className={`${styles.card} ${styles.cardTwo}`}>
            <span>NEWS</span>
            <strong>Trust Analysis</strong>
            <small>Verify suspicious information</small>
          </div>

          <div className={`${styles.card} ${styles.cardThree}`}>
            <span>PHONE</span>
            <strong>Scam Protection</strong>
            <small>Check unknown numbers</small>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div>
          <span>01</span>
          <h3>Media Intelligence</h3>
          <p>
            Analyze images and detect suspicious AI-generated or manipulated
            media.
          </p>
        </div>

        <div>
          <span>02</span>
          <h3>News Intelligence</h3>
          <p>
            Check news and information for credibility and potential
            misinformation.
          </p>
        </div>

        <div>
          <span>03</span>
          <h3>Phone Intelligence</h3>
          <p>
            Analyze unknown phone numbers and identify potential scam risks.
          </p>
        </div>
      </section>
    </main>
  );
}
