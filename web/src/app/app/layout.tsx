import React, { PropsWithChildren } from "react";
import styles from "./styles.module.scss";

type Props = {};

const AppLayout: React.FC<PropsWithChildren<Props>> = ({ children }) => {
  return <div className={styles.layoutContainer}>{children}</div>;
};

export default AppLayout;
