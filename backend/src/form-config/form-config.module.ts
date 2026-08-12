import { Module } from '@nestjs/common';
import { FormConfigController } from './form-config.controller';

@Module({
  controllers: [FormConfigController],
})
export class FormConfigModule {}
