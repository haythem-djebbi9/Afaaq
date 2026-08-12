import { IsEnum } from 'class-validator';
import { CountryCode, ServiceType } from '../../../generated/prisma/client';

export class CreateApplicationDto {
  @IsEnum(ServiceType)
  service: ServiceType;

  @IsEnum(CountryCode)
  country: CountryCode;
}
