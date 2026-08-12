import { IsArray, IsObject, IsOptional } from 'class-validator';

export class UpdateApplicationDataDto {
  @IsOptional()
  @IsObject()
  personal?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  passport?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  languages?: unknown[];

  @IsOptional()
  @IsArray()
  education?: unknown[];

  @IsOptional()
  @IsArray()
  trainings?: unknown[];

  @IsOptional()
  @IsArray()
  experience?: unknown[];

  @IsOptional()
  @IsObject()
  objective?: Record<string, unknown>;
}
