import { PrismaClient, SurveyIntakeQuestions } from '../../../generated/prisma';
import { DEFAULT_SURVEY_INTAKE_NAME } from '../../../src/survey/survey.constants';

export async function seedSurveyIntakeQuestions(prisma: PrismaClient) {
  const questions = [
    {
      code: 'psychographics',
      question:
        'Do you want to research customer psychographics such as personality traits, attitudes, values, and lifestyles?',
    },
    {
      code: 'brand_behavior',
      question:
        'Do you want to research brand related behavior such as brand awareness, brand loyalty, and purchase behavior?',
    },
    {
      code: 'strategy_recommendation',
      question: 'Do you want recommended strategy for the persona?',
    },
  ];

  const activeQuestionCodes = new Set([
    'psychographics',
    'brand_behavior',
    'strategy_recommendation',
  ]);
  const created: Array<SurveyIntakeQuestions> = [];

  for (const q of questions) {
    const createdQuestion = await prisma.surveyIntakeQuestions.upsert({
      where: { code: q.code },
      update: {},
      create: {
        code: q.code,
        question: q.question,
        type: 'SINGLE',
        options: ['Yes', 'No'],
      },
    });
    created.push(createdQuestion);
  }

  await prisma.surveyIntakeQuestionSet.upsert({
    where: { name: DEFAULT_SURVEY_INTAKE_NAME },
    update: {
      questionIds: created
        .filter((q) => activeQuestionCodes.has(q.code))
        .map((q) => q.id),
      isActive: true,
    },
    create: {
      name: DEFAULT_SURVEY_INTAKE_NAME,
      questionIds: created
        .filter((q) => activeQuestionCodes.has(q.code))
        .map((q) => q.id),
      isActive: true,
    },
  });
}
