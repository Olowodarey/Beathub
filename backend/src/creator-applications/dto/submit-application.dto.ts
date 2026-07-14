import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitApplicationDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
