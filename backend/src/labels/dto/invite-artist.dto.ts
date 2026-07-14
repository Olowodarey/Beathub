import { IsEmail, MaxLength } from 'class-validator';

export class InviteArtistDto {
  @IsEmail()
  @MaxLength(320)
  email!: string;
}
