"use client";

import { ROUTES } from "@/constants/routes";
import useAuth from "@/hooks/useAuth";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import React from "react";

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
  return <div>App</div>;
};

export default App;
