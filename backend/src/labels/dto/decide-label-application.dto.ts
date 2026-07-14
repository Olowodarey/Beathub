import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class DecideLabelApplicationDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status!: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reviewerNote?: string;
}
