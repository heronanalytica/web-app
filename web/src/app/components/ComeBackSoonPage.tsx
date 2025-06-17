"use client";

import React from "react";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import HeronLogo from "./icons/HeronLogo";
import styles from "./combackSoonPageStyle.module.scss";
import { FontPoppins } from "@/assets/fonts/poppins";

function ComeBackSoonPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <HeronLogo />
        </div>
        <Title level={2} className={`${styles.title} ${FontPoppins.className}`}>
          We&apos;ll Be Back Soon
        </Title>
        <Text className={`${styles.subtitle} ${FontPoppins.className}`}>
          We&apos;re upgrading our platform to serve you better.<br/>
          Heron Analytica will be temporarily unavailable during this scheduled maintenance.
        </Text>
        <div className={styles.image} />
        <Text className={`${styles.footer} ${FontPoppins.className}`}>Thank you for your patience.</Text>
      </div>
    </div>
  );
}

export default ComeBackSoonPage;
