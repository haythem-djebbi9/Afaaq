import { IsEnum } from 'class-validator';
import { CountryCode, ServiceType } from '../../../generated/prisma/client';

export class FormConfigQueryDto {
  @IsEnum(ServiceType)
  service: ServiceType;

  @IsEnum(CountryCode)
  country: CountryCode;
}
