import { PersonaType, Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail()
  email!: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsEnum(PersonaType)
  personaType?: PersonaType;
}
