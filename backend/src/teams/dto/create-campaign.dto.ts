import { AdSlotType } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, Min } from 'class-validator';

export class CreateCampaignDto {
  @IsEnum(AdSlotType)
  slotType!: AdSlotType;

  @IsInt()
  @Min(1)
  budgetUsd!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
