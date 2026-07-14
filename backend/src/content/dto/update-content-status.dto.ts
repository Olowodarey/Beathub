import { IsIn } from 'class-validator';

export class UpdateContentStatusDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status!: 'APPROVED' | 'REJECTED';
}
