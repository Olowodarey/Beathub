import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewCampaignDto {
  @IsIn(['APPROVED', 'REJECTED', 'ACTIVE', 'ENDED'])
  status!: 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'ENDED';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewerNote?: string;
}
