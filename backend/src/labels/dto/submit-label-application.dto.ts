import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitLabelApplicationDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  labelName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
