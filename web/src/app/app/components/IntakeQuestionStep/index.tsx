import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import clsx from "clsx";
import { FontInter } from "@/assets/fonts/inter";
import { fetcher } from "@/lib/fetcher";
import { SurveyIntakeQuestion } from "@/types/survey";
import { Typography } from "antd";

const IntakeQuestionStep = () => {
  const [questions, setQuestions] = useState<SurveyIntakeQuestion[]>([]);
  const fetchIntakeQuestion = async () => {
    try {
      const data = await fetcher.get<SurveyIntakeQuestion[]>(
        "/api/survey/intake-questions"
      );
      setQuestions(data);
    } catch (err: any) {
      console.error("Failed to fetch intake questions:", err.message);
    }
  };

  useEffect(() => {
    fetchIntakeQuestion();
  }, []);

  const renderQuestions = () => {
    if (!questions.length) {
      return null;
    }

    return questions.map((question, index) => {
      return (
        <div key={question.id} className={styles.questionCard}>
          <Typography.Text>
            {index + 1}.&nbsp;{question.question}
          </Typography.Text>
        </div>
      );
    });
  };

  return (
    <div className={styles.container}>
      <div className={clsx(styles.intro, FontInter.className)}>
        Surveys are crucial for building customer personas because they provide
        direct, self-reported insights into consumer behavior, attitudes, and
        motivations.
        <br />
        Please select options that best describe your goals and let us generate
        a customized questionnaire tailored to your needs.
        <br />
        Demographic question is included by default.
      </div>
      {renderQuestions()}
    </div>
  );
};

export default IntakeQuestionStep;
