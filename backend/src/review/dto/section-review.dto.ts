import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class SectionReviewDto {
  @IsIn(['APPROVED', 'NEEDS_CORRECTION'])
  status: 'APPROVED' | 'NEEDS_CORRECTION';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  remark?: string;
}
