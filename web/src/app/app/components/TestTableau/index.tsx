"use client";

import React, { useState, useRef } from "react";
import { Input, Button, Typography } from "antd";
import styles from "./styles.module.scss";

const { TextArea } = Input;
const { Title } = Typography;

const TableauEmbedder = () => {
  const [scriptInput, setScriptInput] = useState("");
  const [rendered, setRendered] = useState(false);
  const vizContainerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("calc(100vh - 250px)");

  const handleRender = () => {
    const divRegex =
      /<div[^>]*class=['"]tableauPlaceholder['"][\s\S]*?<\/div>/i;
    const objectHtml = scriptInput.match(divRegex)?.[0];

    const widthMatch = scriptInput.match(
      /vizElement\.style\.width\s*=\s*['"](.+?)['"]/
    );
    const heightMatch = scriptInput.match(
      /vizElement\.style\.height\s*=\s*['"](.+?)['"]/
    );

    const parsedWidth = widthMatch?.[1] ?? "100%";
    const parsedHeight = heightMatch?.[1] ?? "100vh";
    setWidth(parsedWidth);
    setHeight(parsedHeight);

    if (!objectHtml || !vizContainerRef.current) {
      alert("Invalid Tableau embed code.");
      return;
    }

    vizContainerRef.current.innerHTML = objectHtml;

    const vizElement = vizContainerRef.current.querySelector("object");
    if (vizElement) {
      (vizElement as HTMLElement).style.width = "100%";
      (vizElement as HTMLElement).style.height = "calc(100vh - 250px)";
    }

    // Inject script
    const script = document.createElement("script");
    script.src = "https://public.tableau.com/javascripts/api/viz_v1.js";
    document.body.appendChild(script);

    setRendered(true);
  };

  return (
    <div className={styles.tableauWrapper}>
      {!rendered && (
        <div className={styles.inputWrapper}>
          <Title level={4}>Paste Tableau Embed Code</Title>
          <TextArea
            rows={10}
            placeholder="Paste your Tableau embed code here"
            value={scriptInput}
            onChange={(e) => setScriptInput(e.target.value)}
          />
          <Button
            type="primary"
            onClick={handleRender}
            style={{ marginTop: 16 }}
          >
            Render Tableau
          </Button>
        </div>
      )}

      <div
        ref={vizContainerRef}
        className={styles.fullscreenViz}
        style={{ width, height }}
      ></div>
    </div>
  );
};

export default TableauEmbedder;
