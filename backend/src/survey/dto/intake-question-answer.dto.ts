import {
  IsArray,
  IsString,
  IsNotEmpty,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class IntakeResponseItem {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsDefined()
  answer: string | string[];
}

/**
 * Example payload
 * 
 * {
  response: [
    {
      question: "How are you feeling?",
      answer: "Well"
    },{
      question: "When are you free?",
      answer: ["Monday", "Tuesday"]
    },
  ]
}
 */
export class IntakeQuestionAnswerDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IntakeResponseItem)
  response: IntakeResponseItem[];
}
