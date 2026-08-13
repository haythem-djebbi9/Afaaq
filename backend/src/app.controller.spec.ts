import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const appService = { checkHealth: jest.fn().mockResolvedValue({ status: 'ok', timestamp: 'now' }) };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return an ok status', async () => {
      await expect(appController.health()).resolves.toEqual({ status: 'ok', timestamp: 'now' });
    });
  });
});
