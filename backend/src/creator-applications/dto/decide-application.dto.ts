import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class DecideApplicationDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status!: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reviewerNote?: string;
}
