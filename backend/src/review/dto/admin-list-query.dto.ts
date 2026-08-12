import { IsDateString, IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { CountryCode, ServiceType } from '../../../generated/prisma/client';

export class AdminListQueryDto {
  @IsOptional()
  @IsIn(['pending', 'approved', 'needs_correction'])
  status?: 'pending' | 'approved' | 'needs_correction';

  @IsOptional()
  @IsEnum(CountryCode)
  country?: CountryCode;

  @IsOptional()
  @IsEnum(ServiceType)
  service?: ServiceType;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
