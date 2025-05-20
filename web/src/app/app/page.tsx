"use client";

import { ROUTES } from "@/constants/routes";
import useAuth from "@/hooks/useAuth";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import React from "react";
import styles from "./styles.module.scss";
import Steps from "./components/Steps";

const App = () => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Spin fullscreen />;
  }
  if (!isAuthenticated) {
    router.push(ROUTES.LOGIN);
    return;
  }

  return (
    <div className={styles.appContainer}>
      <Steps totalSteps={4} active={0} />
    </div>
  );
};

export default App;
