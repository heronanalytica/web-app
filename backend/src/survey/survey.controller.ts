import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IntakeQuestionAnswerDto } from './dto/intake-question-answer.dto';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Get('intake-questions')
  async getIntakeQuestions() {
    const questions = await this.surveyService.getIntakeQuestions();
    return { data: questions };
  }

  @Post('intake-questions/answer')
  async answerIntakeQuestion(
    @Req() req: Request,
    @Body() dto: IntakeQuestionAnswerDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return await this.surveyService.saveSurveyIntakeAnswer(userId, dto);
  }
}
