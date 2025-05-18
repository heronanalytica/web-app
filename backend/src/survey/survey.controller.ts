import { Controller, Get } from '@nestjs/common';
import { SurveyService } from './survey.service';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Get('intake-questions')
  getIntakeQuestions() {
    return this.surveyService.getIntakeQuestions();
  }
}
