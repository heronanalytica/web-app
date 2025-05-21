import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { DEFAULT_SURVEY_INTAKE_NAME } from './survey.constants';
import { IntakeQuestionAnswerDto } from './dto/intake-question-answer.dto';

@Injectable()
export class SurveyService {
  constructor(private dbService: DatabaseService) {}

  async getIntakeQuestions() {
    const activeSet = await this.dbService.surveyIntakeQuestionSet.findUnique({
      where: { name: DEFAULT_SURVEY_INTAKE_NAME, isActive: true },
    });

    if (!activeSet || !activeSet.isActive) {
      return [];
    }

    if (activeSet) {
      const questions = this.dbService.surveyIntakeQuestions.findMany({
        where: {
          id: {
            in: activeSet.questionIds,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      return questions;
    }
    return [];
  }

  async saveSurveyIntakeAnswer(userId: string, dto: IntakeQuestionAnswerDto) {
    await this.dbService.surveyIntakeQuestionAnswer.create({
      data: {
        userId,
        response: JSON.stringify(dto.response),
      },
    });

    return { message: 'Survey answers submitted' };
  }
}
