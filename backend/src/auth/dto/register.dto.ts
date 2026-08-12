import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Le nom complet est trop court.' })
  @MaxLength(120)
  fullName: string;

  @IsEmail({}, { message: 'Adresse e-mail invalide.' })
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsString()
  @MinLength(8, { message: '8 caractères minimum.' })
  @Matches(/(?=.*[A-Z])(?=.*\d)/, {
    message: 'Le mot de passe doit contenir une majuscule et un chiffre.',
  })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  residence?: string;
}
