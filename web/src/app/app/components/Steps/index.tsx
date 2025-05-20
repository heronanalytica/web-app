import React from "react";
import styles from "./styles.module.scss";
import clsx from "clsx";

type Props = {
  totalSteps: number;
  active: number;
};

const Steps: React.FC<Props> = ({ totalSteps, active }) => {
  return (
    <div className={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index <= active;

        return (
          <div
            key={index}
            className={clsx(styles.stepContainer, {
              [styles.stepActive]: isActive,
            })}
          />
        );
      })}
    </div>
  );
};

export default Steps;
