"use client";

import React from "react";
import FeatureSection from "./components/FeatureSection";
import HeroSection from "./components/HeroSection";
import CTASection from "./components/CTASection";
import HowItWorks from "./components/HowItWorks";
import IntegrationSection from "./components/IntegrationSection";

const Home: React.FC = () => {
  return (
    <div>
      <HeroSection />
      <CTASection />
      <FeatureSection />
      <HowItWorks />
      <IntegrationSection />
    </div>
  );
};

export default Home;
