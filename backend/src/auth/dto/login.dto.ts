import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Adresse e-mail invalide.' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'Mot de passe requis.' })
  password: string;
}
