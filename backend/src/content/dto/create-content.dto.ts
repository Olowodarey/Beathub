import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(60)
  genre!: string;

  @IsOptional()
  @IsIn(['TRACK', 'PODCAST'])
  kind?: 'TRACK' | 'PODCAST';
}
