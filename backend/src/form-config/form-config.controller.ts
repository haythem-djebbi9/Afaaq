import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FormConfigQueryDto } from './dto/form-config-query.dto';
import { buildFormConfig } from './form-config.data';

@UseGuards(JwtAuthGuard)
@Controller('form-config')
export class FormConfigController {
  @Get()
  get(@Query() query: FormConfigQueryDto) {
    return buildFormConfig(query.service, query.country);
  }
}
