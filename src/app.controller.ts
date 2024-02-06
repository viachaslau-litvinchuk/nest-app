import { Controller, Logger, OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController implements OnModuleInit {
  constructor(private readonly appService: AppService) {}

  async onModuleInit(): Promise<void> {
    Logger.log('User data download initialization...');
    return await this.appService.createCsvs();
  }
}
