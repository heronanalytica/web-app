import React, { PropsWithChildren } from "react";
import styles from "./styles.module.scss";

const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className={styles.layoutContainer}>{children}</div>;
};

export default AppLayout;
