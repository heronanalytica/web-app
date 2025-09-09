import React from "react";
import styles from "./loading.module.scss";

const LoadingSession: React.FC = () => (
  <div className={styles.modernLoadingContainer}>
    <div className={styles.modernSpinner} />
    <div className={styles.loadingText}>Loading your session...</div>
  </div>
);

export default LoadingSession;
