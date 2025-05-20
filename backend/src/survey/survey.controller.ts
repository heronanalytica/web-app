import { Controller, Get, UseGuards } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Get('intake-questions')
  async getIntakeQuestions() {
    const questions = await this.surveyService.getIntakeQuestions();
    return { data: questions };
  }
}
