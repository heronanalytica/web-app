"use client";

import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import clsx from "clsx";
import { FontInter } from "@/assets/fonts/inter";
import { fetcher } from "@/lib/fetcher";
import { SurveyIntakeQuestion } from "@/types/survey";
import { Button, Typography, Radio, Input } from "antd";
import { SURVEY_INTAKE_QUESTION_TYPE } from "@/constants/survey";
import { ArrowRightOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const IntakeQuestionStep = () => {
  const [questions, setQuestions] = useState<SurveyIntakeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[] | string>>({});

  useEffect(() => {
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
    fetchIntakeQuestion();
  }, []);

  const handleAnswerChange = (id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const toggleMultipleChoice = (questionId: string, option: string) => {
    const prev = answers[questionId] as string[] | undefined;
    if (prev?.includes(option)) {
      handleAnswerChange(
        questionId,
        prev.filter((opt) => opt !== option)
      );
    } else {
      handleAnswerChange(questionId, [...(prev || []), option]);
    }
  };

  const renderInput = (question: SurveyIntakeQuestion) => {
    switch (question.type) {
      case SURVEY_INTAKE_QUESTION_TYPE.SINGLE:
        return (
          <Radio.Group
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            value={answers[question.id]}
          >
            {question.options?.map((opt) => (
              <div key={opt} className={styles.questionOption}>
                <Radio value={opt}>{opt}</Radio>
              </div>
            ))}
          </Radio.Group>
        );

      case SURVEY_INTAKE_QUESTION_TYPE.MULTIPLE:
        return (
          <div>
            {question.options?.map((opt) => (
              <div key={opt} className={styles.questionOption}>
                <Radio
                  checked={(
                    answers[question.id] as string[] | undefined
                  )?.includes(opt)}
                  onClick={() => toggleMultipleChoice(question.id, opt)}
                >
                  {opt}
                </Radio>
              </div>
            ))}
          </div>
        );

      case SURVEY_INTAKE_QUESTION_TYPE.TEXT:
        return (
          <TextArea
            rows={4}
            value={answers[question.id] as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );

      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    console.log("Submitting answers:", answers);
    // try {
    //   await fetcher.post("/api/survey/generate-questionnaire", answers); // Placeholder
    //   message.success("Questionnaire generated successfully!");
    // } catch (err: any) {
    //   message.error(err.message || "Submission failed");
    // }
  };

  const renderQuestions = () => {
    return questions.map((question, index) => (
      <div key={question.id} className={styles.questionCard}>
        <Typography.Text strong>
          {index + 1}. {question.question}
        </Typography.Text>
        <div
          className={clsx(
            styles.questionInputContainer,
            "questionCardContainer"
          )}
        >
          {renderInput(question)}
        </div>
      </div>
    ));
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

      {questions.length > 0 && (
        <div className={styles.submitButtonWrapper}>
          <Button
            type="primary"
            onClick={handleSubmit}
            className={styles.submitButton}
            iconPosition="end"
            icon={<ArrowRightOutlined style={{ fontSize: "20px" }} />}
          >
            Generate Questionnaire
          </Button>
        </div>
      )}
    </div>
  );
};

export default IntakeQuestionStep;
